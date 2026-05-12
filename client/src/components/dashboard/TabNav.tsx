import { useEffect, useRef, useState } from "react";

export type TabId =
  | "course"
  | "daily-streak"
  | "coding-practice"
  | "leaderboard";

const TABS: { label: string; id: TabId }[] = [
  { label: "Course", id: "course" },
  { label: "Daily Streak", id: "daily-streak" },
  { label: "Coding Practice", id: "coding-practice" },
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
    "coding-practice": null,
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
    <div className="sticky top-[68px] z-40 bg-[#213f62]/90 backdrop-blur-xl border-y border-white/15">
      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">
        <div className="relative flex w-full items-center gap-2 overflow-x-auto py-2 sm:gap-5">
          {/* Sliding border indicator */}
          <div
            className="pointer-events-none absolute top-2 h-[44px] rounded-full"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              border: "2px solid rgba(255,255,255,0.95)",
              background: "rgba(255,255,255,0.04)",
              boxShadow: "0 0 28px rgba(0,200,240,0.7)",
              transition:
                "left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
          {TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => onTabClick(tab.id)}
              className="relative z-10 h-[44px] shrink-0 rounded-full px-7 text-lg font-extrabold text-white transition-colors duration-200"
              style={{
                color: activeSection === tab.id ? "#23d7ff" : "#ffffff",
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
