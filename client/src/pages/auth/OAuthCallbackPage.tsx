import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveAuthSession } from '../../lib/authSession';
import { getSessionUser } from '../../lib/api/auth';
import { notification } from '../../lib/notifications';
import { routes } from '../../lib/constants';

export const OAuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      // Extract token from URL fragment
      const hash = window.location.hash;
      const tokenMatch = hash.match(/token=([^&]*)/);

      if (!tokenMatch || !tokenMatch[1]) {
        navigate(routes.signIn, { replace: true });
        return;
      }

      const token = tokenMatch[1];

      // Save token to localStorage
      saveAuthSession(token, {
        id: 0,
        username: '',
        display_name: '',
        avatar_url: '',
      });

      // Fetch user data from token
      const sessionUser = await getSessionUser(token);

      if (!sessionUser) {
        navigate(routes.signIn, { replace: true });
        return;
      }

      // Update localStorage with complete user data
      saveAuthSession(token, sessionUser);

      // Show welcome modal
      await notification.modal({
        title: `Welcome, ${sessionUser.username}`,
        message: 'You have successfully signed in.',
        variant: 'success',
        confirmText: 'Go to Dashboard',
      });

      // Redirect to dashboard
      navigate(routes.dashboard, { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1A2E44',
      }}
    >
      <div
        style={{
          color: '#00B4D8',
          fontSize: '18px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Signing you in...
      </div>
    </div>
  );
};