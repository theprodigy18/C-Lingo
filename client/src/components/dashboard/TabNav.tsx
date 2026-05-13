export const TabNav = ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'courses', label: 'Course' },
    { id: 'streak', label: 'Daily Streak' },
    { id: 'practice', label: 'Coding Practice' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  const handleClick = (tabId: string) => {
    onTabChange(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sticky top-16 z-40 max-w-7xl mx-auto px-6 mb-12">
      <div className="relative flex flex-wrap justify-center gap-2 bg-clingo-dark/90 backdrop-blur-md p-1.5 rounded-full border border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`relative z-10 px-5 py-2 rounded-full font-semibold transition-all duration-300 cursor-pointer font-poppins ${
              activeTab === tab.id ? 'text-clingo-darker' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div
          className="absolute top-1 bottom-1 bg-clingo-blue rounded-full transition-all duration-300 ease-out"
          style={{
            left: tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length) + '%',
            width: (100 / tabs.length) + '%',
            boxShadow: '0 0 20px rgba(34, 211, 238, 0.6)',
          }}
        />
      </div>
    </div>
  );
};