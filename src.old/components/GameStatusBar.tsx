import React from 'react';
import { formatINR, formatTimeRemaining, GAME_CONFIG } from '@/lib/gameTypes';
import { useGameStore } from '@/lib/gameStore';
import { cn } from '@/lib/utils';
import { Wallet, Clock, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface GameStatusBarProps {
  className?: string;
}

const GameStatusBar: React.FC<GameStatusBarProps> = ({ className }) => {
  const { currentPlayer, timeRemaining, currentRoom } = useGameStore();

  if (!currentPlayer || !currentRoom) return null;

  const totalPnl = currentPlayer.pnl + 
    currentPlayer.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const roi = (totalPnl / GAME_CONFIG.INITIAL_BALANCE) * 100;
  const isPositive = totalPnl >= 0;
  const timePercent = (timeRemaining / GAME_CONFIG.GAME_DURATION_MS) * 100;
  const isLowTime = timeRemaining < 60000; // Less than 1 minute

  return (
    <div className={cn(
      'glass-card p-3 md:p-4',
      className
    )}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Timer */}
        <motion.div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg',
            isLowTime ? 'bg-destructive/20 animate-pulse' : 'bg-secondary'
          )}
          animate={isLowTime ? { scale: [1, 1.02, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Clock className={cn('h-5 w-5', isLowTime ? 'text-destructive' : 'text-primary')} />
          <span className={cn(
            'font-mono text-xl font-bold',
            isLowTime ? 'text-destructive' : 'text-foreground'
          )}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        </motion.div>

        {/* Balance */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <Wallet className="h-5 w-5 text-info" />
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="font-mono font-bold text-foreground">
              {formatINR(currentPlayer.balance)}
            </p>
          </div>
        </div>

        {/* P&L */}
        <div className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg border',
          isPositive ? 'profit-bg' : 'loss-bg'
        )}>
          {isPositive ? (
            <TrendingUp className="h-5 w-5 profit-text" />
          ) : (
            <TrendingDown className="h-5 w-5 loss-text" />
          )}
          <div>
            <p className="text-xs text-muted-foreground">P&L</p>
            <p className={cn(
              'font-mono font-bold',
              isPositive ? 'profit-text' : 'loss-text'
            )}>
              {formatINR(totalPnl)} ({roi.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
          <Zap className="h-5 w-5 text-primary animate-pulse" />
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="font-semibold text-profit">LIVE</p>
          </div>
        </div>
      </div>

      {/* Time progress bar */}
      <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isLowTime ? 'bg-destructive' : 'bg-primary'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${timePercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default GameStatusBar;
