import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import InputField from "../components/auth/InputField";
import api from "../lib/axios";
import { hideLoadingModal, showLoadingModal, toast } from "../lib/alert";
import type { ApiResponse } from "../types/auth";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ResendVerificationEmail() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      showLoadingModal({
        title: "Sending code",
        text: "Please wait while we send your verification email...",
      });

      try {
        const { data: res } = await api.post<ApiResponse>(
          "/auth/resend-verification-email",
          values,
        );

        hideLoadingModal();

        if (!res.success) {
          toast.error(res.message ?? "Failed to resend verification email");
          return;
        }

        toast.success(res.message ?? "Verification code sent");
        navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } catch (err: unknown) {
        hideLoadingModal();
        const message =
          axios.isAxiosError<{ message?: string }>(err) &&
          err.response?.data?.message
            ? err.response.data.message
            : "Failed to resend verification email";
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-4xl font-bold text-[#1a2e44]">Resend Email</h2>
          <p className="px-4 text-sm leading-relaxed text-gray-400">
            Enter your email and we will send a new verification code
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
          <div>
            <InputField
              type="email"
              placeholder="Email"
              {...formik.getFieldProps("email")}
              autoComplete="email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 px-2 text-xs text-red-500">
                {formik.errors.email}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="mt-4 w-full rounded-2xl bg-[#1a2e44] py-4 font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {formik.isSubmitting ? "Sending..." : "Send Verification Code"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-semibold">
          <Link
            to="/create-account"
            className="text-[#1a2e44] transition-colors hover:text-[#00b4d8]"
          >
            Back to Create Account
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
