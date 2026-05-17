import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../lib/constants';
import { getProblemList } from '../../lib/api/problem';
import type { ProblemListItem } from '../../types/problem';

export const CodingPracticeSection = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await getProblemList();
        setProblems(data);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDifficulty = (diff: string) => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  const parseTags = (tagsString: string): string[] => {
    if (!tagsString) return [];
    return tagsString.split(',').map((t) => t.trim()).filter(Boolean);
  };

  const handleProblemClick = (problemId: number) => {
    navigate(routes.problem.replace(':id', String(problemId)));
  };

  return (
    <section id="practice" className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#22D3EE]">Coding Practice</h2>
          <p className="text-gray-400 text-sm mt-1">Test your skills with these challenges</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5" />
                    <div>
                      <div className="h-5 w-32 bg-white/5 rounded mb-2" />
                      <div className="h-3 w-20 bg-white/5 rounded" />
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-white/5 rounded-full" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/5 rounded" />
                  <div className="h-6 w-16 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : problems.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
            <svg
              className="w-12 h-12 mx-auto text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-400">No problems available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((problem) => {
              const tags = parseTags(problem.tags);

              return (
                <div
                  key={problem.id}
                  onClick={() => handleProblemClick(problem.id)}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-[#22D3EE]"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold group-hover:text-[#22D3EE] transition-colors">
                          {problem.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-gray-500 text-xs">
                            <span className="text-[#22D3EE]">{problem.energyCost}</span> energy
                          </span>
                          <span className="text-gray-600">|</span>
                          <span className="text-gray-500 text-xs">
                            <span className="text-yellow-400">{problem.auraReward}</span> aura
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyStyle(
                        problem.difficulty
                      )}`}
                    >
                      {formatDifficulty(problem.difficulty)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};