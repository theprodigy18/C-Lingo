import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout, OAuthButtons } from '../../components/auth';
import { login } from '../../lib/api/auth';
import { saveAuthSession } from '../../lib/authSession';
import { notification } from '../../lib/notifications';
import { signInValidationSchema } from '../../lib/validation/auth';
import type { SignInFormData } from '../../types/auth';

export const SignInPage = () => {
  const { goToSignUp, goToForgotPassword, goToDashboard } = useAuthNavigation();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#1A2E44]">Sign In</h2>
          <p className="text-gray-400 text-sm px-8">
            To access a more complete experience enter your email and password
          </p>
        </div>

        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={signInValidationSchema}
          onSubmit={async (values: SignInFormData, { setSubmitting }) => {
            notification.loading({
              title: 'Signing in',
              message: 'Checking your account...',
            });

            try {
              const response = await login(values);
              notification.close();

              if (!response.success) {
                notification.error(
                  'Sign in failed',
                  response.message ?? 'Please check your credentials and try again.'
                );
                return;
              }

              if (!response.token || !response.sessionuser) {
                notification.error(
                  'Sign in failed',
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

              const serverMessage = axios.isAxiosError(error)
                ? error.response?.data?.message
                : undefined;

              notification.error(
                'Sign in failed',
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
                    autoComplete="current-password"
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

              <div className="flex justify-between text-xs font-semibold px-1">
                <button
                  type="button"
                  onClick={goToForgotPassword}
                  className="text-[#1A2E44] hover:text-clingo-blue transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={goToSignUp}
                  className="text-[#1A2E44] hover:text-clingo-blue transition-colors cursor-pointer"
                >
                  Create Account
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
      </div>
    </AuthLayout>
  );
};
