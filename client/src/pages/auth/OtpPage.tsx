import { useRef, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';
import { verifyEmail } from '../../lib/api/auth';
import { saveAuthSession } from '../../lib/authSession';
import { notification } from '../../lib/notifications';

export const OtpPage = () => {
  const { goToSignIn, goToDashboard } = useAuthNavigation();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      notification.error('Verification failed', 'Please enter a complete 6-digit code.');
      return;
    }

    if (!email) {
      notification.error('Verification failed', 'Email is missing. Please sign up again.');
      return;
    }

    setIsSubmitting(true);

    notification.loading({
      title: 'Verifying',
      message: 'Please wait...',
    });

    try {
      const response = await verifyEmail(email, otpValue);
      notification.close();

      if (!response.success) {
        notification.error(
          'Verification failed',
          response.message ?? 'Invalid or expired code. Please try again.'
        );
        return;
      }

      await notification.modal({
        title: 'Successfully Verify Your Email',
        message: 'Your email has been verified. You can now access your account.',
        variant: 'success',
        confirmText: 'Continue',
      });

      if (!response.token || !response.sessionuser) {
        notification.error(
          'Verification failed',
          'The server response did not include a complete session.'
        );
        return;
      }

      saveAuthSession(response.token, response.sessionuser);

      const username = response.sessionuser.username;

      await notification.modal({
        title: `Welcome, ${username}`,
        message: 'You have successfully signed in.',
        variant: 'success',
        confirmText: 'Go to Dashboard',
      });

      goToDashboard();
    } catch (error) {
      notification.close();
      const serverMessage =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      notification.error(
        'Verification failed',
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
            Verify Email
          </h2>
          <p className="text-gray-400 text-sm px-8">
            Enter the 6-digit code we sent to {email || 'your email'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-6"
          method="POST"
        >
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isSubmitting}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Verify
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
        </div>
      </div>
    </AuthLayout>
  );
};