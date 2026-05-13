export const DailyStreakSection = () => {
  return (
    <section id="streak">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-clingo-blue">Daily Streak</h2>
        <a className="text-sm text-gray-400 hover:text-white cursor-pointer font-poppins" href="#">See All</a>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-3">
        {/* Day 1 - Active */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-full aspect-square rounded-xl bg-clingo-dark border-2 border-clingo-blue flex items-center justify-center" style={{ boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)' }}>
            <span className="text-lg font-bold text-clingo-blue font-museo">1</span>
          </div>
          <button className="w-full py-1.5 bg-clingo-blue text-clingo-dark font-bold rounded-full text-xs font-poppins cursor-pointer">
            Claim
          </button>
        </div>

        {/* Days 2-7 */}
        {[2, 3, 4, 5, 6, 7].map((day) => (
          <div key={day} className="flex flex-col items-center gap-2 opacity-50">
            <div className="w-full aspect-square rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-400 font-poppins">{day}</span>
            </div>
            <button className="w-full py-1.5 border border-clingo-blue/30 text-clingo-blue font-bold rounded-full text-xs font-poppins cursor-pointer">
              Claim
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};