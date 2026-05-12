import SectionHeader from "./SectionHeader";
import type { TabId } from "./TabNav";

interface StreakDay {
  day: number;
  claimed: boolean;
  available: boolean;
}

interface DailyStreakSectionProps {
  streaks: StreakDay[];
  activeSection: TabId;
  onSeeAll?: () => void;
  onClaim: (day: number) => void;
}

function SmallLock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 10V8a4 4 0 0 1 8 0v2"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="6" y="10" width="12" height="10" rx="3" fill="white" />
      <circle cx="12" cy="15" r="1.5" fill="#d59c35" />
    </svg>
  );
}

function StreakDayCard({
  streak,
  onClaim,
}: {
  streak: StreakDay;
  onClaim: (day: number) => void;
}) {
  const available = streak.available && !streak.claimed;

  return (
    <div className="flex min-w-[112px] flex-col items-center gap-4">
      <div
        className="flex h-[78px] w-[104px] items-center justify-center rounded-[28px] border-[6px] border-[#5f7fa4] bg-[#547293]"
        style={{
          boxShadow: available ? "0 0 26px rgba(35,215,255,0.85)" : "none",
        }}
      >
        {streak.day === 1 ? (
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#23d7ff] text-3xl">
            <span className="text-[#ffb13b]">⚡</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1 text-white">
            <SmallLock />
            <span className="text-sm font-extrabold">Day {streak.day}</span>
          </div>
        )}
      </div>
      <button
        onClick={() => available && onClaim(streak.day)}
        disabled={!available}
        className="rounded-full border border-white px-5 py-1 text-xs font-bold transition-colors"
        style={{
          background: available ? "#ffffff" : "transparent",
          color: available ? "#244668" : "#23d7ff",
          cursor: available ? "pointer" : "not-allowed",
        }}
      >
        {streak.claimed ? "Claimed" : "Claim"}
      </button>
    </div>
  );
}

export default function DailyStreakSection({
  streaks,
  activeSection,
  onSeeAll,
  onClaim,
}: DailyStreakSectionProps) {
  return (
    <section id="daily-streak" className="scroll-mt-40">
      <SectionHeader
        title="Daily Streak"
        sectionId="daily-streak"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div className="flex gap-7 overflow-x-auto pb-2">
        {streaks.map((streak) => (
          <StreakDayCard key={streak.day} streak={streak} onClaim={onClaim} />
        ))}
      </div>
    </section>
  );
}
