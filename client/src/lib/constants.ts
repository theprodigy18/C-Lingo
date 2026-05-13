export const colors = {
  'clingo-blue': '#00B4D8',
  'clingo-dark': '#1A2E44',
  'clingo-input': '#F5F6F8',
  'clingo-glow': 'rgba(0, 180, 216, 0.4)',
} as const;

export const routes = {
  root: '/',
  signIn: '/signin',
  signUp: '/signup',
  resendVerification: '/resend-verification',
  otp: '/otp',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
} as const;
