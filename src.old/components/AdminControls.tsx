import React from 'react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/lib/gameStore';
import { Player, formatINR } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Pause, 
  Square, 
  Lock, 
  Unlock, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  Newspaper,
  Users,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminControlsProps {
  className?: string;
}

const AdminControls: React.FC<AdminControlsProps> = ({ className }) => {
  const {
    currentRoom,
    isGameActive,
    startGame,
    pauseGame,
    endGame,
    toggleLock,
    injectVolatility,
    injectFakeBreakout,
    injectNewsCandle,
  } = useGameStore();

  if (!currentRoom) return null;

  const PlayerRow: React.FC<{ player: Player; index: number }> = ({ player, index }) => {
    const totalPnl = player.pnl + player.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const isPositive = totalPnl >= 0;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-2 h-2 rounded-full',
            player.isConnected ? 'bg-profit' : 'bg-muted'
          )} />
          <div>
            <p className="font-medium text-foreground">{player.name}</p>
            <p className="text-xs text-muted-foreground">
              {player.positions.length} positions • {player.trades.length} trades
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            'font-mono font-bold',
            isPositive ? 'profit-text' : 'loss-text'
          )}>
            {formatINR(totalPnl)}
          </p>
          <p className="text-xs text-muted-foreground">
            Bal: {formatINR(player.balance)}
          </p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={cn('glass-card p-4 space-y-6', className)}>
      {/* Game Controls */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Game Controls
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {!isGameActive ? (
            <Button
              variant="glow"
              size="lg"
              onClick={startGame}
              disabled={currentRoom.players.length < 2}
              className="col-span-2"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Game
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={pauseGame}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={endGame}
              >
                <Square className="h-5 w-5 mr-2" />
                End
              </Button>
            </>
          )}
        </div>

        {/* Lock toggle */}
        <Button
          variant={currentRoom.isLocked ? 'outline' : 'secondary'}
          size="default"
          onClick={toggleLock}
          className="w-full mt-3"
        >
          {currentRoom.isLocked ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Room Locked
            </>
          ) : (
            <>
              <Unlock className="h-4 w-4 mr-2" />
              Lock Room
            </>
          )}
        </Button>
      </div>

      {/* Market Manipulation */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-warning" />
          Market Events
        </h3>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={injectVolatility}
            disabled={!isGameActive}
            className="justify-start border-warning/30 text-warning hover:bg-warning/10"
          >
            <Zap className="h-4 w-4 mr-2" />
            Inject Volatility
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={injectFakeBreakout}
            disabled={!isGameActive}
            className="justify-start border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Fake Breakout
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={injectNewsCandle}
            disabled={!isGameActive}
            className="justify-start border-info/30 text-info hover:bg-info/10"
          >
            <Newspaper className="h-4 w-4 mr-2" />
            News Candle
          </Button>
        </div>
      </div>

      {/* Players List */}
      <div>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Players ({currentRoom.players.length}/{10})
        </h3>
        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
          {currentRoom.players.map((player, index) => (
            <PlayerRow key={player.id} player={player} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminControls;
