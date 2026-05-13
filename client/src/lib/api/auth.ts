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
    token: data.data?.token,
    sessionuser: data.data?.user,
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

type VerifyEmailApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    token?: string;
    user?: SessionUser;
  };
};

export const verifyEmail = async (email: string, otp: string): Promise<AuthResponse> => {
  const { data } = await axios.post<VerifyEmailApiResponse>(
    `${authBaseUrl}/auth/verify-email`,
    { email, otp }
  );

  return {
    success: data.success,
    message: data.message,
    token: data.data?.token,
    sessionuser: data.data?.user,
  };
};

type ResendVerificationApiResponse = {
  success: boolean;
  message?: string;
};

export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  const { data } = await axios.post<ResendVerificationApiResponse>(
    `${authBaseUrl}/auth/resend-verification-email`,
    { email }
  );

  return {
    success: data.success,
    message: data.message,
  };
};

type ForgotPasswordApiResponse = {
  success: boolean;
  message?: string;
};

export const forgotPassword = async (email: string): Promise<AuthResponse> => {
  const { data } = await axios.post<ForgotPasswordApiResponse>(
    `${authBaseUrl}/auth/forgot-password`,
    { email }
  );

  return {
    success: data.success,
    message: data.message,
  };
};

type ResetPasswordApiResponse = {
  success: boolean;
  message?: string;
};

export const resetPassword = async (token: string, newPassword: string): Promise<AuthResponse> => {
  const { data } = await axios.post<ResetPasswordApiResponse>(
    `${authBaseUrl}/auth/reset-password`,
    { token, new_password: newPassword }
  );

  return {
    success: data.success,
    message: data.message,
  };
};