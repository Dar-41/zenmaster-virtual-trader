import React, { useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/lib/gameStore';
import { GAME_CONFIG } from '@/lib/gameTypes';
import TradingChart from '@/components/TradingChart';
import OrderPanel from '@/components/OrderPanel';
import GameStatusBar from '@/components/GameStatusBar';
import Leaderboard from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';

const GameRoom: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const playerName = searchParams.get('name') || 'Player';
  
  const {
    currentRoom,
    currentPlayer,
    candleHistory,
    currentPrices,
    tick,
    isGameActive,
    leaderboard,
    joinRoom,
    resetGame,
  } = useGameStore();

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Join room on mount
  useEffect(() => {
    if (roomCode && !currentPlayer) {
      const joined = joinRoom(roomCode, playerName);
      if (!joined) {
        // Room doesn't exist or is locked - redirect to home
        navigate('/');
      }
    }
  }, [roomCode, playerName, currentPlayer, joinRoom, navigate]);

  // Game tick loop
  useEffect(() => {
    if (isGameActive && currentRoom?.status === 'playing') {
      tickIntervalRef.current = setInterval(() => {
        tick();
      }, GAME_CONFIG.TICK_INTERVAL_MS);
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, [isGameActive, currentRoom?.status, tick]);

  const handleBackToHome = () => {
    resetGame();
    navigate('/');
  };

  // Waiting screen
  if (!currentRoom || currentRoom.status === 'waiting') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center max-w-md w-full"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 rounded-full bg-primary animate-ping" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Waiting for Game</h2>
          <p className="text-muted-foreground mb-4">
            The admin will start the game shortly...
          </p>
          <div className="p-4 bg-secondary/50 rounded-lg mb-6">
            <p className="text-sm text-muted-foreground mb-1">Room Code</p>
            <p className="font-mono text-2xl text-primary tracking-widest">{roomCode}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Players: {currentRoom?.players.length || 0} / {GAME_CONFIG.MAX_PLAYERS}
          </p>
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="mt-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave Room
          </Button>
        </motion.div>
      </div>
    );
  }

  // Game ended screen
  if (currentRoom.status === 'ended') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Game Over!</h1>
            <p className="text-muted-foreground mt-2">Final results are in</p>
          </motion.div>

          <Leaderboard
            players={leaderboard.length > 0 ? leaderboard : currentRoom.players}
            currentPlayerId={currentPlayer?.id}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Button variant="glow" size="xl" onClick={handleBackToHome}>
              Back to Home
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Active game screen
  const selectedStock = currentRoom.stocks[0];
  const stockCandles = candleHistory.get(selectedStock.symbol) || [];
  const stockPrice = currentPrices.get(selectedStock.symbol) || selectedStock.basePrice;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Status Bar */}
      <GameStatusBar className="m-2 md:m-4" />

      {/* Main Content */}
      <div className="flex-1 p-2 md:p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chart - Takes most space */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TradingChart
            symbol={selectedStock.symbol}
            name={selectedStock.name}
            candles={stockCandles}
            currentPrice={stockPrice}
            className="flex-1 min-h-[300px] md:min-h-[400px]"
          />

          {/* Stock tabs for multiple stocks */}
          {currentRoom.stocks.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentRoom.stocks.map(stock => (
                <button
                  key={stock.symbol}
                  className="px-4 py-2 rounded-lg bg-secondary/50 text-foreground text-sm font-medium whitespace-nowrap hover:bg-secondary transition-colors"
                >
                  {stock.symbol}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <OrderPanel
            stock={selectedStock}
            currentPrice={stockPrice}
          />
          <Leaderboard
            players={currentRoom.players}
            currentPlayerId={currentPlayer?.id}
            isCompact
          />
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
