import SectionHeader from "./SectionHeader";
import type { TabId } from "./TabNav";

type Difficulty = "Easy" | "Medium" | "Hard";

interface PracticeChallenge {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  solved: boolean;
}

interface PracticeSectionProps {
  challenges: PracticeChallenge[];
  activeSection: TabId;
  onSeeAll?: () => void;
  onSolve: (id: number) => void;
}

const difficultyColor: Record<Difficulty, string> = {
  Easy: "#22c55e",
  Medium: "#f59e0b",
  Hard: "#ef4444",
};

function ChallengeRow({
  challenge,
  onSolve,
}: {
  challenge: PracticeChallenge;
  onSolve: (id: number) => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4 rounded-2xl group hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      style={{
        background: challenge.solved
          ? "rgba(0,200,240,0.05)"
          : "rgba(255,255,255,0.03)",
        border: challenge.solved
          ? "1px solid rgba(0,200,240,0.2)"
          : "1px solid rgba(255,255,255,0.06)",
      }}
      onClick={() => !challenge.solved && onSolve(challenge.id)}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{
            background: challenge.solved ? "#00c8f0" : "rgba(255,255,255,0.2)",
          }}
        />
        <div>
          <p className="text-white text-sm font-semibold">{challenge.title}</p>
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">
            {challenge.description}
          </p>
          <div className="flex gap-2 mt-1.5">
            {challenge.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full text-slate-400"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span
          className="text-xs font-bold"
          style={{ color: difficultyColor[challenge.difficulty] }}
        >
          {challenge.difficulty}
        </span>
        {challenge.solved ? (
          <span className="text-[#00c8f0] text-xs font-semibold">Solved ✓</span>
        ) : (
          <span className="text-xs text-slate-500 group-hover:text-[#00c8f0] transition-colors">
            Solve →
          </span>
        )}
      </div>
    </div>
  );
}

export default function PracticeSection({
  challenges,
  activeSection,
  onSeeAll,
  onSolve,
}: PracticeSectionProps) {
  return (
    <section id="practice" className="scroll-mt-36">
      <SectionHeader
        title="Coding Practice"
        sectionId="practice"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div className="flex flex-col gap-3">
        {challenges.map((challenge) => (
          <ChallengeRow
            key={challenge.id}
            challenge={challenge}
            onSolve={onSolve}
          />
        ))}
      </div>
    </section>
  );
}
