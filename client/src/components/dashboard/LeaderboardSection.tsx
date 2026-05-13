export const LeaderboardSection = () => {
  const rankings = [
    { rank: 1, name: 'Furab', username: '@furab', aura: 10000, avatar: '' },
    { rank: 2, name: 'Sugeng Kos', username: '@sugeng', aura: 8500, avatar: '' },
    { rank: 3, name: 'TheProdigy', username: '@prodigy', aura: 6200, avatar: '' },
    { rank: 4, name: 'Komdigy MBG', username: '@komdigy', aura: 4100, avatar: '' },
    { rank: 5, name: 'CodeMaster', username: '@codemaster', aura: 3800, avatar: '' },
  ];

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

  return (
    <section id="leaderboard" className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#22D3EE]">Leaderboard</h2>
          <p className="text-gray-400 text-sm mt-1">Top performers this week</p>
        </div>

        <div className="space-y-3">
          {rankings.map((user) => {
            const style = getRankStyle(user.rank);
            return (
              <div
                key={user.rank}
                className={`bg-white/5 border ${style.border} rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${style.bg} flex items-center justify-center border ${style.border}`}>
                    {user.rank <= 3 ? (
                      <span className="text-xl">{style.icon}</span>
                    ) : (
                      <span className={`font-bold ${style.text}`}>{user.rank}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{user.name}</h3>
                      <p className="text-gray-500 text-xs">{user.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-bold ${user.rank === 1 ? 'text-[#22D3EE]' : style.text}`}>
                    {user.aura.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm">Aura</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};