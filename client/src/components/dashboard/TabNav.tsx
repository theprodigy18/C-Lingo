import { useEffect, useRef, useState } from "react";

export type TabId = "course" | "daily-streak" | "practice" | "leaderboard";

const TABS: { label: string; id: TabId }[] = [
  { label: "Course", id: "course" },
  { label: "Daily Streak", id: "daily-streak" },
  { label: "Practice", id: "practice" },
  { label: "Leaderboard", id: "leaderboard" },
];

interface TabNavProps {
  activeSection: TabId;
  onTabClick: (id: TabId) => void;
}

export default function TabNav({ activeSection, onTabClick }: TabNavProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    course: null,
    "daily-streak": null,
    practice: null,
    leaderboard: null,
  });

  const moveIndicator = (id: TabId) => {
    const el = tabRefs.current[id];
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    setIndicatorStyle({ left: rect.left - parentRect.left, width: rect.width });
  };

  useEffect(() => {
    moveIndicator(activeSection);
  }, [activeSection]);

  useEffect(() => {
    const onResize = () => moveIndicator(activeSection);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeSection]);

  return (
    <div
      className="sticky top-16.25 z-40"
      style={{
        background: "rgba(20, 38, 65, 0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-5xl mx-auto px-10 py-3">
        <div className="relative flex items-center gap-1">
          {/* Sliding border indicator */}
          <div
            className="absolute top-0 h-full rounded-full pointer-events-none"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              border: "1.5px solid #00c8f0",
              transition:
                "left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => onTabClick(tab.id)}
              className="relative z-10 px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
              style={{
                color: activeSection === tab.id ? "#00c8f0" : "#94a3b8",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
