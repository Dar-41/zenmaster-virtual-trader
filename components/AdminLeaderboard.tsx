'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface AdminLeaderboardProps {
  leaderboard: Array<{
    id: string;
    name: string;
    pnl: number;
    roi: number;
    balance: number;
  }>;
  players: Array<{
    id: string;
    name: string;
    isConnected: boolean;
  }>;
}

export default function AdminLeaderboard({ leaderboard, players }: AdminLeaderboardProps) {
  const allPlayers = players.map(p => {
    const lbEntry = leaderboard.find(lb => lb.id === p.id);
    return {
      ...p,
      pnl: lbEntry?.pnl || 0,
      roi: lbEntry?.roi || 0,
      balance: lbEntry?.balance || 0,
    };
  }).sort((a, b) => b.pnl - a.pnl);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {allPlayers.length === 0 ? (
          <p className="text-gray-400">No players yet</p>
        ) : (
          allPlayers.map((player, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg ${
                  !player.isConnected ? 'opacity-50' : ''
                } bg-gray-700`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold w-6">{rank}.</span>
                    <span className="text-xl">{medal}</span>
                    <span className="font-semibold text-gray-200">
                      {player.name}
                    </span>
                    {!player.isConnected && (
                      <span className="text-xs bg-red-500 px-2 py-1 rounded">Offline</span>
                    )}
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
          })
        )}
      </div>
    </div>
  );
}

