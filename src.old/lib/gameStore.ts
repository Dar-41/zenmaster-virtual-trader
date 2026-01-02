import { create } from 'zustand';
import type { StateCreator } from 'zustand';
import { 
  GameRoom, 
  Player, 
  Position, 
  Trade, 
  Stock, 
  MarketScenario,
  CandleData,
  GAME_CONFIG,
  INDIAN_STOCKS,
  MARKET_SCENARIOS,
  generateRoomCode
} from './gameTypes';
import { MarketEngine, generateInitialCandles } from './marketEngine';

interface GameState {
  // Room state
  currentRoom: GameRoom | null;
  currentPlayer: Player | null;
  isAdmin: boolean;
  
  // Market state
  marketEngines: Map<string, MarketEngine>;
  candleHistory: Map<string, CandleData[]>;
  currentPrices: Map<string, number>;
  
  // Game state
  timeRemaining: number;
  isGameActive: boolean;
  leaderboard: Player[];
  
  // Actions
  createRoom: (stocks: Stock[], scenario: MarketScenario) => string;
  joinRoom: (roomCode: string, playerName: string) => boolean;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  toggleLock: () => void;
  
  // Trading actions
  executeBuy: (stockSymbol: string, quantity: number) => boolean;
  executeSell: (stockSymbol: string, quantity: number) => boolean;
  executeShort: (stockSymbol: string, quantity: number) => boolean;
  executeCover: (stockSymbol: string, quantity: number) => boolean;
  
  // Market simulation
  tick: () => void;
  injectVolatility: () => void;
  injectFakeBreakout: () => void;
  injectNewsCandle: () => void;
  
  // Utils
  updateTimeRemaining: (ms: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentRoom: null,
  currentPlayer: null,
  isAdmin: false,
  marketEngines: new Map(),
  candleHistory: new Map(),
  currentPrices: new Map(),
  timeRemaining: GAME_CONFIG.GAME_DURATION_MS,
  isGameActive: false,
  leaderboard: [],

  createRoom: (stocks, scenario) => {
    const roomCode = generateRoomCode();
    const scenarioConfig = MARKET_SCENARIOS.find(s => s.id === scenario)!;
    
    // Initialize market engines
    const engines = new Map<string, MarketEngine>();
    const history = new Map<string, CandleData[]>();
    const prices = new Map<string, number>();
    
    stocks.forEach(stock => {
      const engine = new MarketEngine(stock, scenarioConfig);
      engines.set(stock.symbol, engine);
      
      // Generate initial history
      const initialCandles = generateInitialCandles(stock, scenarioConfig, 60);
      history.set(stock.symbol, initialCandles);
      prices.set(stock.symbol, initialCandles[initialCandles.length - 1].close);
    });
    
    const adminPlayer: Player = {
      id: 'admin-' + Date.now(),
      name: 'Admin',
      balance: GAME_CONFIG.INITIAL_BALANCE,
      positions: [],
      trades: [],
      pnl: 0,
      roi: 0,
      isConnected: true,
      joinedAt: Date.now(),
    };
    
    const room: GameRoom = {
      id: 'room-' + Date.now(),
      code: roomCode,
      adminId: adminPlayer.id,
      status: 'waiting',
      stocks,
      scenario,
      players: [adminPlayer],
      isLocked: false,
    };
    
    set({
      currentRoom: room,
      currentPlayer: adminPlayer,
      isAdmin: true,
      marketEngines: engines,
      candleHistory: history,
      currentPrices: prices,
      timeRemaining: GAME_CONFIG.GAME_DURATION_MS,
    });
    
    return roomCode;
  },

  joinRoom: (roomCode, playerName) => {
    const { currentRoom } = get();
    
    // In a real app, this would fetch from server
    // For demo, we simulate joining
    if (!currentRoom || currentRoom.code !== roomCode) {
      return false;
    }
    
    if (currentRoom.isLocked) {
      return false;
    }
    
    if (currentRoom.players.length >= GAME_CONFIG.MAX_PLAYERS) {
      return false;
    }
    
    const newPlayer: Player = {
      id: 'player-' + Date.now(),
      name: playerName,
      balance: GAME_CONFIG.INITIAL_BALANCE,
      positions: [],
      trades: [],
      pnl: 0,
      roi: 0,
      isConnected: true,
      joinedAt: Date.now(),
    };
    
    set({
      currentRoom: {
        ...currentRoom,
        players: [...currentRoom.players, newPlayer],
      },
      currentPlayer: newPlayer,
      isAdmin: false,
    });
    
    return true;
  },

  startGame: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    
    set({
      currentRoom: {
        ...currentRoom,
        status: 'playing',
        startTime: Date.now(),
      },
      isGameActive: true,
      timeRemaining: GAME_CONFIG.GAME_DURATION_MS,
    });
  },

  pauseGame: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    
    set({
      currentRoom: {
        ...currentRoom,
        status: 'paused',
      },
      isGameActive: false,
    });
  },

  endGame: () => {
    const { currentRoom, currentPlayer } = get();
    if (!currentRoom) return;
    
    // Square off all positions and calculate final P&L
    const updatedPlayers = currentRoom.players.map(player => {
      let totalPnl = player.pnl;
      
      // Calculate unrealized P&L from positions
      player.positions.forEach(pos => {
        totalPnl += pos.unrealizedPnl;
      });
      
      return {
        ...player,
        pnl: totalPnl,
        roi: (totalPnl / GAME_CONFIG.INITIAL_BALANCE) * 100,
        positions: [],
      };
    });
    
    // Sort by P&L for leaderboard
    const leaderboard = [...updatedPlayers].sort((a, b) => b.pnl - a.pnl);
    
    set({
      currentRoom: {
        ...currentRoom,
        status: 'ended',
        endTime: Date.now(),
        players: updatedPlayers,
      },
      isGameActive: false,
      leaderboard,
      currentPlayer: updatedPlayers.find(p => p.id === currentPlayer?.id) || null,
    });
  },

  toggleLock: () => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    
    set({
      currentRoom: {
        ...currentRoom,
        isLocked: !currentRoom.isLocked,
      },
    });
  },

  executeBuy: (stockSymbol, quantity) => {
    const { currentRoom, currentPlayer, currentPrices } = get();
    if (!currentRoom || !currentPlayer) return false;
    
    const price = currentPrices.get(stockSymbol) || 0;
    const totalCost = price * quantity;
    
    if (currentPlayer.balance < totalCost) return false;
    
    const existingPosition = currentPlayer.positions.find(p => p.stockSymbol === stockSymbol);
    
    let newPositions: Position[];
    if (existingPosition) {
      if (existingPosition.quantity < 0) {
        // Covering short
        const coverQty = Math.min(Math.abs(existingPosition.quantity), quantity);
        const remainingQty = quantity - coverQty;
        
        const newQty = existingPosition.quantity + quantity;
        if (newQty === 0) {
          newPositions = currentPlayer.positions.filter(p => p.stockSymbol !== stockSymbol);
        } else {
          newPositions = currentPlayer.positions.map(p =>
            p.stockSymbol === stockSymbol
              ? {
                  ...p,
                  quantity: newQty,
                  avgPrice: newQty > 0 ? price : p.avgPrice,
                  currentPrice: price,
                  unrealizedPnl: newQty * (price - (newQty > 0 ? price : p.avgPrice)),
                }
              : p
          );
        }
      } else {
        // Adding to long position
        const newQty = existingPosition.quantity + quantity;
        const newAvg = (existingPosition.avgPrice * existingPosition.quantity + price * quantity) / newQty;
        newPositions = currentPlayer.positions.map(p =>
          p.stockSymbol === stockSymbol
            ? {
                ...p,
                quantity: newQty,
                avgPrice: newAvg,
                currentPrice: price,
                unrealizedPnl: newQty * (price - newAvg),
              }
            : p
        );
      }
    } else {
      newPositions = [
        ...currentPlayer.positions,
        {
          stockSymbol,
          quantity,
          avgPrice: price,
          currentPrice: price,
          unrealizedPnl: 0,
        },
      ];
    }
    
    const trade: Trade = {
      id: 'trade-' + Date.now(),
      stockSymbol,
      type: 'buy',
      quantity,
      price,
      timestamp: Date.now(),
    };
    
    const updatedPlayer = {
      ...currentPlayer,
      balance: currentPlayer.balance - totalCost,
      positions: newPositions,
      trades: [...currentPlayer.trades, trade],
    };
    
    set({
      currentPlayer: updatedPlayer,
      currentRoom: {
        ...currentRoom,
        players: currentRoom.players.map(p =>
          p.id === currentPlayer.id ? updatedPlayer : p
        ),
      },
    });
    
    return true;
  },

  executeSell: (stockSymbol, quantity) => {
    const { currentRoom, currentPlayer, currentPrices } = get();
    if (!currentRoom || !currentPlayer) return false;
    
    const price = currentPrices.get(stockSymbol) || 0;
    const existingPosition = currentPlayer.positions.find(p => p.stockSymbol === stockSymbol);
    
    if (!existingPosition || existingPosition.quantity < quantity) return false;
    
    const pnl = (price - existingPosition.avgPrice) * quantity;
    const newQty = existingPosition.quantity - quantity;
    
    let newPositions: Position[];
    if (newQty === 0) {
      newPositions = currentPlayer.positions.filter(p => p.stockSymbol !== stockSymbol);
    } else {
      newPositions = currentPlayer.positions.map(p =>
        p.stockSymbol === stockSymbol
          ? {
              ...p,
              quantity: newQty,
              currentPrice: price,
              unrealizedPnl: newQty * (price - p.avgPrice),
            }
          : p
      );
    }
    
    const trade: Trade = {
      id: 'trade-' + Date.now(),
      stockSymbol,
      type: 'sell',
      quantity,
      price,
      timestamp: Date.now(),
      pnl,
    };
    
    const updatedPlayer = {
      ...currentPlayer,
      balance: currentPlayer.balance + price * quantity,
      positions: newPositions,
      trades: [...currentPlayer.trades, trade],
      pnl: currentPlayer.pnl + pnl,
    };
    
    set({
      currentPlayer: updatedPlayer,
      currentRoom: {
        ...currentRoom,
        players: currentRoom.players.map(p =>
          p.id === currentPlayer.id ? updatedPlayer : p
        ),
      },
    });
    
    return true;
  },

  executeShort: (stockSymbol, quantity) => {
    const { currentRoom, currentPlayer, currentPrices } = get();
    if (!currentRoom || !currentPlayer) return false;
    
    const price = currentPrices.get(stockSymbol) || 0;
    const marginRequired = price * quantity * 0.5; // 50% margin
    
    if (currentPlayer.balance < marginRequired) return false;
    
    const existingPosition = currentPlayer.positions.find(p => p.stockSymbol === stockSymbol);
    
    let newPositions: Position[];
    if (existingPosition) {
      const newQty = existingPosition.quantity - quantity;
      const newAvg = newQty < 0
        ? (existingPosition.avgPrice * Math.abs(existingPosition.quantity) + price * quantity) / Math.abs(newQty)
        : existingPosition.avgPrice;
      
      newPositions = currentPlayer.positions.map(p =>
        p.stockSymbol === stockSymbol
          ? {
              ...p,
              quantity: newQty,
              avgPrice: newAvg,
              currentPrice: price,
              unrealizedPnl: newQty * (newQty > 0 ? (price - newAvg) : (newAvg - price)),
            }
          : p
      );
    } else {
      newPositions = [
        ...currentPlayer.positions,
        {
          stockSymbol,
          quantity: -quantity,
          avgPrice: price,
          currentPrice: price,
          unrealizedPnl: 0,
        },
      ];
    }
    
    const trade: Trade = {
      id: 'trade-' + Date.now(),
      stockSymbol,
      type: 'short',
      quantity,
      price,
      timestamp: Date.now(),
    };
    
    const updatedPlayer = {
      ...currentPlayer,
      balance: currentPlayer.balance - marginRequired,
      positions: newPositions,
      trades: [...currentPlayer.trades, trade],
    };
    
    set({
      currentPlayer: updatedPlayer,
      currentRoom: {
        ...currentRoom,
        players: currentRoom.players.map(p =>
          p.id === currentPlayer.id ? updatedPlayer : p
        ),
      },
    });
    
    return true;
  },

  executeCover: (stockSymbol, quantity) => {
    return get().executeBuy(stockSymbol, quantity);
  },

  tick: () => {
    const { currentRoom, marketEngines, candleHistory, currentPrices, currentPlayer, timeRemaining } = get();
    if (!currentRoom || currentRoom.status !== 'playing') return;
    
    const now = Math.floor(Date.now() / 1000);
    const newHistory = new Map(candleHistory);
    const newPrices = new Map(currentPrices);
    
    currentRoom.stocks.forEach(stock => {
      const engine = marketEngines.get(stock.symbol);
      if (engine) {
        const candle = engine.generateTick(now);
        const history = newHistory.get(stock.symbol) || [];
        newHistory.set(stock.symbol, [...history, candle]);
        newPrices.set(stock.symbol, candle.close);
      }
    });
    
    // Update positions with new prices
    if (currentPlayer) {
      const updatedPositions = currentPlayer.positions.map(pos => {
        const newPrice = newPrices.get(pos.stockSymbol) || pos.currentPrice;
        const unrealizedPnl = pos.quantity > 0
          ? pos.quantity * (newPrice - pos.avgPrice)
          : Math.abs(pos.quantity) * (pos.avgPrice - newPrice);
        
        return {
          ...pos,
          currentPrice: newPrice,
          unrealizedPnl,
        };
      });
      
      set({
        currentPlayer: {
          ...currentPlayer,
          positions: updatedPositions,
        },
      });
    }
    
    // Update time remaining
    const newTimeRemaining = timeRemaining - GAME_CONFIG.TICK_INTERVAL_MS;
    
    if (newTimeRemaining <= 0) {
      get().endGame();
    } else {
      set({
        candleHistory: newHistory,
        currentPrices: newPrices,
        timeRemaining: newTimeRemaining,
      });
    }
  },

  injectVolatility: () => {
    const { marketEngines, currentRoom } = get();
    if (!currentRoom) return;
    
    currentRoom.stocks.forEach(stock => {
      const engine = marketEngines.get(stock.symbol);
      if (engine) {
        engine.injectVolatility(3);
      }
    });
  },

  injectFakeBreakout: () => {
    const { marketEngines, currentRoom } = get();
    if (!currentRoom) return;
    
    currentRoom.stocks.forEach(stock => {
      const engine = marketEngines.get(stock.symbol);
      if (engine) {
        engine.injectFakeBreakout();
      }
    });
  },

  injectNewsCandle: () => {
    const { marketEngines, currentRoom } = get();
    if (!currentRoom) return;
    
    currentRoom.stocks.forEach(stock => {
      const engine = marketEngines.get(stock.symbol);
      if (engine) {
        engine.injectNewsCandle();
      }
    });
  },

  updateTimeRemaining: (ms) => {
    set({ timeRemaining: ms });
  },

  resetGame: () => {
    set({
      currentRoom: null,
      currentPlayer: null,
      isAdmin: false,
      marketEngines: new Map(),
      candleHistory: new Map(),
      currentPrices: new Map(),
      timeRemaining: GAME_CONFIG.GAME_DURATION_MS,
      isGameActive: false,
      leaderboard: [],
    });
  },
}));
