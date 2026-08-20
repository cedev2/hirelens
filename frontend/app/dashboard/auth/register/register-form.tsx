"use client";
import Link from "next/link";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api/client";
import { useDispatch } from "react-redux";
import { setAuth } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";

type RegisterValues = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
};

type AuthResponse = {
  user: any;
  tokens: {
    accessToken: string;
    refreshToken?: string;
  };
};

export default function RegisterForm() {
  const dispatch = useDispatch();
  const router = useRouter();

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
      dispatch(setAuth({ user: data.user, tokens: data.tokens }));
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
      <div className="grid grid-cols-2 gap-4">
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
        <input
          type="password"
          placeholder="Create a password"
          {...register("password", { required: "Password is required" })}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
        />
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
            href="/dashboard/auth/login"
            className="text-[#087F5B] font-semibold hover:text-[#087F5B]/80"
          >
            Login
          </Link>
        </span>
      </div>
    </form>
  );
}
