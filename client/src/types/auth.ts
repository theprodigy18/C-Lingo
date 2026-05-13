export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignUpFormData {
  username: string;
  email: string;
  password: string;
}

export interface OAuthProvider {
  name: 'google' | 'github';
  icon: string;
}

export interface SessionUser {
  id: number | string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  sessionuser?: SessionUser;
}
