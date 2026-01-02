'use client';

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import TradingChart from '@/components/TradingChart';
import TradeButtons from '@/components/TradeButtons';
import PlayerStats from '@/components/PlayerStats';
import Leaderboard from '@/components/Leaderboard';
import TradeHistory from '@/components/TradeHistory';
import GameStats from '@/components/GameStats';
import ConnectionStatus from '@/components/ConnectionStatus';
import PriceIndicator from '@/components/PriceIndicator';
import Toast from '@/components/Toast';
import GameEndModal from '@/components/GameEndModal';
import { formatTimeRemaining, formatINR } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  balance: number;
  positions: any[];
  trades: any[];
  pnl: number;
  roi: number;
  isConnected: boolean;
}

interface Room {
  id: string;
  code: string;
  status: 'waiting' | 'playing' | 'paused' | 'ended';
  stock: any;
  players: Player[];
  startTime?: number;
  endTime?: number;
}

export default function PlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomCode = searchParams.get('roomCode') || '';
  const playerName = searchParams.get('name') || '';

  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [candles, setCandles] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!roomCode || !playerName) {
      router.push('/');
      return;
    }

    // Use relative path (monolith) or provided URL
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || undefined);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('joinRoom', { roomCode, playerName });
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('reconnect', () => {
      setIsConnected(true);
      newSocket.emit('joinRoom', { roomCode, playerName });
    });

    newSocket.on('joinedRoom', ({ room: roomData }) => {
      setRoom(roomData);
      const foundPlayer = roomData.players.find((p: Player) => p.name === playerName);
      if (foundPlayer) {
        setPlayer(foundPlayer);
      }
    });

    newSocket.on('joinError', ({ message }) => {
      setError(message);
      setTimeout(() => router.push('/'), 3000);
    });

    newSocket.on('playerJoined', ({ room: roomData }) => {
      setRoom(roomData);
    });

    newSocket.on('gameStarted', ({ startTime, endTime }) => {
      setRoom((prev) => prev ? { ...prev, status: 'playing', startTime, endTime } : null);
    });

    newSocket.on('gameCountdown', ({ countdown: countdownValue }) => {
      setCountdown(countdownValue);
      if (countdownValue === 0) {
        setToast({ message: 'Game started! Prices are now live!', type: 'info' });
        setCountdown(null);
      } else if (countdownValue > 0) {
        setToast({ message: `Game starting in ${countdownValue}...`, type: 'info' });
      }
    });

    newSocket.on('initialCandles', ({ candles: initialCandles }) => {
      setCandles(initialCandles);
      if (initialCandles.length > 0) {
        setCurrentPrice(initialCandles[initialCandles.length - 1].close);
      }
    });

    newSocket.on('priceTick', ({ candle }) => {
      setPreviousPrice(currentPrice);
      setCurrentPrice(candle.close);
      setCandles((prev) => {
        const newCandles = [...prev, candle];
        return newCandles.slice(-300);
      });
    });

    newSocket.on('tradeExecuted', ({ player: playerData, trade }) => {
      setPlayer(playerData);
      const tradeType = trade.type.toUpperCase();
      const pnlText = trade.pnl !== undefined ? ` (P&L: ${formatINR(trade.pnl)})` : '';
      setToast({
        message: `${tradeType} executed: ${trade.quantity} @ ${formatINR(trade.price)}${pnlText}`,
        type: 'success'
      });

      // Play sound effect
      if (typeof window !== 'undefined' && 'Audio' in window) {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OSfTQ8MUKfj8LZjHAY4kdfyzHksBSR3x/DdkEAKFF606euoVRQKRp/g8r5sIQUrgc7y2Yk2CBtpvfDkn00PDFCn4/C2YxwGOJHX8sx5LAUkd8fw3ZBAC');
        audio.volume = 0.3;
        audio.play().catch(() => { });
      }
    });

    newSocket.on('tradeError', ({ message }) => {
      setToast({ message, type: 'error' });
    });

    newSocket.on('updateLeaderboard', ({ leaderboard: lb }) => {
      setLeaderboard(lb);
    });

    newSocket.on('endGame', ({ leaderboard: lb }) => {
      setRoom((prev) => prev ? { ...prev, status: 'ended' } : null);
      setLeaderboard(lb);
      setShowEndModal(true);
      setToast({ message: 'Game ended! Check the leaderboard for final rankings.', type: 'info' });
    });

    return () => {
      newSocket.close();
    };
  }, [roomCode, playerName, router]);

  useEffect(() => {
    if (room?.endTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, room.endTime! - Date.now());
        setTimeRemaining(remaining);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [room?.endTime]);

  // Update previous price when current price changes (only once)
  useEffect(() => {
    if (currentPrice > 0 && previousPrice === 0) {
      setPreviousPrice(currentPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice]);

  const handleTrade = (type: 'buy' | 'sell' | 'short', quantity: number) => {
    if (socket && room) {
      socket.emit('placeTrade', { roomId: room.id, type, quantity });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <p className="text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!room || !player) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Connecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {room.stock.name} ({room.stock.symbol})
            </h1>
            <p className="text-gray-400 mt-1">Room: <span className="font-mono text-white">{room.code}</span></p>
          </div>
          <div className="text-right">
            {countdown !== null && countdown > 0 && (
              <div className="bg-purple-600 px-6 py-3 rounded-lg shadow-lg animate-pulse">
                <div className="text-sm text-purple-200 mb-1">Starting in</div>
                <div className="text-5xl font-bold text-white">
                  {countdown}
                </div>
              </div>
            )}
            {room.status === 'playing' && countdown === null && (
              <div className="bg-blue-600 px-6 py-3 rounded-lg shadow-lg">
                <div className="text-sm text-blue-200 mb-1">Time Remaining</div>
                <div className="text-4xl font-bold text-white">
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
            )}
            {room.status === 'waiting' && (
              <div className="bg-yellow-600 px-6 py-3 rounded-lg shadow-lg">
                <div className="text-lg font-semibold text-white">Waiting for game to start...</div>
              </div>
            )}
            {room.status === 'ended' && (
              <div className="bg-red-600 px-6 py-3 rounded-lg shadow-lg">
                <div className="text-lg font-semibold text-white">Game Ended</div>
              </div>
            )}
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Trading */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl p-4 shadow-2xl border border-gray-700">
              <TradingChart candles={candles} currentPrice={currentPrice} />
            </div>
            <TradeButtons
              onTrade={handleTrade}
              currentPrice={currentPrice}
              disabled={room.status !== 'playing' || countdown !== null}
              playerBalance={player.balance}
            />
            <TradeHistory trades={player.trades} />
          </div>

          {/* Right Column - Stats and Leaderboard */}
          <div className="space-y-6">
            <PlayerStats player={player} currentPrice={currentPrice} />
            <GameStats
              player={player}
              currentPrice={currentPrice}
              timeRemaining={timeRemaining}
            />
            <Leaderboard leaderboard={leaderboard} currentPlayerId={player.id} />
          </div>
        </div>
      </div>

      {/* UI Overlays */}
      <ConnectionStatus isConnected={isConnected} />
      <PriceIndicator currentPrice={currentPrice} previousPrice={previousPrice} />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {showEndModal && room?.status === 'ended' && (
        <GameEndModal
          leaderboard={leaderboard}
          currentPlayerId={player.id}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}

