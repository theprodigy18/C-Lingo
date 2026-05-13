import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';

export const ResendVerificationPage = () => {
  const { goToSignIn, goToSignUp } = useAuthNavigation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement resend verification email logic
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">
            Resend Verification
          </h2>
          <p className="text-gray-400 text-sm px-8">
            Enter your email address and we'll send you a new verification link
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
              required
              type="email"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors mt-4 cursor-pointer"
          >
            Resend Verification Email
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
