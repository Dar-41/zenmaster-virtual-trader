import React from 'react';
import { Player, formatINR, formatPercent } from '@/lib/gameTypes';
import { cn } from '@/lib/utils';
import { Trophy, Medal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  isCompact?: boolean;
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentPlayerId,
  isCompact = false,
  className,
}) => {
  const sortedPlayers = [...players].sort((a, b) => {
    const aPnl = a.pnl + a.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    const bPnl = b.pnl + b.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    return bPnl - aPnl;
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-300" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-muted-foreground font-mono text-sm w-5 text-center">{index + 1}</span>;
  };

  const getTotalPnl = (player: Player) => {
    return player.pnl + player.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  };

  if (isCompact) {
    return (
      <div className={cn('glass-card p-4', className)}>
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {sortedPlayers.slice(0, 5).map((player, index) => {
            const totalPnl = getTotalPnl(player);
            const isCurrentPlayer = player.id === currentPlayerId;

            return (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg transition-colors',
                  isCurrentPlayer ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/30'
                )}
              >
                <div className="flex items-center gap-2">
                  {getRankIcon(index)}
                  <span className={cn(
                    'font-medium truncate max-w-[100px]',
                    isCurrentPlayer ? 'text-primary' : 'text-foreground'
                  )}>
                    {player.name}
                  </span>
                </div>
                <span className={cn(
                  'font-mono text-sm font-bold',
                  totalPnl >= 0 ? 'profit-text' : 'loss-text'
                )}>
                  {formatINR(totalPnl)}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('glass-card p-6', className)}>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-400" />
        Final Leaderboard
      </h2>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => {
          const totalPnl = getTotalPnl(player);
          const roi = (totalPnl / 500000) * 100;
          const isCurrentPlayer = player.id === currentPlayerId;

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                'flex items-center justify-between p-4 rounded-xl transition-all',
                index === 0 && 'bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30',
                index === 1 && 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border border-gray-400/30',
                index === 2 && 'bg-gradient-to-r from-amber-600/20 to-orange-600/10 border border-amber-600/30',
                index > 2 && 'bg-secondary/30',
                isCurrentPlayer && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary">
                  {getRankIcon(index)}
                </div>
                <div>
                  <h3 className={cn(
                    'font-bold text-lg',
                    isCurrentPlayer ? 'text-primary' : 'text-foreground'
                  )}>
                    {player.name}
                    {isCurrentPlayer && <span className="text-xs ml-2 text-muted-foreground">(You)</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {player.trades.length} trades
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  'price-display text-xl font-bold',
                  totalPnl >= 0 ? 'profit-text' : 'loss-text'
                )}>
                  {formatINR(totalPnl)}
                </div>
                <div className={cn(
                  'ticker-display text-sm flex items-center justify-end gap-1',
                  roi >= 0 ? 'profit-text' : 'loss-text'
                )}>
                  {roi > 0 && <TrendingUp className="h-4 w-4" />}
                  {roi < 0 && <TrendingDown className="h-4 w-4" />}
                  {roi === 0 && <Minus className="h-4 w-4" />}
                  {formatPercent(roi)} ROI
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
