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

function StreakDayCard({
  streak,
  onClaim,
}: {
  streak: StreakDay;
  onClaim: (day: number) => void;
}) {
  const isDay1 = streak.day === 1;
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div
        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
        style={{
          background:
            isDay1 && streak.available
              ? "linear-gradient(135deg, #1e3a6e, #162d57)"
              : "#1e3050",
          border:
            isDay1 && streak.available
              ? "1px solid rgba(255,180,0,0.5)"
              : "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            isDay1 && streak.available
              ? "0 0 16px rgba(255,180,0,0.2)"
              : "none",
        }}
      >
        {isDay1 && streak.available ? (
          <span className="text-2xl">⚡</span>
        ) : (
          <>
            <span className="text-slate-500 text-base">🔒</span>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
              Day {streak.day}
            </p>
          </>
        )}
      </div>
      <button
        onClick={() =>
          streak.available && !streak.claimed && onClaim(streak.day)
        }
        disabled={streak.claimed || !streak.available}
        className="text-xs font-semibold px-4 py-1 rounded-full transition-all duration-200"
        style={{
          background:
            streak.available && !streak.claimed
              ? "#1e3a6e"
              : "rgba(255,255,255,0.04)",
          border:
            streak.available && !streak.claimed
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid rgba(255,255,255,0.06)",
          color: streak.available && !streak.claimed ? "#ffffff" : "#475569",
          cursor:
            streak.available && !streak.claimed ? "pointer" : "not-allowed",
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
    <section id="daily-streak" className="scroll-mt-36">
      <SectionHeader
        title="Daily Streak"
        sectionId="daily-streak"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {streaks.map((streak) => (
          <StreakDayCard key={streak.day} streak={streak} onClaim={onClaim} />
        ))}
      </div>
    </section>
  );
}
