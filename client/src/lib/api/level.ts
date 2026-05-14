import axios from 'axios';
import { getAuthSessionStatus } from '../../lib/authSession';
import type { Level, LevelDetail, QuizSubmitResult } from '../../types/level';

type LevelsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    levels?: Level[];
  };
};

type StartLevelApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    success: boolean;
    message: string;
    remaining_energy: number;
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

export type StartLevelResult = {
  success: boolean;
  message: string;
  remainingEnergy: number;
};

type LevelDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    level?: LevelDetail;
  };
};

export const getLevelDetail = async (levelId: number): Promise<LevelDetail | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.post<LevelDetailApiResponse>(
      `${baseUrl}/levels/detail`,
      { level_id: levelId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data.data?.level ?? null;
  } catch {
    return null;
  }
};

type QuizSubmitApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    score: number;
    total: number;
    correct: number;
    passed: boolean;
    is_completed: boolean;
    is_new_completion: boolean;
    results: Array<{
      question_id: number;
      question_text: string;
      selected_option_id: number;
      selected_option_text: string;
      correct_option_id: number;
      correct_option_text: string;
      is_correct: boolean;
      explanation: string;
    }>;
  };
};

export const submitQuiz = async (levelId: number, answers: Record<number, number>): Promise<QuizSubmitResult | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.post<QuizSubmitApiResponse>(
      `${baseUrl}/levels/quiz/submit`,
      { level_id: levelId, answers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      score: data.data?.score ?? 0,
      total: data.data?.total ?? 0,
      correct: data.data?.correct ?? 0,
      passed: data.data?.passed ?? false,
      isCompleted: data.data?.is_completed ?? false,
      isNewCompletion: data.data?.is_new_completion ?? false,
      results: data.data?.results ?? [],
    };
  } catch {
    return null;
  }
};

export const startLevel = async (levelId: number): Promise<StartLevelResult | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.post<StartLevelApiResponse>(
      `${baseUrl}/levels/start`,
      { level_id: levelId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: data.data?.success ?? false,
      message: data.data?.message ?? 'Unknown error',
      remainingEnergy: data.data?.remaining_energy ?? 0,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message,
        remainingEnergy: 0,
      };
    }
    return null;
  }
};