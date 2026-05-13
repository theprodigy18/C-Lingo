import { useState, useEffect } from 'react';
import {
  DashboardHeader,
  DashboardFooter,
  DashboardHero,
  TabNav,
  CourseSection,
  DailyStreakSection,
  CodingPracticeSection,
  LeaderboardSection,
} from '../../components/dashboard';
import { getAuthSessionStatus } from '../../lib/authSession';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';
import { useNavigate } from 'react-router';

export const DashboardPage = () => {
  const [user, setUser] = useState<{ username: string; display_name: string; avatar_url: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { sessionuser } = getAuthSessionStatus();
    if (!sessionuser) {
      notification.error('Unauthorized', 'Please sign in to access the dashboard.');
      navigate(routes.signIn, { replace: true });
      return;
    }
    setUser({
      username: sessionuser.username,
      display_name: sessionuser.display_name || sessionuser.username,
      avatar_url: sessionuser.avatar_url || '',
    });
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0d1b2a 100%)',
      }}
    >
      <DashboardHeader />
      <DashboardHero user={user} />
      <TabNav />

      <main className="flex-grow">
        <section id="courses">
          <CourseSection />
        </section>

        <DailyStreakSection />
        <CodingPracticeSection />
        <LeaderboardSection />
      </main>

      <DashboardFooter />
    </div>
  );
};