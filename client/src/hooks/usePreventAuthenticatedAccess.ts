import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthSessionStatus } from '../lib/authSession';
import { routes } from '../lib/constants';

export const usePreventAuthenticatedAccess = () => {
  const navigate = useNavigate();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const session = getAuthSessionStatus();

    if (session.isValid) {
      navigate(routes.dashboard, { replace: true });
      return;
    }

    setIsCheckingSession(false);
  }, [navigate]);

  return { isCheckingSession };
};
