import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";
import AuthHeader from "@/app/components/dashboard/AuthHeader";

export default function page() {
  return (
    <section className="relative min-h-screen flex overflow-hidden">
      <AuthHeader />

      {/* Left side*/}
      <div className="w-1/2 bg-white relative">
        <div className="absolute bottom-0 left-0">
          <Image
            src="/images/illustrations/person-standing.svg"
            alt="Person standing"
            width={259}
            height={471}
          />
        </div>
      </div>

      {/* Right side - Blue background */}
      <div className="w-1/2 bg-[#087F5B] relative">
        {/* Right illustration placeholder */}
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/illustrations/person-sitting.svg"
            alt="Person sitting"
            width={390}
            height={776}
          />
        </div>
      </div>

      {/* Centered Login Card */}
      <div className="absolute inset-0 top-[40px] flex items-center justify-center overflow-y-auto py-8">
        <div className="bg-white rounded-[10px] shadow-xl p-6 sm:p-8 w-full max-w-[420px] mx-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

          <LoginForm />

          <div className="flex items-center justify-center gap-4 mt-6 pt-5 border-t border-gray-100 text-xs text-gray-400">
            <Link href="/advice" className="hover:text-[#087F5B] transition-colors">Advice</Link>
            <span className="w-px h-3 bg-gray-300" />
            <Link href="/terms" className="hover:text-[#087F5B] transition-colors">Terms & Condition</Link>
            <span className="w-px h-3 bg-gray-300" />
            <Link href="/privacy-policy" className="hover:text-[#087F5B] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
