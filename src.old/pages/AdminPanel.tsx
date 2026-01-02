import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/lib/gameStore';
import { GAME_CONFIG, formatTimeRemaining } from '@/lib/gameTypes';
import TradingChart from '@/components/TradingChart';
import AdminControls from '@/components/AdminControls';
import Leaderboard from '@/components/Leaderboard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink,
  Clock,
  Users,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const AdminPanel: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isProjectorMode, setIsProjectorMode] = useState(false);
  
  const {
    currentRoom,
    candleHistory,
    currentPrices,
    tick,
    isGameActive,
    timeRemaining,
    leaderboard,
    resetGame,
  } = useGameStore();

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const copyToClipboard = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const joinUrl = `${window.location.origin}/game/${roomCode}`;

  const handleBackToHome = () => {
    resetGame();
    navigate('/');
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-4">Room not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Projector mode - fullscreen leaderboard
  if (isProjectorMode) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold text-foreground">TradeBattle</h1>
            <div className="px-4 py-2 bg-primary/20 rounded-lg">
              <span className="font-mono text-2xl text-primary">{roomCode}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-2xl">
              <Clock className={cn(
                'h-8 w-8',
                timeRemaining < 60000 ? 'text-destructive animate-pulse' : 'text-primary'
              )} />
              <span className={cn(
                'font-mono font-bold',
                timeRemaining < 60000 ? 'text-destructive' : 'text-foreground'
              )}>
                {formatTimeRemaining(timeRemaining)}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsProjectorMode(false)}
            >
              Exit Projector
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <Leaderboard
            players={currentRoom.players}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // Game ended
  if (currentRoom.status === 'ended') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Game Results</h1>
            <Button variant="outline" onClick={() => setIsProjectorMode(true)}>
              <Maximize2 className="h-4 w-4 mr-2" />
              Projector Mode
            </Button>
          </div>

          <Leaderboard
            players={leaderboard.length > 0 ? leaderboard : currentRoom.players}
          />

          <div className="text-center mt-8">
            <Button variant="glow" size="xl" onClick={handleBackToHome}>
              Create New Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedStock = currentRoom.stocks[0];
  const stockCandles = candleHistory.get(selectedStock.symbol) || [];
  const stockPrice = currentPrices.get(selectedStock.symbol) || selectedStock.basePrice;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToHome}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-sm text-muted-foreground">
                {currentRoom.status === 'playing' ? 'Game in progress' : 'Waiting for players'}
              </p>
            </div>
          </div>

          {/* Timer and controls */}
          <div className="flex items-center gap-4">
            {currentRoom.status === 'playing' && (
              <div className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2',
                timeRemaining < 60000 ? 'bg-destructive/20 animate-pulse' : 'bg-secondary'
              )}>
                <Clock className={cn(
                  'h-5 w-5',
                  timeRemaining < 60000 ? 'text-destructive' : 'text-primary'
                )} />
                <span className={cn(
                  'font-mono text-xl font-bold',
                  timeRemaining < 60000 ? 'text-destructive' : 'text-foreground'
                )}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Users className="h-5 w-5 text-info" />
              <span className="font-bold text-foreground">
                {currentRoom.players.length}/{GAME_CONFIG.MAX_PLAYERS}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsProjectorMode(true)}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Projector
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left column - Chart and QR */}
        <div className="lg:col-span-3 space-y-4">
          {/* Room info and QR */}
          {currentRoom.status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="p-4 bg-foreground rounded-xl">
                  <QRCodeSVG
                    value={joinUrl}
                    size={150}
                    level="H"
                    bgColor="transparent"
                    fgColor="hsl(222, 47%, 6%)"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Share Room Code</h2>
                  <p className="text-muted-foreground mb-4">
                    Scan QR code or enter the room code to join
                  </p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <div className="px-6 py-3 bg-secondary rounded-xl">
                      <span className="font-mono text-3xl text-primary tracking-widest">{roomCode}</span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={copyToClipboard}
                    >
                      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(joinUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chart */}
          <TradingChart
            symbol={selectedStock.symbol}
            name={selectedStock.name}
            candles={stockCandles}
            currentPrice={stockPrice}
            className="min-h-[400px]"
          />

          {/* Stock tabs */}
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

        {/* Right column - Controls and Leaderboard */}
        <div className="lg:col-span-1 space-y-4">
          <AdminControls />
          <Leaderboard
            players={currentRoom.players}
            isCompact
          />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
