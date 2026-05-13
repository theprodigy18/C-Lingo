import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';

export const OtpPage = () => {
  const { goToSignIn, goToSignUp } = useAuthNavigation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement OTP verification logic
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">
            Verify Email
          </h2>
          <p className="text-gray-400 text-sm px-8">
            Enter the 6-digit code we sent to your email
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full space-y-6"
          method="POST"
        >
          <div className="flex justify-center gap-3">
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
            <input
              className="otp-input"
              type="text"
              maxLength={1}
              inputMode="numeric"
              pattern="[0-9]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
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
