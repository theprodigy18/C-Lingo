import type { Problem, ProblemDifficulty, SubmissionStatus } from "../../types/auth";
import SectionHeader from "./SectionHeader";
import type { TabId } from "./TabNav";

interface PracticeSectionProps {
  problems: Problem[];
  activeSection: TabId;
  onSeeAll?: () => void;
  onSolve: (problem: Problem) => void;
}

const difficultyStyles: Record<
  ProblemDifficulty,
  { label: string; className: string }
> = {
  easy: {
    label: "Easy",
    className: "bg-emerald-400/15 text-emerald-300 ring-emerald-300/30",
  },
  medium: {
    label: "Medium",
    className: "bg-amber-300/15 text-amber-200 ring-amber-200/30",
  },
  hard: {
    label: "Hard",
    className: "bg-rose-400/15 text-rose-300 ring-rose-300/30",
  },
};

const statusLabels: Partial<Record<SubmissionStatus, string>> = {
  accepted: "Solved",
  wrong_answer: "Attempted",
  compile_error: "Attempted",
  runtime_error: "Attempted",
  time_limit_exceeded: "Attempted",
  memory_limit_exceeded: "Attempted",
  pending: "Pending",
  running: "Running",
};

function StatusBadge({ status }: { status?: SubmissionStatus }) {
  if (!status) {
    return (
      <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white/60 ring-1 ring-white/10">
        New
      </span>
    );
  }

  const isSolved = status === "accepted";
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
        isSolved
          ? "bg-[#23d7ff]/15 text-[#23d7ff] ring-[#23d7ff]/40"
          : "bg-amber-300/15 text-amber-200 ring-amber-200/30"
      }`}
    >
      {statusLabels[status] ?? "Attempted"}
    </span>
  );
}

function ProblemRow({
  problem,
  index,
  onSolve,
}: {
  problem: Problem;
  index: number;
  onSolve: (problem: Problem) => void;
}) {
  const difficulty = difficultyStyles[problem.difficulty];
  const solved = problem.submission_status === "accepted";

  return (
    <button
      type="button"
      onClick={() => onSolve(problem)}
      className="grid w-full grid-cols-1 gap-4 rounded-[22px] px-5 py-5 text-left text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#6384a8] md:grid-cols-[52px_1fr_120px_110px_110px_110px]"
      style={{
        background: solved ? "rgba(35,215,255,0.1)" : "rgba(255,255,255,0.04)",
        border: solved
          ? "1px solid rgba(35,215,255,0.35)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center gap-3 md:block">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00579b] text-sm font-extrabold">
          {index + 1}
        </span>
        <span className="text-sm font-bold text-white/50 md:hidden">
          Problem
        </span>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="truncate text-xl font-extrabold">{problem.title}</h3>
          <StatusBadge status={problem.submission_status} />
        </div>
        <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-white/65">
          {problem.description_md}
        </p>
      </div>

      <div className="flex items-center md:justify-center">
        <span
          className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${difficulty.className}`}
        >
          {difficulty.label}
        </span>
      </div>

      <div className="flex items-center text-sm font-bold text-white/85 md:justify-center">
        {problem.energy_cost} Energy
      </div>

      <div className="flex items-center text-sm font-bold text-[#23d7ff] md:justify-center">
        +{problem.aura_reward} Aura
      </div>

      <div className="flex items-center md:justify-end">
        <span className="rounded-full bg-white px-5 py-2 text-sm font-extrabold text-[#244668]">
          {solved ? "Review" : "Solve"}
        </span>
      </div>
    </button>
  );
}

export default function PracticeSection({
  problems,
  activeSection,
  onSeeAll,
  onSolve,
}: PracticeSectionProps) {
  return (
    <section id="coding-practice" className="scroll-mt-40">
      <SectionHeader
        title="Coding Practice"
        sectionId="coding-practice"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />

      <div
        className="overflow-hidden rounded-[34px] bg-[#547293] p-4 sm:p-6"
        style={{ boxShadow: "0 0 38px rgba(35,215,255,0.55)" }}
      >
        <div className="hidden grid-cols-[52px_1fr_120px_110px_110px_110px] px-5 pb-3 text-xs font-extrabold uppercase tracking-wide text-white/55 md:grid">
          <span>#</span>
          <span>Title</span>
          <span className="text-center">Difficulty</span>
          <span className="text-center">Cost</span>
          <span className="text-center">Reward</span>
          <span className="text-right">Action</span>
        </div>

        <div className="space-y-3">
          {problems.map((problem, index) => (
            <ProblemRow
              key={problem.id}
              problem={problem}
              index={index}
              onSolve={onSolve}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
