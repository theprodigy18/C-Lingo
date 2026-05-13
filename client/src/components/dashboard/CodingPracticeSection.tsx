export const CodingPracticeSection = () => {
  const problems = [
    { id: 1, title: 'Two Sum', difficulty: 'Easy', acceptance: '49.2%', tags: ['Array', 'Hash Table'] },
    { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', acceptance: '40.1%', tags: ['Linked List', 'Math'] },
    { id: 3, title: 'Longest Substring', difficulty: 'Hard', acceptance: '32.8%', tags: ['String', 'Sliding Window'] },
  ];

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'text-green-500';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <section id="practice">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-clingo-blue">Coding Practice</h2>
        <a className="text-sm text-gray-400 hover:text-white cursor-pointer font-poppins" href="#">See All</a>
      </div>

      <div className="bg-clingo-dark rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-clingo-dark/80">
          <span className="text-sm font-semibold text-gray-300 font-poppins">Problems</span>
          <div className="flex space-x-8 text-xs text-gray-500 font-poppins">
            <span className="w-16 text-center">Difficulty</span>
            <span className="w-20 text-center">Acceptance</span>
            <span className="w-24 text-center">Tags</span>
          </div>
        </div>

        {/* Problem List */}
        {problems.map((problem) => (
          <div
            key={problem.id}
            className="flex items-center justify-between px-6 py-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-gray-400 font-poppins">
                {problem.id}
              </span>
              <span className="text-white font-medium font-poppins">{problem.title}</span>
            </div>
            <div className="flex items-center space-x-8 text-sm font-poppins">
              <span className={`w-16 text-center font-semibold ${getDifficultyColor(problem.difficulty)}`}>
                {problem.difficulty}
              </span>
              <span className="w-20 text-center text-gray-400">{problem.acceptance}</span>
              <div className="w-24 flex gap-2">
                {problem.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-gray-400">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};