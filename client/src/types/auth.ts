export interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
}

export interface AuthData {
  token: string;
  user: User;
}

// Generic wrapper matching Crow BaseHandler response format
export interface ApiResponse<T = undefined> {
  success: boolean;
  data?: T;
  message?: string;
}

export type ProblemDifficulty = "easy" | "medium" | "hard";

export type SubmissionStatus =
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compile_error";

export interface Problem {
  id: number;
  title: string;
  slug: string;
  description_md: string;
  constraints_md?: string;
  starter_code: string;
  solution_code?: string;
  difficulty: ProblemDifficulty;
  energy_cost: number;
  aura_reward: number;
  is_published: boolean;
  created_at: string;
  submission_status?: SubmissionStatus;
}
