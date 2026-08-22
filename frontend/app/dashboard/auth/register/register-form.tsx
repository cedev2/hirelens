"use client";
import Link from "next/link";
import { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { useDispatch } from "react-redux";
import { setAuth } from "@/lib/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";

type RegisterValues = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthResponse = {
  user?: any;
  tokens?: { accessToken: string; refreshToken?: string };
  requiresVerification?: boolean;
  email?: string;
};

export default function RegisterForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterValues>();

  const registerMutation = useMutation<AuthResponse, any, RegisterValues>({
    mutationFn: async (values) => {
      const res = await api.post("/auth/register/local", {
        ...values,
        role: "applicant",
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.requiresVerification && data.email) {
        toast.success("Account created! Check your email for a verification code.");
        router.push(
          `/dashboard/auth/verify-email?email=${encodeURIComponent(data.email)}&redirect=/admin`
        );
        return;
      }
      dispatch(setAuth({ user: data.user, tokens: data.tokens! }));
      toast.success("Account created");
      router.push("/dashboard");
    },
    onError: (error) => {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-4 py-2"
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
    >
      {/* First Name & Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            placeholder="John"
            {...register("firstName", { required: "First name is required" })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600 mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            placeholder="Doe"
            {...register("lastName")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email address"
          {...register("email", { required: "Email is required" })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              international
              defaultCountry="RW"
              value={field.value}
              onChange={field.onChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus-within:border-[#087F5B] transition-colors bg-white"
            />
          )}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            {...register("password", { required: "Password is required" })}
            className="w-full px-4 py-3 pr-11 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
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
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Register button */}
      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full py-3 bg-[#087F5B] text-white font-medium rounded-lg hover:bg-[#066B4D] transition-colors"
      >
        {registerMutation.isPending ? "Creating..." : "Create Account"}
      </button>

      <div className="text-center mt-2">
        <span className="text-sm w-full">
          Already have an account?{" "}
          <Link
            href={`/dashboard/auth/login${redirectParam ? `?redirect=${encodeURIComponent(redirectParam)}` : ""}`}
            className="text-[#087F5B] font-semibold hover:text-[#087F5B]/80"
          >
            Login
          </Link>
        </span>
      </div>
    </form>
  );
}
