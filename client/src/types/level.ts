export interface Level {
  id: number;
  level_number: number;
  title: string;
  energy_cost: number;
  quiz_aura_reward: number;
  is_unlocked: boolean;
  is_completed: boolean;
}

export type LevelsResponse = {
  levels: Level[];
};