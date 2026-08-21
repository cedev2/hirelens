"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";

type FormValues = { email: string };

export default function ForgotPasswordForm() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const res = await api.post("/auth/forgot-password", values);
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Check your email for the reset code.");
      router.push(
        `/dashboard/auth/reset-password?email=${encodeURIComponent(variables.email)}`
      );
    },
    onError: (err: any) => {
      // Even on error show generic message (avoid enumeration)
      toast.success("If an account exists, a reset code has been sent.");
      const submittedEmail = (err?.config?.data ? JSON.parse(err.config.data)?.email : "") || "";
      if (submittedEmail) {
        router.push(
          `/dashboard/auth/reset-password?email=${encodeURIComponent(submittedEmail)}`
        );
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((v) => mutation.mutate(v))}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          type="email"
          placeholder="Enter your registered email"
          autoComplete="email"
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-[#087F5B] hover:bg-[#066B4D] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending…
          </span>
        ) : (
          "Continue"
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
