import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../lib/axios";
import { showModal, toast } from "../lib/alert";
import type { ApiResponse, AuthData } from "../types/auth";
import { useRedirectIfAuthenticated } from "../hooks/useRedirectIfAuthenticated";
import AuthLayout from "../components/auth/AuthLayout";
import AuthCard from "../components/auth/AuthCard";
import InputField from "../components/auth/InputField";
import SocialLoginGroup from "../components/auth/SocialLoginGroup";

const validationSchema = Yup.object({
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

export default function SignIn() {
  const navigate = useNavigate();
  const { checking } = useRedirectIfAuthenticated();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data: res } = await api.post<ApiResponse<AuthData>>(
          "/auth/login",
          values,
        );

        if (!res.success || !res.data) {
          toast.error(res.message ?? "Login failed, please try again");
          return;
        }

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        await showModal({
          title: "Welcome back!",
          text: `Signed in as ${res.data.user.display_name}`,
          icon: "success",
          confirmText: "Go to Dashboard",
          onConfirm: () => navigate("/dashboard"),
        });
      } catch (err: any) {
        const message: string =
          err.response?.data?.message ?? "Login failed, please try again";
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
        <div className="text-center mb-8">
          <h2
            className="text-4xl font-extrabold text-[#1a2e4a] mb-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Sign In
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            To access a more complete experience
            <br />
            enter your email and password
          </p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="space-y-4 mb-4"
          noValidate
        >
          <div>
            <InputField
              type="email"
              placeholder="Email"
              {...formik.getFieldProps("email")}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-500 mt-1 px-2">
                {formik.errors.email}
              </p>
            )}
          </div>

          <div>
            <InputField
              type="password"
              placeholder="Password"
              {...formik.getFieldProps("password")}
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-500 mt-1 px-2">
                {formik.errors.password}
              </p>
            )}
          </div>

          <div className="flex justify-between text-xs text-slate-500 px-1">
            <Link
              to="/forgot-password"
              className="hover:text-[#00c8f0] transition-colors"
            >
              Forgot Password?
            </Link>
            <Link
              to="/create-account"
              className="hover:text-[#00c8f0] transition-colors font-medium"
            >
              Create Account
            </Link>
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full rounded-full bg-[#1a2e4a] text-white font-semibold py-3.5 text-sm
              hover:bg-[#243d60] active:scale-[0.98] transition-all duration-200 mt-2
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {formik.isSubmitting ? "Loading..." : "Continue"}
          </button>
        </form>

        <SocialLoginGroup
          onGoogleLogin={() => (window.location.href = "/api/auth/google")}
          onGitHubLogin={() => (window.location.href = "/api/auth/github")}
        />
      </AuthCard>
    </AuthLayout>
  );
}
