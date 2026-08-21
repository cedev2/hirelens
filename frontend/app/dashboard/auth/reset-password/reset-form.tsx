"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";

function maskEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.min(local.length - 1, 5))}@${domain}`;
}

type PasswordStrength = { score: number; label: string; color: string };

function checkStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#EF4444" };
  if (score === 2) return { score, label: "Fair", color: "#F59E0B" };
  if (score === 3) return { score, label: "Good", color: "#3B82F6" };
  if (score === 4) return { score, label: "Strong", color: "#10B981" };
  return { score, label: "Very strong", color: "#087F5B" };
}

const RESEND_COOLDOWN = 60;

type FormValues = { newPassword: string; confirmPassword: string };

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const passwordValue = watch("newPassword", "");
  const strength = checkStrength(passwordValue);

  // Start cooldown timer
  useEffect(() => {
    if (cooldown <= 0) { setCanResend(true); return; }
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const otp = digits.join("");

  const resetMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.post("/auth/reset-password", {
        email,
        code: otp,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password reset! Please log in with your new password.");
      router.push("/dashboard/auth/login");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Reset failed";
      toast.error(message);
      if (message.includes("expired") || message.includes("Too many")) {
        setDigits(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success("A new reset code has been sent.");
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setCooldown(RESEND_COOLDOWN);
      setCanResend(false);
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    },
    onError: () => {
      // Generic – user doesn't need details
      toast.success("If an account exists, a new code was sent.");
    },
  });

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  }, [digits]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  }, [digits]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill("");
    pasted.split("").forEach((c, i) => { newDigits[i] = c; });
    setDigits(newDigits);
    const nextEmpty = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[nextEmpty]?.focus();
  }, []);

  const isOtpComplete = otp.length === 6;
  const isPending = resetMutation.isPending;

  const requirements = [
    { met: passwordValue.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(passwordValue), text: "One uppercase letter" },
    { met: /[0-9]/.test(passwordValue), text: "One number" },
    { met: /[^A-Za-z0-9]/.test(passwordValue), text: "One special character" },
  ];

  return (
    <form className="space-y-6" onSubmit={handleSubmit((v) => resetMutation.mutate(v))}>
      {/* OTP */}
      <div>
        <p className="text-sm text-gray-600 mb-1 font-medium">Verification code</p>
        <p className="text-xs text-gray-400 mb-3">
          Sent to <span className="font-semibold text-gray-600">{maskEmail(email)}</span>
        </p>
        <div className="flex gap-2">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              autoFocus={index === 0}
              disabled={isPending}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              aria-label={`Code digit ${index + 1}`}
              className={[
                "flex-1 text-center text-lg font-bold rounded-lg border-2 outline-none transition-all duration-150",
                "focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/20",
                digit
                  ? "border-[#087F5B] bg-[#E8F7F0] text-[#087F5B]"
                  : "border-gray-200 bg-white text-gray-900",
                isPending ? "opacity-50 cursor-not-allowed" : "",
              ].join(" ")}
              style={{ height: "48px" }}
            />
          ))}
        </div>

        {/* Resend */}
        <div className="mt-3 text-sm text-gray-500">
          {canResend ? (
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-[#087F5B] font-semibold hover:underline disabled:opacity-50"
            >
              {resendMutation.isPending ? "Sending…" : "Resend code"}
            </button>
          ) : (
            <span className="text-gray-400">
              Resend in <span className="tabular-nums font-medium">{cooldown}s</span>
            </span>
          )}
        </div>
      </div>

      {/* New password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          New password
        </label>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            placeholder="Create a strong password"
            autoComplete="new-password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: { value: 8, message: "At least 8 characters required" },
            })}
            className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-red-600 mt-1">{errors.newPassword.message}</p>
        )}

        {/* Strength indicator */}
        {passwordValue && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{ backgroundColor: i <= strength.score ? strength.color : "#E5E7EB" }}
                />
              ))}
            </div>
            <p className="text-xs font-medium" style={{ color: strength.color }}>
              {strength.label}
            </p>
          </div>
        )}

        {/* Requirements */}
        {passwordValue && (
          <ul className="mt-2 space-y-1">
            {requirements.map((req) => (
              <li key={req.text} className="flex items-center gap-1.5 text-xs">
                <span className={req.met ? "text-[#087F5B]" : "text-gray-300"}>
                  {req.met ? "✓" : "○"}
                </span>
                <span className={req.met ? "text-gray-600" : "text-gray-400"}>{req.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm password
        </label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (val) => val === passwordValue || "Passwords do not match",
            })}
            className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isOtpComplete || isPending}
        className={[
          "w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200",
          isOtpComplete && !isPending
            ? "bg-[#087F5B] hover:bg-[#066B4D] text-white shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed",
        ].join(" ")}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Resetting…
          </span>
        ) : (
          "Reset Password"
        )}
      </button>

      <div className="text-center">
        <Link
          href="/dashboard/auth/login"
          className="text-sm text-gray-500 hover:text-[#087F5B] transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    </form>
  );
}
