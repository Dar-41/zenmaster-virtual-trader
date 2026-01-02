'use client';

import { formatINR, formatPercent } from '@/lib/utils';

interface GameEndModalProps {
  leaderboard: Array<{
    id: string;
    name: string;
    pnl: number;
    roi: number;
    balance: number;
  }>;
  currentPlayerId: string;
  onClose: () => void;
}

export default function GameEndModal({ leaderboard, currentPlayerId, onClose }: GameEndModalProps) {
  const currentPlayerRank = leaderboard.findIndex(p => p.id === currentPlayerId) + 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Game Over!
          </h2>
          <p className="text-gray-400">Final Leaderboard</p>
        </div>

        <div className="space-y-3 mb-6">
          {leaderboard.map((player, index) => {
            const rank = index + 1;
            const isCurrentPlayer = player.id === currentPlayerId;
            const medals = ['🥇', '🥈', '🥉'];
            const medal = rank <= 3 ? medals[rank - 1] : '';

            return (
              <div
                key={player.id}
                className={`p-4 rounded-lg ${
                  isCurrentPlayer
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 border-2 border-blue-400'
                    : 'bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold w-8">{rank}.</span>
                    <span className="text-2xl">{medal}</span>
                    <span className={`text-lg font-semibold ${isCurrentPlayer ? 'text-white' : 'text-gray-200'}`}>
                      {player.name}
                    </span>
                    {isCurrentPlayer && (
                      <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-bold">YOU</span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${player.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatINR(player.pnl)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatPercent(player.roi)} • {formatINR(player.balance)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {currentPlayerRank <= 3 && (
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">
              {currentPlayerRank === 1 ? '🏆' : currentPlayerRank === 2 ? '🥈' : '🥉'}
            </div>
            <p className="text-2xl font-bold text-yellow-400">
              Congratulations! You finished {currentPlayerRank === 1 ? '1st' : currentPlayerRank === 2 ? '2nd' : '3rd'}!
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}

