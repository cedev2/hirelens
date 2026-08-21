"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#EF4444" };
  if (score <= 2) return { score, label: "Fair", color: "#F59E0B" };
  if (score <= 3) return { score, label: "Good", color: "#3B82F6" };
  return { score, label: "Strong", color: "#087F5B" };
}

export default function NewPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Read credentials from sessionStorage (set by the previous OTP page)
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("reset_email") || "";
    const storedCode = sessionStorage.getItem("reset_code") || "";
    if (!storedEmail || !storedCode) {
      toast.error("Session expired. Please restart the reset process.");
      router.replace("/dashboard/auth/forgot-password");
      return;
    }
    setEmail(storedEmail);
    setCode(storedCode);
  }, [router]);

  const strength = getStrength(password);
  const passwordsMatch = password === confirm;
  const isValid = password.length >= 8 && passwordsMatch && strength.score >= 2;

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/reset-password", { email, code, newPassword: password });
      return res.data;
    },
    onSuccess: () => {
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_code");
      toast.success("Password updated! Please sign in.");
      router.push("/dashboard/auth/login");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Failed to reset password";
      toast.error(message);
      // If the code was wrong / expired, send them back to re-enter it
      if (err?.response?.status === 400 || err?.response?.status === 410) {
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_code");
        router.replace(`/dashboard/auth/reset-password?email=${encodeURIComponent(email)}`);
      }
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    resetMutation.mutate();
  }

  const isPending = resetMutation.isPending;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* New password */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">New password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            disabled={isPending}
            className={[
              "w-full px-4 py-3 pr-11 rounded-xl border-2 outline-none text-sm transition-all duration-150",
              "focus:ring-2 focus:ring-[#087F5B]/20",
              submitted && password.length < 8
                ? "border-red-400 bg-red-50"
                : password.length >= 8
                ? "border-[#087F5B] bg-[#F0FDF4]"
                : "border-gray-200 bg-white focus:border-[#087F5B]",
              isPending ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
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

        {/* Strength bar */}
        {password && (
          <div className="space-y-1 pt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i <= Math.ceil((strength.score / 5) * 4)
                      ? strength.color
                      : "#E5E7EB",
                  }}
                />
              ))}
            </div>
            <p className="text-xs" style={{ color: strength.color }}>
              {strength.label}
            </p>
          </div>
        )}

        {submitted && password.length < 8 && (
          <p className="text-xs text-red-500">Password must be at least 8 characters.</p>
        )}
      </div>

      {/* Confirm password */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Confirm password</label>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            disabled={isPending}
            className={[
              "w-full px-4 py-3 pr-11 rounded-xl border-2 outline-none text-sm transition-all duration-150",
              "focus:ring-2 focus:ring-[#087F5B]/20",
              submitted && !passwordsMatch
                ? "border-red-400 bg-red-50"
                : confirm && passwordsMatch
                ? "border-[#087F5B] bg-[#F0FDF4]"
                : "border-gray-200 bg-white focus:border-[#087F5B]",
              isPending ? "opacity-50 cursor-not-allowed" : "",
            ].join(" ")}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
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
        {submitted && confirm && !passwordsMatch && (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className={[
          "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 mt-2",
          !isPending
            ? "bg-[#087F5B] hover:bg-[#066B4D] text-white shadow-sm active:scale-[0.99]"
            : "bg-[#087F5B]/70 text-white cursor-not-allowed",
        ].join(" ")}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving…
          </span>
        ) : (
          "Set new password"
        )}
      </button>

      <div className="text-center">
        <Link
          href="/dashboard/auth/login"
          className="text-sm text-gray-400 hover:text-[#087F5B] transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    </form>
  );
}
