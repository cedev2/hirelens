"use client";

import { useRef, useState, useEffect, useCallback } from "react";
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

const RESEND_COOLDOWN = 60;

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer
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

  // Resend code
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
      toast.success("If an account exists, a new code was sent.");
    },
  });

  // Keyboard / input handlers
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
        const nd = [...digits]; nd[index] = ""; setDigits(nd);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
    if (e.key === "Enter" && otp.length === 6) handleContinue();
  }, [digits, otp]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const nd = Array(6).fill("");
    pasted.split("").forEach((c, i) => { nd[i] = c; });
    setDigits(nd);
    const next = pasted.length < 6 ? pasted.length : 5;
    inputRefs.current[next]?.focus();
  }, []);

  function handleContinue() {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }
    // Store email + code for the next page (sessionStorage is safe — same tab only)
    sessionStorage.setItem("reset_email", email);
    sessionStorage.setItem("reset_code", otp);
    router.push("/dashboard/auth/new-password");
  }

  const isComplete = otp.length === 6;

  return (
    <div className="space-y-6">

      {/* Email hint */}
      <p className="text-sm text-gray-500 text-center">
        Code sent to{" "}
        <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
      </p>

      {/* OTP boxes */}
      <div className="flex justify-between gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            autoFocus={index === 0}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Code digit ${index + 1}`}
            className={[
              "w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none",
              "transition-all duration-150 select-none",
              "focus:ring-2 focus:ring-[#087F5B]/20",
              digit
                ? "border-[#087F5B] bg-[#F0FDF4] text-[#087F5B]"
                : "border-gray-200 bg-white text-gray-800 focus:border-[#087F5B]",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Resend */}
      <div className="text-sm text-gray-400 text-center">
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
          <span>
            Resend in{" "}
            <span className="tabular-nums font-semibold text-gray-600">{cooldown}s</span>
          </span>
        )}
      </div>

      {/* Continue button */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!isComplete}
        className={[
          "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200",
          isComplete
            ? "bg-[#087F5B] hover:bg-[#066B4D] text-white shadow-sm active:scale-[0.99]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed",
        ].join(" ")}
      >
        Continue →
      </button>

      <div className="text-center">
        <Link
          href="/dashboard/auth/login"
          className="text-sm text-gray-400 hover:text-[#087F5B] transition-colors"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
