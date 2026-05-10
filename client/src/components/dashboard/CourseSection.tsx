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

function CourseCardItem({ course }: { course: CourseCard }) {
  return (
    <div
      className="relative shrink-0 w-48 rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1"
      style={{
        background: "#1a3050",
        border: course.locked
          ? "1px solid rgba(255,255,255,0.08)"
          : "2px solid #00c8f0",
        boxShadow: course.locked ? "none" : "0 0 18px rgba(0,200,240,0.25)",
      }}
    >
      <div
        className="w-full h-28 relative overflow-hidden"
        style={{ background: "#0f2240" }}
      >
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        {!course.thumbnail && (
          <div className="absolute inset-0 p-3 flex flex-col gap-1.5 opacity-40">
            {[
              "#include <stdio.h>",
              "int main() {",
              '  printf("Hi");',
              "  return 0;",
              "}",
            ].map((line, i) => (
              <p key={i} className="text-[9px] font-mono text-[#00c8f0]">
                {line}
              </p>
            ))}
          </div>
        )}
        {course.locked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: "rgba(10,25,45,0.55)",
              backdropFilter: "blur(2px)",
            }}
          >
            <span className="text-2xl">🔒</span>
          </div>
        )}
        {!course.locked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)" }}
            >
              <svg width="12" height="14" viewBox="0 0 12 14" fill="#1a2e4a">
                <path d="M1 1l10 6-10 6V1z" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="p-3 text-center">
        <p className="text-white text-sm font-semibold">{course.title}</p>
        {course.locked ? (
          <p className="text-slate-500 text-[10px] mt-1 leading-tight">
            To access this lesson, please complete the previous lesson first
          </p>
        ) : (
          <p className="text-slate-400 text-xs mt-0.5">{course.subtitle}</p>
        )}
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
    <section id="course" className="scroll-mt-36">
      <SectionHeader
        title="Course"
        sectionId="course"
        activeSection={activeSection}
        onSeeAll={onSeeAll}
      />
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
        {courses.map((course) => (
          <CourseCardItem key={course.id} course={course} />
        ))}
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {courses.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: i === 0 ? "#00c8f0" : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
