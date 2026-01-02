'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { io, Socket } from 'socket.io-client';
import AdminControls from '@/components/AdminControls';
import AdminLeaderboard from '@/components/AdminLeaderboard';
import AdminAnalytics from '@/components/AdminAnalytics';
import TradingChart from '@/components/TradingChart';
import ConnectionStatus from '@/components/ConnectionStatus';
import { INDIAN_STOCKS, MARKET_SCENARIOS } from '@/lib/gameTypes';
import { formatTimeRemaining } from '@/lib/utils';

interface Room {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  stock: any;
  scenario: string;
  players: any[];
  startTime?: number;
  endTime?: number;
  isLocked: boolean;
}

export default function AdminPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [adminName, setAdminName] = useState('');
  const [selectedStock, setSelectedStock] = useState(INDIAN_STOCKS[0].symbol);
  const [selectedScenario, setSelectedScenario] = useState(MARKET_SCENARIOS[0].id);
  const [candles, setCandles] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [adminControls, setAdminControls] = useState({ bias: 0, volatility: 1, paused: false });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Admin connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
    });

    newSocket.on('roomCreated', ({ roomId, roomCode, room: roomData }) => {
      setRoom(roomData);
      router.replace(`/admin?room=${roomCode}`);
    });

    newSocket.on('playerJoined', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('gameStarted', ({ startTime, endTime }) => {
      setRoom((prev) => prev ? { ...prev, status: 'playing', startTime, endTime } : null);
    });

    newSocket.on('initialCandles', ({ candles: initialCandles }) => {
      setCandles(initialCandles);
      if (initialCandles.length > 0) {
        setCurrentPrice(initialCandles[initialCandles.length - 1].close);
      }
    });

    newSocket.on('priceTick', ({ candle }) => {
      setCurrentPrice(candle.close);
      setCandles((prev) => {
        const newCandles = [...prev, candle];
        return newCandles.slice(-300);
      });
    });

    newSocket.on('updateLeaderboard', ({ leaderboard: lb }) => {
      setLeaderboard(lb);
    });

    newSocket.on('adminControlUpdate', ({ controls }) => {
      setAdminControls(controls);
    });

    newSocket.on('roomLocked', ({ isLocked }) => {
      setRoom((prev) => prev ? { ...prev, isLocked } : null);
    });

    newSocket.on('endGame', ({ leaderboard: lb }) => {
      setRoom((prev) => prev ? { ...prev, status: 'ended' } : null);
      setLeaderboard(lb);
    });

    newSocket.on('error', ({ message }) => {
      alert(message);
    });

    return () => {
      newSocket.close();
    };
  }, [router]);

  useEffect(() => {
    if (room?.endTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, room.endTime! - Date.now());
        setTimeRemaining(remaining);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [room?.endTime]);

  const handleCreateRoom = () => {
    if (socket && adminName) {
      socket.emit('createRoom', {
        adminName,
        stockSymbol: selectedStock,
        scenario: selectedScenario,
      });
    }
  };

  const handleStartGame = () => {
    if (socket && room) {
      socket.emit('startGame', { roomId: room.id });
    }
  };

  const handleAdminControl = (action: string, value?: number) => {
    if (socket && room) {
      socket.emit('adminControl', { roomId: room.id, action, value });
    }
  };

  const handleToggleLock = () => {
    if (socket && room) {
      socket.emit('toggleLock', { roomId: room.id });
    }
  };

  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <h1 className="text-3xl font-bold text-center">Create Game Room</h1>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Name
              </label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                placeholder="Enter admin name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock
              </label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {INDIAN_STOCKS.map((stock) => (
                  <option key={stock.symbol} value={stock.symbol}>
                    {stock.name} ({stock.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Market Scenario
              </label>
              <select
                value={selectedScenario}
                onChange={(e) => setSelectedScenario(e.target.value as 'bullish' | 'bearish' | 'range' | 'volatile')}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                {MARKET_SCENARIOS.map((scenario) => (
                  <option key={scenario.id} value={scenario.id}>
                    {scenario.name} - {scenario.description}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateRoom}
              disabled={!adminName}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{room.stock.name} ({room.stock.symbol})</h1>
            <p className="text-gray-400">Room Code: <span className="text-white font-mono text-lg">{room.code}</span></p>
            <p className="text-sm text-gray-500">Players: {room.players.length} / 6</p>
          </div>
          <div className="text-right space-x-2">
            {room.status === 'waiting' && (
              <button
                onClick={handleStartGame}
                disabled={room.players.length < 2}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg"
              >
                Start Game
              </button>
            )}
            {room.status === 'playing' && (
              <div className="text-3xl font-bold text-blue-400">
                {formatTimeRemaining(timeRemaining)}
              </div>
            )}
            <button
              onClick={handleToggleLock}
              className={`px-4 py-2 rounded-lg ${room.isLocked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {room.isLocked ? 'Unlock' : 'Lock'}
            </button>
            <button
              onClick={handleFullscreen}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
            >
              Fullscreen
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <TradingChart candles={candles} currentPrice={currentPrice} />
            </div>
            <AdminControls
              onControl={handleAdminControl}
              controls={adminControls}
              disabled={room.status !== 'playing'}
            />
          </div>

          <div className="space-y-4">
            <AdminLeaderboard leaderboard={leaderboard} players={room.players} />
            <AdminAnalytics players={room.players} currentPrice={currentPrice} />
          </div>
        </div>
      </div>
      <ConnectionStatus isConnected={isConnected} />
    </div>
  );
}

