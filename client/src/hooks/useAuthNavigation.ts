import { useNavigate } from 'react-router-dom';
import { routes } from '../lib/constants';

export const useAuthNavigation = () => {
  const navigate = useNavigate();

  const goToSignIn = () => navigate(routes.signIn);
  const goToSignUp = () => navigate(routes.signUp);
  const goToResendVerification = () => navigate(routes.resendVerification);
  const goToForgotPassword = () => navigate(routes.forgotPassword);
  const goToDashboard = () => navigate(routes.dashboard);

  return {
    goToSignIn,
    goToSignUp,
    goToResendVerification,
    goToForgotPassword,
    goToDashboard,
  };
};
