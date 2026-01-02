'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface GameStatsProps {
  player: {
    name: string;
    balance: number;
    pnl: number;
    roi: number;
    trades: any[];
    positions: any[];
  };
  currentPrice: number;
  timeRemaining: number;
}

export default function GameStats({ player, currentPrice, timeRemaining }: GameStatsProps) {
  const totalValue = player.balance + player.pnl;
  const totalTrades = player.trades.length;
  const winRate = player.trades.filter(t => t.pnl && t.pnl > 0).length / Math.max(1, totalTrades) * 100;
  const avgTradeValue = totalTrades > 0 
    ? player.trades.reduce((sum, t) => sum + (t.price * t.quantity), 0) / totalTrades 
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Game Statistics</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">Total Trades</div>
          <div className="text-2xl font-bold text-white">{totalTrades}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-2xl font-bold text-green-400">{winRate.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Avg Trade Size</div>
          <div className="text-lg font-semibold text-white">{formatINR(avgTradeValue)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Open Positions</div>
          <div className="text-2xl font-bold text-white">{player.positions.length}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">Portfolio Value</span>
          <span className="text-xl font-bold text-white">{formatINR(totalValue)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Net P&L</span>
          <span className={`text-xl font-bold ${player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatINR(player.pnl)} ({formatPercent(player.roi)})
          </span>
        </div>
      </div>
    </div>
  );
}

