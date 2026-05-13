export const DailyStreakSection = () => {
  const weekDays = [
    { day: 'Mon', date: 10, completed: true, claimed: true },
    { day: 'Tue', date: 11, completed: true, claimed: true },
    { day: 'Wed', date: 12, completed: true, claimed: true },
    { day: 'Thu', date: 13, completed: true, claimed: true },
    { day: 'Fri', date: 14, completed: true, claimed: true },
    { day: 'Sat', date: 15, completed: false, claimed: false },
    { day: 'Sun', date: 16, completed: false, claimed: false },
  ];

  const completedCount = weekDays.filter((d) => d.completed).length;

  return (
    <section id="streak" className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Daily Streak</h2>
              <p className="text-gray-400 text-sm">Keep your streak going!</p>
            </div>
            <div className="flex items-center gap-2 bg-[#22D3EE]/10 border border-[#22D3EE]/30 rounded-full px-4 py-2">
              <svg className="w-5 h-5 text-[#22D3EE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/>
              </svg>
              <span className="text-[#22D3EE] font-bold text-lg">{completedCount} day{completedCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {weekDays.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 mb-1">{item.day}</span>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    item.completed
                      ? item.claimed
                        ? 'bg-[#22D3EE] text-[#071626]'
                        : 'bg-[#22D3EE]/50 text-[#071626]'
                      : 'bg-white/5 border border-white/20 text-gray-500'
                  }`}
                >
                  {item.completed ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{item.date}</span>
                  )}
                </div>
                {!item.completed && (
                  <button
                    type="button"
                    className="px-3 py-1 bg-[#22D3EE] text-[#071626] text-xs font-semibold rounded-full hover:bg-[#67e8f9] transition-colors cursor-pointer"
                  >
                    Claim
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};