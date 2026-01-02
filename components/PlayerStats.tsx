'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface PlayerStatsProps {
  player: {
    name: string;
    balance: number;
    positions: any[];
    trades: any[];
    pnl: number;
    roi: number;
  };
  currentPrice: number;
}

export default function PlayerStats({ player, currentPrice }: PlayerStatsProps) {
  const totalBalance = player.balance + player.pnl;

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-bold mb-4">Your Stats</h2>
      
      <div>
        <div className="text-sm text-gray-400">Available Balance</div>
        <div className="text-2xl font-bold text-white">
          {formatINR(player.balance)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400">Total Value</div>
        <div className="text-2xl font-bold text-white">
          {formatINR(totalBalance)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-400">Net P&L</div>
        <div className={`text-2xl font-bold ${player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatINR(player.pnl)}
        </div>
        <div className={`text-sm ${player.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {formatPercent(player.roi)}
        </div>
      </div>

      {player.positions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Open Positions</h3>
          {player.positions.map((position, idx) => (
            <div key={idx} className="mb-2 p-2 bg-gray-700 rounded">
              <div className="flex justify-between">
                <span className="text-sm">{position.stockSymbol}</span>
                <span className={`text-sm font-semibold ${
                  position.unrealizedPnl >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {formatINR(position.unrealizedPnl)}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                {position.quantity > 0 ? 'Long' : 'Short'} {Math.abs(position.quantity)} @ {formatINR(position.avgPrice)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400">Total Trades</div>
        <div className="text-lg font-semibold text-white">{player.trades.length}</div>
      </div>
    </div>
  );
}

