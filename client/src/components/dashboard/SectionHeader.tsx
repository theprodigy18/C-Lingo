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
    <div className="flex items-center justify-between mb-5 scroll-mt-36">
      <h2
        className="text-lg font-bold transition-colors duration-300"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: isActive ? "#00c8f0" : "#ffffff",
        }}
      >
        {title}
      </h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="text-sm text-white hover:text-[#00c8f0] transition-colors"
        >
          See All
        </button>
      )}
    </div>
  );
}
