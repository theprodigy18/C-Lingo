import { useState, useEffect } from 'react';
import {
  DashboardHero,
  TabNav,
  CourseSection,
  DailyStreakSection,
  CodingPracticeSection,
  LeaderboardSection,
} from '../../components/dashboard';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { getAuthSessionStatus } from '../../lib/authSession';
import { getUserState, claimDailyEnergy, getLeaderboard, type UserState } from '../../lib/api/user';
import { getLevels } from '../../lib/api/level';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';
import { useNavigate } from 'react-router';
import type { Level } from '../../types/level';
import type { LeaderboardEntry } from '../../types/leaderboard';

export const DashboardPage = () => {
  const [user, setUser] = useState<{ username: string; display_name: string; avatar_url: string } | null>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [leaderboard, setLeaderboard] = useState<{ userRank: number; entries: LeaderboardEntry[] }>({ userRank: 0, entries: [] });
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

  useEffect(() => {
    const fetchUserState = async () => {
      try {
        const state = await getUserState();
        if (state) {
          setUserState(state);
        } else {
          notification.error('Connection Error', 'Failed to load user state. Please refresh the page.');
        }
      } catch {
        notification.error('Connection Error', 'Failed to load user state. Please refresh the page.');
      }
    };

    const fetchLevels = async () => {
      try {
        const data = await getLevels();
        if (data.length === 0) {
          notification.error('Connection Error', 'Failed to load courses. Please refresh the page.');
        }
        setLevels(data);
      } catch {
        notification.error('Connection Error', 'Failed to load courses. Please refresh the page.');
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        if (data) {
          setLeaderboard(data);
        } else {
          notification.error('Connection Error', 'Failed to load leaderboard. Please refresh the page.');
        }
      } catch {
        notification.error('Connection Error', 'Failed to load leaderboard. Please refresh the page.');
      }
    };

    fetchUserState();
    fetchLevels();
    fetchLeaderboard();

    // Refresh state periodically when user cannot claim (countdown active)
    const interval = setInterval(async () => {
      if (userState && !userState.canClaimDailyEnergy) {
        const state = await getUserState();
        if (state) {
          setUserState(state);
        }
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleClaimDailyEnergy = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    try {
      const success = await claimDailyEnergy();

      if (success) {
        notification.success('Energy claimed!', 'You received daily energy.');
        const state = await getUserState();
        if (state) {
          setUserState(state);
        }
      } else {
        notification.error('Failed', 'Could not claim energy. Please try again.');
      }
    } catch (error) {
      notification.error('Error', 'An unexpected error occurred.');
    } finally {
      setIsClaiming(false);
    }
  };

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
      <Header userState={userState} />
      <DashboardHero user={user} />
      <TabNav />

      <main className="flex-grow">
        <section id="courses">
          <CourseSection levels={levels} />
        </section>

        <DailyStreakSection userState={userState} onClaimDailyEnergy={handleClaimDailyEnergy} isClaiming={isClaiming} />
        <CodingPracticeSection />
        <LeaderboardSection
            userRank={leaderboard.userRank}
            userAura={userState?.aura ?? 0}
            userDisplayName={user.display_name}
            userUsername={user.username}
            entries={leaderboard.entries}
          />
      </main>

      <Footer />
    </div>
  );
};