'use client';

import { formatINR } from '@/lib/utils';

interface AdminAnalyticsProps {
  players: Array<{
    id: string;
    name: string;
    balance: number;
    pnl: number;
    trades: any[];
    positions: any[];
  }>;
  currentPrice: number;
}

export default function AdminAnalytics({ players, currentPrice }: AdminAnalyticsProps) {
  const totalTrades = players.reduce((sum, p) => sum + p.trades.length, 0);
  const totalVolume = players.reduce((sum, p) => 
    sum + p.trades.reduce((s, t) => s + (t.price * t.quantity), 0)
  , 0);
  const activePositions = players.reduce((sum, p) => sum + p.positions.length, 0);
  const avgPnl = players.length > 0 
    ? players.reduce((sum, p) => sum + p.pnl, 0) / players.length 
    : 0;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Game Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-400">Total Trades</div>
          <div className="text-2xl font-bold text-white">{totalTrades}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Total Volume</div>
          <div className="text-lg font-semibold text-white">{formatINR(totalVolume)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Active Positions</div>
          <div className="text-2xl font-bold text-white">{activePositions}</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Avg P&L</div>
          <div className={`text-lg font-semibold ${avgPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatINR(avgPnl)}
          </div>
        </div>
      </div>
    </div>
  );
}

