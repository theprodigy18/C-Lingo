import { useState } from 'react';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';
import { forgotPassword } from '../../lib/api/auth';
import { notification } from '../../lib/notifications';

export const ForgotPasswordPage = () => {
  const { goToSignIn, goToSignUp } = useAuthNavigation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      notification.error('Email required', 'Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    notification.loading({
      title: 'Sending email',
      message: 'Please wait...',
    });

    try {
      const response = await forgotPassword(email);
      notification.close();

      if (!response.success) {
        notification.error(
          'Failed to send email',
          response.message ?? 'Unable to send reset password email. Please try again.'
        );
        return;
      }

      await notification.modal({
        title: 'Email Sent',
        message: 'If an account with that email exists, we have sent a password reset email to that address.',
        variant: 'success',
        confirmText: 'Close',
      });
    } catch (error) {
      notification.close();
      const serverMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      notification.error(
        'Failed to send email',
        serverMessage ?? 'Unable to connect to the server. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">
            Forgot Password
          </h2>
          <p className="text-gray-400 text-sm px-8">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-5"
          method="POST"
        >
          <div className="space-y-4">
            <input
              className="input-field"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Send Reset Link
          </button>
        </form>

        <div className="flex flex-col items-center space-y-3 text-sm">
          <button
            type="button"
            onClick={goToSignIn}
            className="text-[#1A2E44] hover:text-clingo-blue transition-colors font-semibold cursor-pointer"
          >
            Back to Sign In
          </button>
          <button
            type="button"
            onClick={goToSignUp}
            className="text-gray-400 hover:text-clingo-blue transition-colors cursor-pointer"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};