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

function formatAura(aura: number) {
  return aura.toLocaleString("id-ID");
}

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const isFirst = entry.rank === 1;

  return (
    <div
      className="grid grid-cols-[34px_48px_1fr_auto] items-center gap-5 rounded-2xl px-5 py-3 text-white sm:px-7"
      style={{ background: isFirst ? "#68a6e0" : "transparent" }}
    >
      <span className="text-center text-2xl font-bold">{entry.rank}</span>
      <div className="h-10 w-10 overflow-hidden rounded-full bg-[#00579b]">
        {entry.avatar_url && (
          <img
            src={entry.avatar_url}
            alt={entry.display_name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <span className="truncate text-xl font-medium sm:text-2xl">
        {entry.display_name}
      </span>
      <span className="text-right text-base sm:text-xl">
        {formatAura(entry.aura)} Aura
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
    <section id="leaderboard" className="scroll-mt-40">
      <SectionHeader
        title="Leaderboard"
        sectionId="leaderboard"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div
        className="rounded-[48px] bg-[#547293] p-8"
        style={{ boxShadow: "0 0 46px rgba(35,215,255,0.85)" }}
      >
        <div className="space-y-1">
          {entries.map((entry) => (
            <LeaderboardRow key={entry.rank} entry={entry} />
          ))}
        </div>
      </div>
    </section>
  );
}
