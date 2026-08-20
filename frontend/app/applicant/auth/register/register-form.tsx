"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { useDispatch } from "react-redux";
import { setAuth } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";

type RegisterValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  headline: string;
};

export default function ApplicantRegisterForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterValues>();
  const password = watch("password");

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterValues) => {
      const res = await api.post("/auth/register/applicant", {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        headline: values.headline || "Job Seeker",
      });
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({ user: data.user, tokens: data.tokens }));
      toast.success("Account created successfully!");
      router.push("/applicant");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-4 py-2"
      onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name *</label>
          <input
            type="text"
            placeholder="John"
            {...register("firstName", { required: "First name is required" })}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
          {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
          <input
            type="text"
            placeholder="Doe"
            {...register("lastName")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Headline</label>
        <input
          type="text"
          placeholder="e.g. Frontend Developer"
          {...register("headline")}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
        <input
          type="email"
          placeholder="john@example.com"
          {...register("email", { required: "Email is required" })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
        <input
          type="password"
          placeholder="At least 8 characters"
          {...register("password", {
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
        <input
          type="password"
          placeholder="Re-enter password"
          {...register("confirmPassword", {
            required: "Please confirm password",
            validate: (val) => val === password || "Passwords do not match",
          })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full py-3 bg-[#087F5B] text-white font-medium rounded-lg hover:bg-[#066B4D] transition-colors"
      >
        {registerMutation.isPending ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/dashboard/auth/login" className="text-[#087F5B] font-semibold hover:underline">
          Login
        </Link>
      </p>
    </form>
  );
}
