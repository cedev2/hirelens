import Image from "next/image";
import ForgotPasswordForm from "./forgot-form";

export default function ForgotPasswordPage() {
  return (
    <section className="relative min-h-screen flex overflow-hidden">
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
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Forgot your password?
          </h1>
          <p className="text-sm text-gray-500 text-center mb-7 leading-relaxed">
            Enter the email address associated with your account and we'll send you a code to reset your password.
          </p>

          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
