import { useEffect, useRef, useState } from "react";
import type { User } from "../types/auth";
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

const MOCK_CHALLENGES = [
  {
    id: 1,
    title: "Hello World",
    description: "Print 'Hello, World!' to the standard output.",
    difficulty: "Easy" as const,
    tags: ["I/O", "Basics"],
    solved: true,
  },
  {
    id: 2,
    title: "Sum of Two Integers",
    description:
      "Given two integers a and b, return their sum without using + or -.",
    difficulty: "Easy" as const,
    tags: ["Math", "Bit Manipulation"],
    solved: false,
  },
  {
    id: 3,
    title: "Reverse a String",
    description: "Write a function that reverses a string in-place.",
    difficulty: "Easy" as const,
    tags: ["String", "Array"],
    solved: false,
  },
  {
    id: 4,
    title: "FizzBuzz",
    description:
      "Print numbers 1 to n, replacing multiples of 3 with Fizz, 5 with Buzz.",
    difficulty: "Medium" as const,
    tags: ["Math", "Simulation"],
    solved: false,
  },
  {
    id: 5,
    title: "Linked List Cycle",
    description: "Detect if a linked list has a cycle using Floyd's algorithm.",
    difficulty: "Hard" as const,
    tags: ["Linked List", "Two Pointers"],
    solved: false,
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
  "practice",
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

  const handleSolve = (_id: number) => {
    toast.info("Problem editor coming soon!");
  };

  return (
    <AppLayout aura={100} energy={100}>
      <HeroSection user={user} />
      <TabNav activeSection={activeSection} onTabClick={handleTabClick} />

      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col gap-14">
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
          challenges={MOCK_CHALLENGES}
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
