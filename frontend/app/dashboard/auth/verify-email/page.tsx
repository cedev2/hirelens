import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import VerifyEmailForm from "./verify-form";
import AuthHeader from "@/app/components/dashboard/AuthHeader";

export default function VerifyEmailPage() {
  return (
    <section className="relative min-h-screen flex overflow-hidden">
      <AuthHeader />
      {/* Left side */}
      <div className="w-1/2 bg-white relative">
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/illustrations/person-standing.svg"
            alt=""
            width={259}
            height={471}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="w-1/2 bg-[#087F5B] relative">
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/illustrations/person-sitting.svg"
            alt=""
            width={390}
            height={776}
          />
        </div>
      </div>

      {/* Centered card */}
      <div className="absolute inset-0 top-[40px] flex items-center justify-center overflow-y-auto py-8">
        <div className="bg-white rounded-[10px] shadow-xl p-8 w-full max-w-[420px] mx-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-[#E8F7F0] flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#087F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verify your email
          </h1>
          <p className="text-sm text-gray-500 text-center mb-7">
            We sent a 6-digit verification code to your email address. Enter it below to activate your account.
          </p>

          <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded-lg" />}>
            <VerifyEmailForm />
          </Suspense>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard/auth/login"
              className="text-sm text-gray-500 hover:text-[#087F5B] transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
