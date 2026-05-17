import { useState, useEffect } from 'react';
import { getProblemLeaderboard } from '../../lib/api/problem';
import { notification } from '../../lib/notifications';
import type { ProblemLeaderboardEntry, ProblemLeaderboardResponse } from '../../types/problem';

type ProblemLeaderboardProps = {
  problemId: number;
};

type LeaderboardTab = 'runtime' | 'memory';

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '🏆' };
    case 2:
      return { bg: 'bg-gray-400/10', border: 'border-gray-400/30', text: 'text-gray-300', icon: '🥈' };
    case 3:
      return { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: '🥉' };
    default:
      return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-gray-400', icon: '' };
  }
};

const formatTime = (timestamp: string) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
};

export const ProblemLeaderboard = ({ problemId }: ProblemLeaderboardProps) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('runtime');
  const [leaderboard, setLeaderboard] = useState<ProblemLeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      notification.loading({ title: 'Loading', message: 'Fetching leaderboard...' });

      const data = await getProblemLeaderboard(problemId, 10);

      notification.close();

      if (data) {
        setLeaderboard(data);
      } else {
        notification.error('Error', 'Failed to load leaderboard');
      }

      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [problemId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="w-8 h-8 border-2 border-[#22D3EE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!leaderboard) {
    return (
      <div className="text-gray-400 text-center py-8">
        Failed to load leaderboard
      </div>
    );
  }

  const entries = activeTab === 'runtime' ? leaderboard.runtimeLeaderboard : leaderboard.memoryLeaderboard;
  const userRank = activeTab === 'runtime' ? leaderboard.userRankRuntime : leaderboard.userRankMemory;
  const userValue = activeTab === 'runtime' ? leaderboard.userRuntimeMs : leaderboard.userMemoryKb;
  const valueLabel = activeTab === 'runtime' ? 'ms' : 'KB';

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('runtime')}
          className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'runtime'
              ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          By Runtime
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`px-6 py-3 text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'memory'
              ? 'text-[#22D3EE] border-b-2 border-[#22D3EE]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          By Memory
        </button>
      </div>

      {/* Your Rank */}
      {userRank > 0 && (
        <div className="bg-[#22D3EE]/10 border border-[#22D3EE]/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#22D3EE]/20 flex items-center justify-center">
                <span className="font-bold text-[#22D3EE]">#{userRank}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold">Your Rank</h3>
                <p className="text-gray-400 text-xs">Based on your best submission</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[#22D3EE] font-bold">{userValue.toFixed(2)}</span>
              <span className="text-gray-400 text-sm ml-1">{valueLabel}</span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Entries */}
      {entries.length === 0 ? (
        <p className="text-gray-400 text-sm py-6 text-center">No submissions yet.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const style = getRankStyle(entry.rank);
            return (
              <div
                key={`${entry.userId}-${entry.rank}`}
                className={`bg-[#161b22] border ${style.border} rounded-xl p-4 flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center border ${style.border}`}>
                    {entry.rank <= 3 ? (
                      <span className="text-lg">{style.icon}</span>
                    ) : (
                      <span className={`font-bold ${style.text}`}>{entry.rank}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {entry.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm">{entry.displayName}</h3>
                      <p className="text-gray-500 text-xs">@{entry.username}</p>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`font-bold ${entry.rank === 1 ? 'text-[#22D3EE]' : style.text}`}>
                    {activeTab === 'runtime' ? entry.runtimeMs.toFixed(2) : entry.memoryKb.toFixed(0)}
                  </span>
                  <span className="text-gray-500 text-sm ml-1">{valueLabel}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};