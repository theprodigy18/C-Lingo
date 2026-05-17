import { useState, useEffect, useRef } from 'react';
import type { UserState } from '../../lib/api/user';

type DailyStreakSectionProps = {
  userState: UserState | null;
  onClaimDailyEnergy: () => void;
  isClaiming?: boolean;
};

export const DailyStreakSection = ({ userState, onClaimDailyEnergy, isClaiming = false }: DailyStreakSectionProps) => {
  const [countdown, setCountdown] = useState<number>(0);
  const currentStreak = userState?.currentStreak ?? 0;
  const canClaim = userState?.canClaimDailyEnergy ?? false;

  // Store initial countdown value to avoid reset on server refresh
  const initialCountdownRef = useRef<number>(0);
  const lastClaimTimeRef = useRef<number>(0);

  // Initialize countdown when userState first becomes available
  useEffect(() => {
    if (!userState) {
      setCountdown(0);
      return;
    }

    if (canClaim) {
      setCountdown(0);
      initialCountdownRef.current = 0;
      return;
    }

    // Set initial countdown from server only if we don't have one yet
    if (initialCountdownRef.current === 0 && userState.nextEnergyRefillSeconds > 0) {
      initialCountdownRef.current = userState.nextEnergyRefillSeconds;
      lastClaimTimeRef.current = Date.now();
      setCountdown(userState.nextEnergyRefillSeconds);
    }
  }, [userState?.nextEnergyRefillSeconds, canClaim]);

  // Decrement countdown every second
  useEffect(() => {
    if (canClaim || countdown <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => {
        const next = prev - 1;
        return next < 0 ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canClaim, countdown]);

  // Format countdown timer
  const formatCountdown = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  // Build 7-day grid
  // - Streak 0, canClaim: Days 1-7, only Day 1 claimable
  // - Streak 0, !canClaim: Days 1-7, all locked
  // - Streak >= 1, canClaim: Days (streak+1) to (streak+7), only (streak+1) claimable
  // - Streak >= 1, !canClaim: Days (streak) to (streak+6), Day streak completed, rest locked
  const getDays = () => {
    if (currentStreak === 0) {
      // New user - has not started streak yet
      return Array.from({ length: 7 }, (_, i) => ({
        dayNumber: i + 1,
        status: i === 0 ? (canClaim ? 'claimable' : 'locked') : 'locked' as const,
      }));
    }

    // User has an active streak
    const startDay = canClaim ? currentStreak + 1 : currentStreak;

    return Array.from({ length: 7 }, (_, i) => {
      const dayNumber = startDay + i;

      if (canClaim) {
        // Only first day is claimable
        return {
          dayNumber,
          status: i === 0 ? ('claimable' as const) : ('pending' as const),
        };
      } else {
        // First day is completed (claimed yesterday), rest are locked
        return {
          dayNumber,
          status: i === 0 ? ('completed' as const) : ('locked' as const),
        };
      }
    });
  };

  const days = getDays();

  return (
    <section id="streak" className="py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Daily Streak</h2>
              <p className="text-gray-400 text-sm">
                {canClaim ? 'Claim your daily energy!' : 'Keep your streak going!'}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#22D3EE]/10 border border-[#22D3EE]/30 rounded-full px-4 py-2">
              <svg className="w-5 h-5 text-[#22D3EE]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2Z"/>
              </svg>
              <span className="text-[#22D3EE] font-bold text-lg">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {days.map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 mb-1">Day {item.dayNumber}</span>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    item.status === 'completed'
                      ? 'bg-[#22D3EE] text-[#071626]'
                      : item.status === 'claimable'
                        ? 'bg-[#22D3EE]/50 text-[#071626] animate-pulse'
                        : 'bg-white/5 border border-white/20 text-gray-600' // locked or pending
                  }`}
                >
                  {item.status === 'completed' ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : item.status === 'locked' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <span className="text-sm font-semibold">{item.dayNumber}</span>
                  )}
                </div>
                {item.status === 'claimable' && (
                  <button
                    type="button"
                    onClick={onClaimDailyEnergy}
                    disabled={isClaiming}
                    className="px-3 py-1 bg-[#22D3EE] text-[#071626] text-xs font-semibold rounded-full hover:bg-[#67e8f9] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? 'Claiming...' : 'Claim'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {!canClaim && countdown > 0 && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                Next energy refill in: <span className="text-[#22D3EE] font-semibold">{formatCountdown(countdown)}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};