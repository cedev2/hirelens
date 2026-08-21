"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { useDispatch } from "react-redux";
import { setAuth } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";

type LoginValues = {
  email: string;
  password: string;
};

type AuthResponse = {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
};

export default function LoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>();

  const loginMutation = useMutation<AuthResponse, any, LoginValues>({
    mutationFn: async (values) => {
      const res = await api.post("/auth/login/local", values);
      return res.data;
    },
    onSuccess: (data) => {
      dispatch(setAuth({ user: data.user, tokens: data.tokens }));
      toast.success("Login successful");
      if (data.user.role === "admin") return router.push("/admin");
      if (data.user.role === "applicant") return router.push("/applicant");
      router.push("/dashboard");
    },
    onError: (error) => {
      const body = error?.response?.data;
      if (body?.requiresVerification && body?.email) {
        toast("Please verify your email first. A new code has been sent.", { icon: "📧" });
        const redirect = encodeURIComponent("/applicant");
        router.push(
          `/dashboard/auth/verify-email?email=${encodeURIComponent(body.email)}&redirect=${redirect}`
        );
        return;
      }
      const message = body?.message || "Login failed";
      toast.error(message);
    },
  });

  return (
    <form
      className="space-y-5 py-2"
      onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
    >
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

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          {...register("password", { required: "Password is required" })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot password */}
      <div className="text-right -mt-2">
        <Link href="/dashboard/auth/forgot-password" className="text-sm text-[#087F5B] hover:text-[#066B4D]">
          Forgot Your Password?
        </Link>
      </div>

      {/* Login button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full py-3 bg-[#087F5B] text-white font-medium rounded-lg hover:bg-[#066B4D] transition-colors"
      >
        {loginMutation.isPending ? "Logging in..." : "Login"}
      </button>

      <div className="text-center mt-2">
        <span className="text-sm w-full text-gray-500">
          Reserved for HireLens Hiring Team{" "}
          <Link
            href="/dashboard/auth/register"
            className="text-[#087F5B] font-semibold hover:text-[#087F5B]/80 hidden"
          >
            Signup Now
          </Link>
        </span>
      </div>
    </form>
  );
}
