'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface LeaderboardProps {
  leaderboard: Array<{
    id: string;
    name: string;
    pnl: number;
    roi: number;
    balance: number;
  }>;
  currentPlayerId: string;
}

export default function Leaderboard({ leaderboard, currentPlayerId }: LeaderboardProps) {
  if (leaderboard.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <p className="text-gray-400">Waiting for game to start...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {leaderboard.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          const rank = index + 1;
          const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg ${
                isCurrentPlayer
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold w-6">{rank}.</span>
                  <span className="text-xl">{medal}</span>
                  <span className={`font-semibold ${isCurrentPlayer ? 'text-white' : 'text-gray-200'}`}>
                    {player.name}
                  </span>
                  {isCurrentPlayer && <span className="text-xs bg-blue-500 px-2 py-1 rounded">You</span>}
                </div>
                <div className="text-right">
                  <div className={`font-bold ${player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatINR(player.pnl)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatPercent(player.roi)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

