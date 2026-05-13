import { useRef, useState } from 'react';

const courses = [
  { level: 1, title: 'Introduction to C', color: 'from-slate-700 to-slate-900' },
  { level: 2, title: 'Variables & Data Types', color: 'from-slate-700 to-slate-900' },
  { level: 3, title: 'Control Flow', color: 'from-slate-700 to-slate-900' },
  { level: 4, title: 'Functions', color: 'from-slate-700 to-slate-900' },
  { level: 5, title: 'Arrays & Pointers', color: 'from-slate-700 to-slate-900' },
  { level: 6, title: 'Structures', color: 'from-slate-700 to-slate-900' },
  { level: 7, title: 'File Handling', color: 'from-slate-700 to-slate-900' },
];

export const CourseSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseLeave = () => {
    handleMouseUp();
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#22D3EE]">Courses</h2>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 cursor-grab select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {courses.map((course) => (
            <div
              key={course.level}
              className="flex-shrink-0 w-64 group cursor-pointer"
            >
              <div
                className={`h-40 rounded-2xl bg-gradient-to-br ${course.color} relative overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-white text-xs font-bold">Level {course.level}</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-white font-semibold text-sm">{course.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};