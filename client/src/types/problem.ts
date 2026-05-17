export type TestCase = {
  id: number;
  inputUi: string;
  input: string;
  expectedOutput: string;
  explanationMd: string;
  isHidden: boolean;
  orderIndex: number;
};

export type Problem = {
  id: number;
  title: string;
  slug: string;
  descriptionMd: string;
  constraintsMd: string;
  starterCode: string;
  tags: string;
  difficulty: 'easy' | 'medium' | 'hard';
  energyCost: number;
  auraReward: number;
  isPublished: boolean;
  createdAt: string;
  testCases: TestCase[];
};

export type SubmissionStatus =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'compilation_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'output_limit_exceeded'
  | 'internal_error';

export interface ProblemListItem {
  id: number;
  title: string;
  slug: string;
  tags: string;
  difficulty: 'easy' | 'medium' | 'hard';
  energyCost: number;
  auraReward: number;
}

export interface ProblemDetail {
  id: number;
  title: string;
  slug: string;
  descriptionMd: string;
  constraintsMd: string;
  starterCode: string;
  entryPoint: string;
  tags: string;
  difficulty: 'easy' | 'medium' | 'hard';
  energyCost: number;
  auraReward: number;
  testCases: TestCase[];
}

export interface SubmissionResult {
  submissionId: number;
  status: SubmissionStatus;
}

export interface SubmissionListItem {
  id: number;
  problemId: number;
  status: SubmissionStatus;
  runtimeMs: number;
  memoryKb: number;
  errorOutput: string;
  submittedAt: string;
}

export interface SubmissionListResponse {
  submissions: SubmissionListItem[];
  auraJustEarned: boolean;
}

// Problem leaderboard types
export interface ProblemLeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  displayName: string;
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
}

export interface ProblemLeaderboardResponse {
  userRankRuntime: number;
  userRuntimeMs: number;
  runtimeLeaderboard: ProblemLeaderboardEntry[];
  userRankMemory: number;
  userMemoryKb: number;
  memoryLeaderboard: ProblemLeaderboardEntry[];
}