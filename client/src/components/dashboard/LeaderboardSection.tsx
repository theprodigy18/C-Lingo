import SectionHeader from "./SectionHeader";
import type { TabId } from "./TabNav";

interface LeaderboardEntry {
  rank: number;
  display_name: string;
  avatar_url?: string;
  aura: number;
  isCurrentUser?: boolean;
}

interface LeaderboardSectionProps {
  entries: LeaderboardEntry[];
  activeSection: TabId;
  onSeeAll?: () => void;
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 rounded-xl"
      style={{
        background: isFirst
          ? "linear-gradient(90deg, #2a5298 0%, #1e3f7a 100%)"
          : "transparent",
      }}
    >
      <div className="flex items-center gap-4">
        <span
          className="font-bold text-sm w-5 text-center"
          style={{ color: isFirst ? "#ffffff" : "#94a3b8" }}
        >
          {entry.rank}
        </span>
        <div
          className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#1e3f7a" }}
        >
          {entry.avatar_url ? (
            <img
              src={entry.avatar_url}
              alt={entry.display_name}
              className="w-full h-full object-cover"
            />
          ) : (
            entry.display_name.charAt(0).toUpperCase()
          )}
        </div>
        <span className="text-sm font-medium text-white">
          {entry.display_name}
        </span>
      </div>
      <span className="text-sm font-semibold text-white">
        {entry.aura.toLocaleString()} Aura
      </span>
    </div>
  );
}

export default function LeaderboardSection({
  entries,
  activeSection,
  onSeeAll,
}: LeaderboardSectionProps) {
  return (
    <section id="leaderboard" className="scroll-mt-36">
      <SectionHeader
        title="Leaderboard"
        sectionId="leaderboard"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div
        className="rounded-3xl overflow-hidden py-2"
        style={{
          background: "linear-gradient(160deg, #1a3a64 0%, #112a4e 100%)",
          border: "2px solid #00c8f0",
          boxShadow:
            "0 0 32px rgba(0,200,240,0.2), inset 0 0 40px rgba(0,100,180,0.1)",
        }}
      >
        {entries.map((entry) => (
          <LeaderboardRow key={entry.rank} entry={entry} />
        ))}
      </div>
    </section>
  );
}
