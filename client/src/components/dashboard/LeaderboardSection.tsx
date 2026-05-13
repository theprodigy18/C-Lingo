export const LeaderboardSection = () => {
  const rankings = [
    { rank: 1, name: 'Furab', aura: 10000 },
    { rank: 2, name: 'Sugeng Kos', aura: 5000 },
    { rank: 3, name: 'TheProdigy', aura: 4100 },
    { rank: 4, name: 'Komdigy MBG', aura: 3000 },
  ];

  return (
    <section id="leaderboard">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-clingo-blue">Leaderboard</h2>
        <a className="text-sm text-gray-400 hover:text-white cursor-pointer font-poppins" href="#">See All</a>
      </div>

      <div className="bg-clingo-dark rounded-xl border border-clingo-blue/20 overflow-hidden" style={{ boxShadow: '0 0 30px rgba(34, 211, 238, 0.15)' }}>
        <div className="divide-y divide-white/5">
          {rankings.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between px-6 py-4 cursor-pointer transition-colors hover:bg-white/5 ${
                user.rank === 1 ? 'bg-clingo-blue/10' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 text-center font-bold font-museo ${user.rank === 1 ? 'text-xl text-clingo-blue' : 'text-lg text-gray-500'}`}>
                  {user.rank}
                </span>
                <div className="w-10 h-10 rounded-full bg-slate-700 border border-white/10" />
                <span className={`font-medium font-poppins ${user.rank === 1 ? 'text-white' : 'text-gray-300'}`}>
                  {user.name}
                </span>
              </div>
              <span className={`font-bold font-poppins ${user.rank === 1 ? 'text-clingo-blue' : 'text-gray-400'}`}>
                {user.aura.toLocaleString()} Aura
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};