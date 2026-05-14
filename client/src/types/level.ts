export interface Level {
  id: number;
  level_number: number;
  title: string;
  energy_cost: number;
  quiz_aura_reward: number;
  is_unlocked: boolean;
  is_completed: boolean;
  is_started: boolean;
}

export type LevelsResponse = {
  levels: Level[];
};

export interface QuizOption {
  id: number;
  option_text: string;
  is_correct?: boolean;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  explanation: string | null;
  order_index: number;
  options: QuizOption[];
}

export interface LevelDetail {
  id: number;
  level_number: number;
  title: string;
  content_md: string;
  energy_cost: number;
  quiz_aura_reward: number;
  is_published: boolean;
  is_unlocked: boolean;
  is_completed: boolean;
  quiz_score: number;
  attempts: number;
  completed_at: string | null;
  questions: QuizQuestion[];
}

export interface QuizQuestionResult {
  question_id: number;
  question_text: string;
  selected_option_id: number;
  selected_option_text: string;
  correct_option_id: number;
  correct_option_text: string;
  is_correct: boolean;
  explanation: string;
}

export type QuizSubmitResult = {
  score: number;
  total: number;
  correct: number;
  passed: boolean;
  isCompleted: boolean;
  isNewCompletion: boolean;
  results: QuizQuestionResult[];
};