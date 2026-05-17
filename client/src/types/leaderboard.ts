export interface LeaderboardEntry {
  rank: number;
  username: string;
  display_name: string;
  aura: number;
  avatar_url: string;
}

export interface LeaderboardResponse {
  user_rank: number;
  entries: LeaderboardEntry[];
}