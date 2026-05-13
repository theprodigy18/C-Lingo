import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignInPage, SignUpPage, ResendVerificationPage, OtpPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { usePreventAuthenticatedAccess } from './hooks/usePreventAuthenticatedAccess';
import { useRequireAuthenticatedAccess } from './hooks/useRequireAuthenticatedAccess';
import { routes } from './lib/constants';

type RouteGuardProps = {
  children: ReactNode;
};

const AuthRoute = ({ children }: RouteGuardProps) => {
  const { isCheckingSession } = usePreventAuthenticatedAccess();

  if (isCheckingSession) {
    return null;
  }

  return children;
};

const ProtectedRoute = ({ children }: RouteGuardProps) => {
  const { isCheckingSession } = useRequireAuthenticatedAccess();

  if (isCheckingSession) {
    return null;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={routes.root} element={<AuthRoute><SignInPage /></AuthRoute>} />
        <Route path={routes.signIn} element={<AuthRoute><SignInPage /></AuthRoute>} />
        <Route path={routes.signUp} element={<AuthRoute><SignUpPage /></AuthRoute>} />
        <Route path={routes.resendVerification} element={<AuthRoute><ResendVerificationPage /></AuthRoute>} />
        <Route path={routes.otp} element={<AuthRoute><OtpPage /></AuthRoute>} />
        <Route path={routes.forgotPassword} element={<AuthRoute><ForgotPasswordPage /></AuthRoute>} />
        <Route path={routes.resetPassword} element={<AuthRoute><ResetPasswordPage /></AuthRoute>} />
        <Route path={routes.dashboard} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
