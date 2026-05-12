import SectionHeader from "./SectionHeader";
import type { TabId } from "./TabNav";

interface CourseCard {
  id: number;
  title: string;
  subtitle: string;
  thumbnail?: string;
  locked: boolean;
}

interface CourseSectionProps {
  courses: CourseCard[];
  activeSection: TabId;
  onSeeAll?: () => void;
}

function CodeImage() {
  return (
    <div className="absolute inset-0 bg-[#05233d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(0,216,255,0.65),transparent_12%),linear-gradient(135deg,rgba(0,216,255,0.35),transparent_38%)]" />
      <div className="absolute inset-0 -rotate-6 px-5 py-4 opacity-80">
        {[
          "const lesson = await start();",
          "function solve(input) {",
          "  return input.map(run);",
          "}",
          "console.log('CLinggo');",
        ].map((line) => (
          <p key={line} className="font-mono text-[10px] leading-5 text-[#3be4ff]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#5f7fa4]">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 10V8a5 5 0 0 1 10 0v2"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="5" y="10" width="14" height="11" rx="3" fill="white" />
        <circle cx="12" cy="15" r="1.8" fill="#5f7fa4" />
      </svg>
    </span>
  );
}

function CourseCardItem({ course }: { course: CourseCard }) {
  return (
    <div
      className="relative h-[230px] min-w-[250px] overflow-hidden rounded-[22px] bg-[#547293] sm:min-w-[315px]"
      style={{
        boxShadow: course.locked
          ? "none"
          : "0 0 34px rgba(35,215,255,0.85)",
      }}
    >
      <div className="relative h-[130px] overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <CodeImage />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#547293] to-transparent" />
        {course.locked ? (
          <div className="absolute bottom-5 right-6">
            <LockIcon />
          </div>
        ) : (
          <div className="absolute bottom-4 right-5 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/85 bg-[#385477]">
            <svg width="18" height="22" viewBox="0 0 18 22" fill="white">
              <path d="M2 2l14 9-14 9V2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="px-5 pt-2 text-center text-white">
        <p className="text-xl font-semibold">{course.title}</p>
        <p className="mx-auto mt-1 max-w-[210px] text-[11px] leading-snug text-white/85">
          {course.locked
            ? "To access this lesson, please complete the previous lesson first"
            : course.subtitle}
        </p>
      </div>
    </div>
  );
}

export default function CourseSection({
  courses,
  activeSection,
  onSeeAll,
}: CourseSectionProps) {
  return (
    <section id="course" className="scroll-mt-40">
      <SectionHeader
        title="Course"
        sectionId="course"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div className="flex gap-16 overflow-x-auto pb-8 pt-1">
        {courses.map((course) => (
          <CourseCardItem key={course.id} course={course} />
        ))}
      </div>
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full bg-[#23d7ff]" />
        ))}
      </div>
    </section>
  );
}
