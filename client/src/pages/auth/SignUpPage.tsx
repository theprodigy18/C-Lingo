import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useAuthNavigation } from '../../hooks/useAuthNavigation';
import { AuthLayout, OAuthButtons } from '../../components/auth';
import { signUpValidationSchema } from '../../lib/validation/auth';

export const SignUpPage = () => {
  const { goToSignIn, goToResendVerification } = useAuthNavigation();

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
          onSubmit={(_values, { setSubmitting }) => {
            // TODO: Implement sign up logic
            setSubmitting(false);
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
