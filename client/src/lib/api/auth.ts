import axios from 'axios';
import type { AuthResponse, SessionUser, SignInFormData, SignUpFormData } from '../../types/auth';

type LoginApiResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: SessionUser;
  sessionuser?: SessionUser;
  data?: {
    token?: string;
    user?: SessionUser;
    sessionuser?: SessionUser;
  };
};

type RegisterApiResponse = {
  success: boolean;
  message?: string;
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const authBaseUrl = apiBaseUrl.replace(/\/$/, '');

export const login = async (values: SignInFormData): Promise<AuthResponse> => {
  const { data } = await axios.post<LoginApiResponse>(
    `${authBaseUrl}/auth/login`,
    values
  );

  return {
    success: data.success,
    message: data.message,
    token: data.token ?? data.data?.token,
    sessionuser: data.user ?? data.sessionuser ?? data.data?.user ?? data.data?.sessionuser,
  };
};

export const register = async (values: SignUpFormData): Promise<AuthResponse> => {
  const { data } = await axios.post<RegisterApiResponse>(
    `${authBaseUrl}/auth/register`,
    values
  );

  return {
    success: data.success,
    message: data.message,
  };
};