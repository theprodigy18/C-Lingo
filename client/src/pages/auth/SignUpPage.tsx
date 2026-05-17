import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout, OAuthButtons } from '../../components/auth';
import { register } from '../../lib/api/auth';
import { notification } from '../../lib/notifications';
import { signUpValidationSchema } from '../../lib/validation/auth';
import type { SignUpFormData } from '../../types/auth';

export const SignUpPage = () => {
  const { goToSignIn, goToResendVerification } = useAuthNavigation();
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">Create Account</h2>
          <p className="text-gray-400 text-sm px-8">
            Join us to start your coding journey with interactive learning
          </p>
        </div>

        <Formik
          initialValues={{ username: '', email: '', password: '' }}
          validationSchema={signUpValidationSchema}
          onSubmit={async (values: SignUpFormData, { setSubmitting }) => {
            notification.loading({
              title: 'Creating account',
              message: 'Please wait...',
            });

            try {
              const response = await register(values);
              notification.close();

              if (!response.success) {
                notification.error(
                  'Sign up failed',
                  response.message ?? 'Unable to create account. Please try again.'
                );
                return;
              }

              await notification.modal({
                title: 'Verify your email',
                message: `We have sent a verification email to ${values.email}. Please check your inbox to verify your account.`,
                variant: 'success',
                confirmText: 'Go to OTP',
              });

              navigate(`/otp?email=${encodeURIComponent(values.email)}`);
            } catch (error) {
              notification.close();
              const serverMessage =
                error && typeof error === 'object' && 'response' in error
                  ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                  : undefined;

              notification.error(
                'Sign up failed',
                serverMessage ?? 'Unable to connect to the server. Please try again.'
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="w-full space-y-5" method="POST" noValidate>
              <div className="space-y-4 text-left">
                <div>
                  <Field
                    autoComplete="username"
                    className="input-field"
                    name="username"
                    placeholder="Username"
                    type="text"
                  />
                  <ErrorMessage
                    className="mt-2 block text-xs font-medium text-red-500"
                    component="span"
                    name="username"
                  />
                </div>

                <div>
                  <Field
                    autoComplete="email"
                    className="input-field"
                    name="email"
                    placeholder="Email"
                    type="email"
                  />
                  <ErrorMessage
                    className="mt-2 block text-xs font-medium text-red-500"
                    component="span"
                    name="email"
                  />
                </div>

                <div>
                  <Field
                    autoComplete="new-password"
                    className="input-field"
                    name="password"
                    placeholder="Password"
                    type="password"
                  />
                  <ErrorMessage
                    className="mt-2 block text-xs font-medium text-red-500"
                    component="span"
                    name="password"
                  />
                </div>
              </div>

              <div className="flex justify-end text-xs font-semibold px-1">
                <button
                  type="button"
                  onClick={goToSignIn}
                  className="text-[#1A2E44] hover:text-clingo-blue transition-colors cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-4 cursor-pointer"
              >
                Continue
              </button>
            </Form>
          )}
        </Formik>

        <OAuthButtons />

        <div className="text-xs text-gray-400">
          <span>Didn't receive verification email? </span>
          <button
            type="button"
            onClick={goToResendVerification}
            className="text-clingo-blue hover:underline font-semibold cursor-pointer"
          >
            Resend
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
