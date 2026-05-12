import axios from "axios";
import { useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import AuthLayout from "../components/auth/AuthLayout";
import api from "../lib/axios";
import { saveAuthSession } from "../lib/auth";
import { hideLoadingModal, showLoadingModal, toast } from "../lib/alert";
import type { ApiResponse, AuthData } from "../types/auth";

const OTP_LENGTH = 6;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const code = otp.join("");

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH).split("");
    if (digits.length === 0) return;

    setOtp(Array.from({ length: OTP_LENGTH }, (_, i) => digits[i] ?? ""));
    inputRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email) {
      toast.error("Email is missing. Please request a new verification code.");
      return;
    }

    if (code.length !== OTP_LENGTH) {
      toast.error("Please enter the 6 digit OTP code.");
      return;
    }

    showLoadingModal({
      title: "Verifying email",
      text: "Please wait while we verify your code...",
    });

    try {
      const { data: res } = await api.post<ApiResponse<AuthData>>(
        "/auth/verify-email",
        { email, otp: code },
      );

      hideLoadingModal();

      if (!res.success || !res.data) {
        toast.error(res.message ?? "Verification failed, please try again");
        return;
      }

      saveAuthSession(res.data);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      hideLoadingModal();
      const message =
        axios.isAxiosError<{ message?: string }>(err) &&
        err.response?.data?.message
          ? err.response.data.message
          : "Verification failed, please try again";
      toast.error(message);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-8 space-y-2 text-center">
          <h2 className="text-4xl font-bold text-[#1a2e44]">Verify Email</h2>
          <p className="px-4 text-sm leading-relaxed text-gray-400">
            Enter the 6 digit code we sent to {email || "your email"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-6 gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                value={digit}
                onChange={(event) => setDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={(event) => {
                  event.preventDefault();
                  handlePaste(event.clipboardData.getData("text"));
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                className="h-14 rounded-2xl border-none bg-[#f5f6f8] text-center text-xl font-bold text-[#1a2e44] outline-none transition-all focus:bg-white focus:ring-2 focus:ring-[#00b4d8] sm:h-16"
              />
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-[#1a2e44] py-4 font-semibold text-white transition-colors hover:bg-slate-800"
          >
            Verify & Continue
          </button>
        </form>

        <div className="mt-5 text-center text-xs font-semibold">
          <Link
            to="/resend-verification-email"
            className="text-[#1a2e44] transition-colors hover:text-[#00b4d8]"
          >
            Resend verification email
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
