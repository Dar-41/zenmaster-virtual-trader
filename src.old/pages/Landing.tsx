import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { INDIAN_STOCKS, MARKET_SCENARIOS, Stock, MarketScenario, GAME_CONFIG } from '@/lib/gameTypes';
import { useGameStore } from '@/lib/gameStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  Play, 
  Users, 
  TrendingUp, 
  Zap, 
  ChevronRight,
  BarChart3,
  Trophy,
  Clock,
  Check
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom } = useGameStore();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<MarketScenario>('volatile');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const toggleStock = (stock: Stock) => {
    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s.symbol !== stock.symbol));
    } else if (selectedStocks.length < GAME_CONFIG.MAX_STOCKS) {
      setSelectedStocks([...selectedStocks, stock]);
    }
  };

  const handleCreateRoom = () => {
    if (selectedStocks.length === 0) return;
    const code = createRoom(selectedStocks, selectedScenario);
    navigate(`/admin/${code}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    navigate(`/game/${roomCode}?name=${encodeURIComponent(playerName)}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern bg-[size:50px_50px] opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-info/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {mode === 'home' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo and Title */}
            <motion.div variants={itemVariants} className="mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                Trade<span className="text-gradient">Battle</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                5-minute multiplayer trading game with Indian stocks. 
                Compete in real-time, trade smart, top the leaderboard.
              </p>
            </motion.div>

            {/* Feature cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              <div className="glass-card p-6 text-left">
                <Clock className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-bold text-foreground mb-1">5 Minutes</h3>
                <p className="text-sm text-muted-foreground">Fast-paced trading rounds</p>
              </div>
              <div className="glass-card p-6 text-left">
                <Users className="h-8 w-8 text-info mb-3" />
                <h3 className="font-bold text-foreground mb-1">2-10 Players</h3>
                <p className="text-sm text-muted-foreground">Multiplayer competition</p>
              </div>
              <div className="glass-card p-6 text-left">
                <Trophy className="h-8 w-8 text-warning mb-3" />
                <h3 className="font-bold text-foreground mb-1">Live Leaderboard</h3>
                <p className="text-sm text-muted-foreground">Real-time P&L ranking</p>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="hero"
                size="xl"
                onClick={() => setMode('create')}
                className="min-w-[200px]"
              >
                <Play className="h-5 w-5 mr-2" />
                Create Room
              </Button>
              <Button
                variant="glass"
                size="xl"
                onClick={() => setMode('join')}
                className="min-w-[200px]"
              >
                <Users className="h-5 w-5 mr-2" />
                Join Game
              </Button>
            </motion.div>
          </motion.div>
        )}

        {mode === 'create' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Button
                variant="ghost"
                onClick={() => setMode('home')}
                className="mb-4"
              >
                ← Back
              </Button>
              <h2 className="text-3xl font-bold text-foreground">Create Game Room</h2>
              <p className="text-muted-foreground mt-2">Select stocks and market scenario</p>
            </motion.div>

            {/* Stock selection */}
            <motion.div variants={itemVariants} className="glass-card p-6 mb-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Select Stocks (Max 3)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {INDIAN_STOCKS.map(stock => {
                  const isSelected = selectedStocks.find(s => s.symbol === stock.symbol);
                  return (
                    <button
                      key={stock.symbol}
                      onClick={() => toggleStock(stock)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all text-left',
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-secondary/30 hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-foreground">{stock.symbol}</span>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
                      <p className="text-xs text-primary mt-1">₹{stock.basePrice.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Scenario selection */}
            <motion.div variants={itemVariants} className="glass-card p-6 mb-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning" />
                Market Scenario
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MARKET_SCENARIOS.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all text-left',
                      selectedScenario === scenario.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary/30 hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground">{scenario.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Create button */}
            <motion.div variants={itemVariants}>
              <Button
                variant="glow"
                size="xl"
                onClick={handleCreateRoom}
                disabled={selectedStocks.length === 0}
                className="w-full"
              >
                Create Room
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {mode === 'join' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-md mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <Button
                variant="ghost"
                onClick={() => setMode('home')}
                className="mb-4"
              >
                ← Back
              </Button>
              <h2 className="text-3xl font-bold text-foreground">Join Game</h2>
              <p className="text-muted-foreground mt-2">Enter room code and your name</p>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full h-12 px-4 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full h-12 px-4 bg-secondary border border-border rounded-lg text-foreground font-mono text-center text-xl tracking-widest placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                variant="glow"
                size="xl"
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || roomCode.length !== 6}
                className="w-full"
              >
                Join Game
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Landing;
