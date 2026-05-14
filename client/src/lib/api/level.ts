import axios from 'axios';
import { getAuthSessionStatus } from '../../lib/authSession';
import type { Level } from '../../types/level';

type LevelsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    levels?: Level[];
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const baseUrl = apiBaseUrl.replace(/\/$/, '');

export const getLevels = async (): Promise<Level[]> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return [];
  }

  try {
    const { data } = await axios.get<LevelsApiResponse>(`${baseUrl}/levels`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data?.data?.levels ?? [];
  } catch {
    return [];
  }
};