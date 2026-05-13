import { useSearchParams } from 'react-router';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout } from '../../components/auth';
import { resetPassword } from '../../lib/api/auth';
import { notification } from '../../lib/notifications';
import { passwordValidation } from '../../lib/validation/auth';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const resetPasswordValidationSchema = Yup.object({
  password: passwordValidation,
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export const ResetPasswordPage = () => {
  const { goToSignIn } = useAuthNavigation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

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

        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={resetPasswordValidationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            if (!token) {
              notification.error('Invalid link', 'The reset password link is invalid or has expired.');
              setSubmitting(false);
              return;
            }

            notification.loading({
              title: 'Resetting password',
              message: 'Please wait...',
            });

            try {
              const response = await resetPassword(token, values.password);
              notification.close();

              if (!response.success) {
                notification.error(
                  'Failed to reset password',
                  response.message ?? 'Unable to reset password. Please try again.'
                );
                return;
              }

              await notification.modal({
                title: 'Password Reset Successfully',
                message: 'Your password has been reset. You can now sign in with your new password.',
                variant: 'success',
                confirmText: 'Go to Sign In',
              });

              goToSignIn();
            } catch (error) {
              notification.close();
              const serverMessage =
                error && typeof error === 'object' && 'response' in error
                  ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                  : undefined;

              notification.error(
                'Failed to reset password',
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
                    className="input-field"
                    name="password"
                    placeholder="New Password"
                    type="password"
                    autoComplete="new-password"
                  />
                  <ErrorMessage
                    className="mt-2 block text-xs font-medium text-red-500"
                    component="span"
                    name="password"
                  />
                </div>

                <div>
                  <Field
                    className="input-field"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                  />
                  <ErrorMessage
                    className="mt-2 block text-xs font-medium text-red-500"
                    component="span"
                    name="confirmPassword"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1A2E44] text-white rounded-2xl font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Reset Password
              </button>
            </Form>
          )}
        </Formik>

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