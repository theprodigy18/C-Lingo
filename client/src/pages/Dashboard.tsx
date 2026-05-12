import { useEffect, useRef, useState } from "react";
import type { Problem, User } from "../types/auth";
import ProtectedRoute from "../components/common/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import HeroSection from "../components/dashboard/HeroSection";
import TabNav, { type TabId } from "../components/dashboard/TabNav";
import CourseSection from "../components/dashboard/CourseSection";
import DailyStreakSection from "../components/dashboard/DailyStreakSection";
import PracticeSection from "../components/dashboard/PracticeSection";
import LeaderboardSection from "../components/dashboard/LeaderboardSection";
import { toast } from "../lib/alert";

// ── Mock data ────────────────────────────────────────────

const MOCK_COURSES = [
  { id: 1, title: "Level 1", subtitle: "Introduction C", locked: false },
  { id: 2, title: "Locked", subtitle: "Complete Level 1 first", locked: true },
  { id: 3, title: "Locked", subtitle: "Complete Level 2 first", locked: true },
];

const MOCK_STREAKS = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  claimed: false,
  available: i === 0,
}));

const MOCK_PROBLEMS: Problem[] = [
  {
    id: 1,
    title: "Hello World",
    slug: "hello-world",
    description_md: "Print Hello, World! to the standard output.",
    constraints_md: "Use C and return 0 from main.",
    starter_code: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
    difficulty: "easy",
    energy_cost: 5,
    aura_reward: 100,
    is_published: true,
    created_at: "2026-05-12T00:00:00Z",
    submission_status: "accepted",
  },
  {
    id: 2,
    title: "Sum of Two Integers",
    slug: "sum-of-two-integers",
    description_md:
      "Read two integers from input and print their sum without extra text.",
    constraints_md: "-10^9 <= a, b <= 10^9",
    starter_code: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
    difficulty: "easy",
    energy_cost: 5,
    aura_reward: 100,
    is_published: true,
    created_at: "2026-05-12T00:00:00Z",
    submission_status: "wrong_answer",
  },
  {
    id: 3,
    title: "Reverse a String",
    slug: "reverse-a-string",
    description_md: "Reverse the provided string and print the result.",
    constraints_md: "1 <= length <= 10^5",
    starter_code: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
    difficulty: "easy",
    energy_cost: 5,
    aura_reward: 120,
    is_published: true,
    created_at: "2026-05-12T00:00:00Z",
  },
  {
    id: 4,
    title: "FizzBuzz",
    slug: "fizzbuzz",
    description_md:
      "Print numbers from 1 to n, replacing multiples of 3 with Fizz and multiples of 5 with Buzz.",
    constraints_md: "1 <= n <= 10^4",
    starter_code: '#include <stdio.h>\n\nint main() {\n    return 0;\n}',
    difficulty: "medium",
    energy_cost: 8,
    aura_reward: 180,
    is_published: true,
    created_at: "2026-05-12T00:00:00Z",
  },
  {
    id: 5,
    title: "Linked List Cycle",
    slug: "linked-list-cycle",
    description_md:
      "Determine whether a linked list contains a cycle using an efficient approach.",
    constraints_md: "0 <= node count <= 10^5",
    starter_code: "int hasCycle(struct ListNode *head) {\n    return 0;\n}",
    difficulty: "hard",
    energy_cost: 12,
    aura_reward: 300,
    is_published: true,
    created_at: "2026-05-12T00:00:00Z",
  },
];

const MOCK_LEADERBOARD = [
  { rank: 1, display_name: "Furab", aura: 10000 },
  { rank: 2, display_name: "Sugeng Kos", aura: 5000 },
  { rank: 3, display_name: "TheProdigy", aura: 4100 },
  { rank: 4, display_name: "Komdigy MBG", aura: 3000 },
  { rank: 5, display_name: "ALgad5ss5", aura: 1400 },
  { rank: 6, display_name: "LerrBoyy", aura: 1000 },
  { rank: 7, display_name: "Jo TI Timur Minim Pembangunan", aura: 500 },
  { rank: 8, display_name: "JasonSlav & Faridoanks", aura: 0 },
];

// ─────────────────────────────────────────────────────────

const SCROLL_OFFSET = 160;
const SECTION_IDS: TabId[] = [
  "course",
  "daily-streak",
  "coding-practice",
  "leaderboard",
];

function DashboardContent() {
  const storedUser = localStorage.getItem("user");
  const user: User = storedUser
    ? JSON.parse(storedUser)
    : {
        id: 0,
        username: "guest",
        display_name: "Guest",
        email: "",
        avatar_url: "",
      };

  const [streaks, setStreaks] = useState(MOCK_STREAKS);

  // Shared active section state — drives both TabNav indicator and SectionHeader color
  const [activeSection, setActiveSection] = useState<TabId>("course");
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (isClickScrolling.current) return;
      let current: TabId = "course";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= SCROLL_OFFSET) current = id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleTabClick = (id: TabId) => {
    setActiveSection(id);
    const target = document.getElementById(id);
    if (!target) return;
    isClickScrolling.current = true;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 900);
  };

  const handleClaim = (day: number) => {
    setStreaks((prev) =>
      prev.map((s) => (s.day === day ? { ...s, claimed: true } : s)),
    );
    toast.success(`Day ${day} streak claimed!`);
  };

  const handleSolve = (problem: Problem) => {
    toast.info(`${problem.title} editor coming soon!`);
  };

  return (
    <AppLayout aura={100} energy={100}>
      <HeroSection user={user} />
      <TabNav activeSection={activeSection} onTabClick={handleTabClick} />

      <div className="mx-auto flex max-w-6xl flex-col gap-28 px-6 py-20 sm:px-10">
        <CourseSection
          courses={MOCK_COURSES}
          activeSection={activeSection}
          onSeeAll={() => toast.info("Coming soon!")}
        />
        <DailyStreakSection
          streaks={streaks}
          activeSection={activeSection}
          onSeeAll={() => toast.info("Coming soon!")}
          onClaim={handleClaim}
        />
        <PracticeSection
          problems={MOCK_PROBLEMS}
          activeSection={activeSection}
          onSeeAll={() => toast.info("Coming soon!")}
          onSolve={handleSolve}
        />
        <LeaderboardSection
          entries={MOCK_LEADERBOARD}
          activeSection={activeSection}
          onSeeAll={() => toast.info("Coming soon!")}
        />
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
