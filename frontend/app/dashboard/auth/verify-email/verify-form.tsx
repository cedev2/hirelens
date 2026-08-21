"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { setAuth } from "@/lib/store/authSlice";

function maskEmail(email: string): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.min(local.length - 1, 5))}@${domain}`;
}

const RESEND_COOLDOWN = 60;

export default function VerifyEmailForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start cooldown timer on mount
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

  const verifyMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/verify-email", { email, code: otp });
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({ user: data.user, tokens: data.tokens }));
      toast.success("Email verified! Welcome aboard.");
      router.push(redirect);
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Verification failed";
      toast.error(message);
      // Clear digits on wrong code
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/resend-verification", { email });
      return res.data;
    },
    onSuccess: () => {
      toast.success("A new verification code has been sent.");
      setCooldown(RESEND_COOLDOWN);
      setCanResend(false);
      setDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();

      // Restart cooldown timer
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to resend code";
      toast.error(msg);
    },
  });

  const handleChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
    if (e.key === "Enter" && otp.length === 6) verifyMutation.mutate();
  }, [digits, otp, verifyMutation]);

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

  const isComplete = otp.length === 6;
  const isPending = verifyMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Email hint */}
      <p className="text-sm text-gray-500 text-center">
        Code sent to{" "}
        <span className="font-semibold text-gray-700">{maskEmail(email)}</span>
      </p>

      {/* OTP inputs */}
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
            disabled={isPending}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Digit ${index + 1}`}
            className={[
              "w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none",
              "transition-all duration-150 select-none",
              "focus:ring-2 focus:ring-[#087F5B]/20",
              digit
                ? "border-[#087F5B] bg-[#F0FDF4] text-[#087F5B]"
                : "border-gray-200 bg-white text-gray-800 focus:border-[#087F5B]",
              isPending ? "opacity-50 cursor-not-allowed" : "cursor-text",
            ].join(" ")}
          />
        ))}
      </div>

      {/* Verify button */}
      <button
        type="button"
        onClick={() => verifyMutation.mutate()}
        disabled={!isComplete || isPending}
        className={[
          "w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200",
          isComplete && !isPending
            ? "bg-[#087F5B] hover:bg-[#066B4D] text-white shadow-sm"
            : "bg-gray-100 text-gray-400 cursor-not-allowed",
        ].join(" ")}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifying…
          </span>
        ) : (
          "Verify Email"
        )}
      </button>

      {/* Resend */}
      <div className="text-center text-sm text-gray-500">
        Didn't receive the code?{" "}
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
          <span className="text-gray-400 font-medium">
            Resend in <span className="tabular-nums">{cooldown}s</span>
          </span>
        )}
      </div>
    </div>
  );
}
