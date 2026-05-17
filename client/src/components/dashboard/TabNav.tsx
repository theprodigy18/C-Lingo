import { useEffect, useRef, useState } from 'react';

const tabs = [
  { id: 'courses', label: 'Course' },
  { id: 'streak', label: 'Daily Streak' },
  { id: 'practice', label: 'Coding Practice' },
  { id: 'leaderboard', label: 'Leaderboard' },
];

export const TabNav = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeStyle, setActiveStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const activeIndex = tabs.findIndex((t) => t.id === activeTab);
      const activeButton = tabsRef.current[activeIndex];
      const container = containerRef.current;

      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft) || 0;

        setActiveStyle({
          left: buttonRect.left - containerRect.left + paddingLeft,
          width: buttonRect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [activeTab]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    tabs.forEach((tab) => {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = (tabId: string) => {
    setActiveTab(tabId);
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`sticky top-[68px] z-40 py-4 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-[#0d1b2a]/80' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={containerRef}
          className="relative flex justify-center bg-[#102b46]/80 backdrop-blur-sm p-1 rounded-full border border-white/10"
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabsRef.current[index] = el; }}
              onClick={() => handleClick(tab.id)}
              className={`relative z-10 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 cursor-pointer ${
                activeTab === tab.id ? 'text-[#071626]' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div
            className="absolute top-1 bottom-1 bg-[#22D3EE] rounded-full transition-all duration-300 ease-out"
            style={{
              left: activeStyle.left,
              width: activeStyle.width,
            }}
          />
        </div>
      </div>
    </div>
  );
};