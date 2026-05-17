import axios from 'axios';
import { getAuthSessionStatus } from '../../lib/authSession';
import type { EditProfileFormData } from '../../types/auth';
import type { LeaderboardEntry } from '../../types/leaderboard';

export type UserStateResponse = {
  success: boolean;
  message?: string;
  data?: {
    user?: {
      aura: number;
      energy: number;
      current_streak: number;
      longest_streak: number;
      can_claim_daily_energy: boolean;
      next_energy_refill_seconds: number;
    };
  };
};

export type UserState = {
  aura: number;
  energy: number;
  currentStreak: number;
  longestStreak: number;
  canClaimDailyEnergy: boolean;
  nextEnergyRefillSeconds: number;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const baseUrl = apiBaseUrl.replace(/\/$/, '');

export const getUserState = async (): Promise<UserState | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  const { data } = await axios.get<UserStateResponse>(`${baseUrl}/user/me/state`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!data.data?.user) {
    return null;
  }

  return {
    aura: data.data.user.aura,
    energy: data.data.user.energy,
    currentStreak: data.data.user.current_streak,
    longestStreak: data.data.user.longest_streak,
    canClaimDailyEnergy: data.data.user.can_claim_daily_energy,
    nextEnergyRefillSeconds: data.data.user.next_energy_refill_seconds,
  };
};

export const claimDailyEnergy = async (): Promise<boolean> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return false;
  }

  try {
    await axios.post(
      `${baseUrl}/user/me/energy/claim`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return true;
  } catch {
    return false;
  }
};

type LeaderboardApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    user_rank?: number;
    entries?: LeaderboardEntry[];
  };
};

export const getLeaderboard = async (): Promise<{ userRank: number; entries: LeaderboardEntry[] } | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.get<LeaderboardApiResponse>(`${baseUrl}/user/me/leaderboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      userRank: data?.data?.user_rank ?? 0,
      entries: data?.data?.entries ?? [],
    };
  } catch {
    return null;
  }
};

export type EditProfileResponse = {
  success: boolean;
  message?: string;
};

export const editProfile = async (data: EditProfileFormData): Promise<EditProfileResponse> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return { success: false, message: 'Not authenticated' };
  }

  try {
    await axios.put(
      `${baseUrl}/user/me`,
      {
        username: data.username,
        display_name: data.displayName,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true };
  } catch (error) {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'Failed to update profile';
    return { success: false, message };
  }
};