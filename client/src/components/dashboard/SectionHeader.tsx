import type { TabId } from "./TabNav";

interface SectionHeaderProps {
  title: string;
  sectionId: TabId;
  activeSection: TabId;
  onSeeAll?: () => void;
}

/**
 * Section title turns cyan when its sectionId matches activeSection.
 * activeSection is tracked by the parent (Dashboard) via scroll spy
 * shared with TabNav through a lifted state.
 */
export default function SectionHeader({
  title,
  sectionId,
  activeSection,
  onSeeAll,
}: SectionHeaderProps) {
  const isActive = sectionId === activeSection;

  return (
    <div className="mb-8 flex items-center justify-between scroll-mt-40">
      <h2
        className="text-2xl font-extrabold transition-colors duration-300"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: isActive ? "#23d7ff" : "#ffffff",
        }}
      >
        {title}
      </h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-xl font-medium text-white transition-colors hover:text-[#23d7ff]"
        >
          See All
        </button>
      )}
    </div>
  );
}
