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
