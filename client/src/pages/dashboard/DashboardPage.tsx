import { useState, useEffect } from 'react';
import {
  DashboardHeader,
  DashboardFooter,
  TabNav,
  HeroSection,
  CourseSection,
  DailyStreakSection,
  CodingPracticeSection,
  LeaderboardSection,
} from '../../components/dashboard';

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveTab(entry.target.id);
          }
        });
      },
      { threshold: 0.4 }
    );

    ['courses', 'streak', 'practice', 'leaderboard'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%)' }}>
      <DashboardHeader />
      <HeroSection />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-7xl mx-auto px-6 pb-20 flex-grow w-full">
        <div className="space-y-20">
          <CourseSection />
          <DailyStreakSection />
          <CodingPracticeSection />
          <LeaderboardSection />
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};