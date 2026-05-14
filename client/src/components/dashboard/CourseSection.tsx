import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Level } from '../../types/level';
import { routes } from '../../lib/constants';

type CourseSectionProps = {
  levels: Level[];
};

const getCourseColor = (isUnlocked: boolean, isCompleted: boolean) => {
  if (isCompleted) return 'from-emerald-700 to-emerald-900';
  if (isUnlocked) return 'from-slate-700 to-slate-900';
  return 'from-gray-800 to-gray-900';
};

export const CourseSection = ({ levels }: CourseSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleCourseClick = (levelId: number) => {
    navigate(routes.course.replace(':id', String(levelId)));
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
          {levels.map((level) => (
            <div
              key={level.id}
              className={`flex-shrink-0 w-64 group ${level.is_unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            >
              <div
                className={`h-40 rounded-2xl bg-gradient-to-br ${getCourseColor(level.is_unlocked, level.is_completed)} relative overflow-hidden flex items-center justify-center transition-transform duration-300 ${level.is_unlocked ? 'group-hover:scale-105' : ''}`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-20 h-20 text-white/20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-1">
                  <span className="text-white text-xs font-bold">Level {level.level_number}</span>
                </div>
                {level.is_completed && (
                  <div className="absolute top-3 right-3 bg-emerald-500 rounded-full p-1">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {!level.is_unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-white font-semibold text-sm">{level.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};