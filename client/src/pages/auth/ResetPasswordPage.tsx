import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';

export const ResetPasswordPage = () => {
  const { goToSignIn } = useAuthNavigation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement reset password logic
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">
            Reset Password
          </h2>
          <p className="text-gray-400 text-sm px-8">
            Enter your new password below
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
              placeholder="New Password"
              required
              type="password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Reset Password
          </button>
        </form>

        <div className="text-sm">
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