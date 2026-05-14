import { useNavigate } from 'react-router-dom';
import { routes } from '../../lib/constants';

export const CodingPracticeSection = () => {
  const navigate = useNavigate();
  const problems = [
    { id: 1, title: 'Hello World', difficulty: 'Easy', acceptance: '85.2%', tags: ['String', 'Basics'] },
    { id: 2, title: 'Sum of Two', difficulty: 'Easy', acceptance: '78.5%', tags: ['Math', 'Logic'] },
    { id: 3, title: 'Reverse Array', difficulty: 'Medium', acceptance: '62.3%', tags: ['Array', 'Algorithm'] },
    { id: 4, title: 'Palindrome Check', difficulty: 'Medium', acceptance: '55.1%', tags: ['String', 'Two Pointers'] },
  ];

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'Easy':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'Medium':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Hard':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((problem) => (
            <div
              key={problem.id}
              onClick={() => handleProblemClick(problem.id)}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#22D3EE]/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#22D3EE]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-[#22D3EE] transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-0.5">Problem #{problem.id}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getDifficultyStyle(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {problem.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-gray-500 text-xs">{problem.acceptance} acceptance</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};