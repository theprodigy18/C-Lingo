import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../lib/axios";
import { saveAuthSession } from "../lib/auth";
import {
  hideLoadingModal,
  showLoadingModal,
  showModal,
  toast,
} from "../lib/alert";
import { getOAuthUrl } from "../lib/oauth";
import type { ApiResponse, AuthData } from "../types/auth";
import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/auth/InputField";
import SocialLoginGroup from "../components/auth/SocialLoginGroup";

const validationSchema = Yup.object({
  username: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .matches(
      /^[a-z0-9]+([._-]?[a-z0-9]+)*$/,
      "Username may only contain lowercase letters, numbers, and single separators (., -, _) between characters",
    )
    .required("Username is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .matches(/^[^\s]+$/, "Password must not contain spaces")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':",.<>?/\\|`~]+$/,
      "Password contains invalid characters",
    )
    .required("Password is required"),
});

export default function CreateAccount() {
  const navigate = useNavigate();
  const { checking } = useRedirectIfAuthenticated();

  const formik = useFormik({
    initialValues: { username: "", email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      showLoadingModal({
        title: "Creating account",
        text: "Please wait while we set up your account...",
      });

      try {
        const { data: res } = await api.post<ApiResponse<AuthData>>(
          "/auth/register",
          values,
        );

        hideLoadingModal();

        if (!res.success) {
          toast.error(res.message ?? "Registration failed, please try again");
          return;
        }

        if (!res.data) {
          toast.success(res.message ?? "Verification code sent");
          navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }

        saveAuthSession(res.data);
        await showModal({
          title: "Account created!",
          text: `Welcome to CLingo, ${res.data.user.display_name}!`,
          icon: "success",
          confirmText: "Go to Dashboard",
          onConfirm: () => navigate("/dashboard"),
        });
      } catch (err: unknown) {
        hideLoadingModal();
        const message =
          axios.isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message
            ? err.response.data.message
            : "Registration failed, please try again";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (checking) return null;

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-4xl font-bold text-[#1a2e44]">
            Create Account
          </h2>
          <p className="px-8 text-sm leading-relaxed text-gray-400">
            Fill in the required information to
            <br />
            create your account
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="mb-4 space-y-5"
          noValidate
        >
          <div>
            <InputField
              type="text"
              placeholder="Enter your username"
              {...formik.getFieldProps("username")}
              autoComplete="username"
            />
            {formik.touched.username && formik.errors.username && (
              <p className="mt-1 px-2 text-xs text-red-500">
                {formik.errors.username}
              </p>
            )}
          </div>

          <div>
            <InputField
              type="email"
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 px-2 text-xs text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div>
            <InputField
              type="password"
              placeholder="Enter your password"
              {...formik.getFieldProps("password")}
              autoComplete="new-password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 px-2 text-xs text-red-500">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-between px-1 text-xs font-semibold">
            <Link
              to="/resend-verification-email"
              className="text-[#1a2e44] transition-colors hover:text-[#00b4d8]"
            >
              Resend Verification
            </Link>
            <div>
            <span>Already have an account? </span>
            <Link
              to="/sign-in"
              className="text-[#1a2e44] transition-colors hover:text-[#00b4d8]"
            >
              Sign In
            </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-4 w-full rounded-2xl bg-[#1a2e44] py-4 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formik.isSubmitting ? "Loading..." : "Sign Up"}
          </button>
        </form>

        <SocialLoginGroup
          label="Or Register with"
          onGoogleLogin={() => {
            showLoadingModal({
              title: "Redirecting to Google",
              text: "Please wait while we open OAuth login...",
            });
            window.location.assign(getOAuthUrl("google"));
          }}
          onGitHubLogin={() => {
            showLoadingModal({
              title: "Redirecting to GitHub",
              text: "Please wait while we open OAuth login...",
            });
            window.location.assign(getOAuthUrl("github"));
          }}
        />
      </AuthCard>
    </AuthLayout>
  );
}
