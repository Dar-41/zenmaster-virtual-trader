'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface Trade {
  id: string;
  stockSymbol: string;
  type: 'buy' | 'sell' | 'short' | 'cover';
  quantity: number;
  price: number;
  timestamp: number;
  pnl?: number;
}

interface TradeHistoryProps {
  trades: Trade[];
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
  if (trades.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Trade History</h2>
        <p className="text-gray-400 text-sm">No trades yet</p>
      </div>
    );
  }

  const recentTrades = [...trades].reverse().slice(0, 10);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recentTrades.map((trade) => {
          const typeColors = {
            buy: 'text-green-400',
            sell: 'text-red-400',
            short: 'text-orange-400',
            cover: 'text-blue-400',
          };

          return (
            <div
              key={trade.id}
              className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm"
            >
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${typeColors[trade.type]}`}>
                  {trade.type.toUpperCase()}
                </span>
                <span className="text-gray-300">{trade.quantity} @ {formatINR(trade.price)}</span>
              </div>
              {trade.pnl !== undefined && (
                <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {formatINR(trade.pnl)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

