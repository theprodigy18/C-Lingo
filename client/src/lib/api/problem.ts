import axios from 'axios';
import { getAuthSessionStatus } from '../../lib/authSession';
import type { ProblemDetail, ProblemListItem, SubmissionStatus, SubmissionListResponse, ProblemLeaderboardResponse } from '../../types/problem';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const baseUrl = apiBaseUrl.replace(/\/$/, '');

type ProblemListApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    problems?: Array<{
      id: number;
      title: string;
      slug: string;
      tags: string;
      difficulty: string;
      energy_cost: number;
      aura_reward: number;
    }>;
  };
};

export const getProblemList = async (): Promise<ProblemListItem[]> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return [];
  }

  try {
    const { data } = await axios.get<ProblemListApiResponse>(
      `${baseUrl}/problems`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return (data.data?.problems ?? []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      tags: p.tags ?? '',
      difficulty: (p.difficulty ?? 'easy') as 'easy' | 'medium' | 'hard',
      energyCost: p.energy_cost ?? 0,
      auraReward: p.aura_reward ?? 0,
    }));
  } catch {
    return [];
  }
};

type ProblemDetailApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    problem?: {
      id: number;
      title: string;
      slug: string;
      description_md: string;
      constraints_md: string;
      starter_code: string;
      entry_point: string;
      tags: string;
      difficulty: string;
      energy_cost: number;
      aura_reward: number;
      test_cases: Array<{
        id: number;
        problem_id: number;
        input_ui: string;
        input: string;
        expected_output: string;
        explanation_md: string;
        is_hidden: boolean;
        order_index: number;
      }>;
    };
  };
};

export const getProblemDetail = async (problemId: number): Promise<ProblemDetail | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.get<ProblemDetailApiResponse>(
      `${baseUrl}/problems/${problemId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!data.data?.problem) {
      return null;
    }

    const problem = data.data.problem;

    return {
      id: problem.id,
      title: problem.title,
      slug: problem.slug,
      descriptionMd: problem.description_md ?? '',
      constraintsMd: problem.constraints_md ?? '',
      starterCode: problem.starter_code ?? '',
      entryPoint: problem.entry_point ?? '',
      tags: problem.tags ?? '',
      difficulty: (problem.difficulty ?? 'easy') as 'easy' | 'medium' | 'hard',
      energyCost: problem.energy_cost ?? 0,
      auraReward: problem.aura_reward ?? 0,
      testCases: (problem.test_cases ?? []).map((tc) => ({
        id: tc.id,
        inputUi: tc.input_ui ?? '',
        input: tc.input ?? '',
        expectedOutput: tc.expected_output ?? '',
        explanationMd: tc.explanation_md ?? '',
        isHidden: tc.is_hidden ?? false,
        orderIndex: tc.order_index ?? 0,
      })),
    };
  } catch {
    return null;
  }
};

type SubmitCodeApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    submission_id?: number;
    status?: string;
  };
};

export interface SubmitCodeResult {
  submissionId: number;
  status: SubmissionStatus;
}

export const submitCode = async (
  problemId: number,
  code: string
): Promise<SubmitCodeResult | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.post<SubmitCodeApiResponse>(
      `${baseUrl}/problems/${problemId}/submit`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.data?.submission_id === undefined) {
      return null;
    }

    return {
      submissionId: data.data.submission_id,
      status: (data.data.status ?? 'pending') as SubmissionStatus,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

type SubmissionsApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    submissions?: Array<{
      id: number;
      problem_id: number;
      status: string;
      runtime_ms: number;
      memory_kb: number;
      error_output: string;
      submitted_at: string;
    }>;
    aura_just_earned?: boolean;
  };
};

export interface SubmissionDetail {
  id: number;
  problemId: number;
  status: SubmissionStatus;
  runtimeMs: number;
  memoryKb: number;
  errorOutput: string;
  submittedAt: string;
}

export const getSubmissions = async (problemId: number): Promise<SubmissionListResponse> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return { submissions: [], auraJustEarned: false };
  }

  try {
    const { data } = await axios.get<SubmissionsApiResponse>(
      `${baseUrl}/problems/${problemId}/submissions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const submissions = (data.data?.submissions ?? []).map((sub) => ({
      id: sub.id,
      problemId: sub.problem_id,
      status: sub.status as SubmissionStatus,
      runtimeMs: sub.runtime_ms ?? 0,
      memoryKb: sub.memory_kb ?? 0,
      errorOutput: sub.error_output ?? '',
      submittedAt: sub.submitted_at ?? '',
    }));

    return {
      submissions,
      auraJustEarned: data.data?.aura_just_earned ?? false,
    };
  } catch {
    return { submissions: [], auraJustEarned: false };
  }
};

export const getSubmissionById = async (
  problemId: number,
  submissionId: number
): Promise<SubmissionDetail | null> => {
  const response = await getSubmissions(problemId);
  const submission = response.submissions.find((s) => s.id === submissionId);
  if (!submission) return null;

  return {
    id: submission.id,
    problemId: submission.problemId,
    status: submission.status,
    runtimeMs: submission.runtimeMs,
    memoryKb: submission.memoryKb,
    errorOutput: submission.errorOutput,
    submittedAt: submission.submittedAt,
  };
};

type ProblemLeaderboardApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    user_rank_runtime?: number;
    user_runtime_ms?: number;
    runtime_leaderboard?: Array<{
      rank: number;
      user_id: number;
      username: string;
      display_name: string;
      runtime_ms: number;
      submitted_at: string;
    }>;
    user_rank_memory?: number;
    user_memory_kb?: number;
    memory_leaderboard?: Array<{
      rank: number;
      user_id: number;
      username: string;
      display_name: string;
      memory_kb: number;
      submitted_at: string;
    }>;
  };
};

export const getProblemLeaderboard = async (problemId: number, limit = 10): Promise<ProblemLeaderboardResponse | null> => {
  const { token } = getAuthSessionStatus();

  if (!token) {
    return null;
  }

  try {
    const { data } = await axios.get<ProblemLeaderboardApiResponse>(
      `${baseUrl}/problems/${problemId}/leaderboard`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { limit },
      }
    );

    const runtimeLeaderboard = (data.data?.runtime_leaderboard ?? []).map((entry) => ({
      rank: entry.rank,
      userId: entry.user_id,
      username: entry.username,
      displayName: entry.display_name,
      runtimeMs: entry.runtime_ms ?? 0,
      memoryKb: 0,
      submittedAt: entry.submitted_at ?? '',
    }));

    const memoryLeaderboard = (data.data?.memory_leaderboard ?? []).map((entry) => ({
      rank: entry.rank,
      userId: entry.user_id,
      username: entry.username,
      displayName: entry.display_name,
      runtimeMs: 0,
      memoryKb: entry.memory_kb ?? 0,
      submittedAt: entry.submitted_at ?? '',
    }));

    return {
      userRankRuntime: data.data?.user_rank_runtime ?? 0,
      userRuntimeMs: data.data?.user_runtime_ms ?? 0,
      runtimeLeaderboard,
      userRankMemory: data.data?.user_rank_memory ?? 0,
      userMemoryKb: data.data?.user_memory_kb ?? 0,
      memoryLeaderboard,
    };
  } catch {
    return null;
  }
};