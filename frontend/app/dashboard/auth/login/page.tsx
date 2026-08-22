import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";

export default function page() {
  return (
    <section className="min-h-screen flex">
      {/* Left — logo panel */}
      <div className="hidden lg:flex w-1/2 bg-[#087F5B] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Subtle background circles for depth */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/5" />

        <Link href="/" className="relative z-10 flex flex-col items-center gap-8">
          <Image
            src="/images/logo/logo.jpg"
            alt="HireLens"
            width={280}
            height={80}
            className="w-[280px] h-auto object-contain drop-shadow-xl"
            priority
          />
          <p className="text-white/80 text-lg font-medium text-center max-w-xs leading-relaxed">
            AI-powered recruitment — screen smarter, hire faster.
          </p>
        </Link>

        {/* Bottom illustration */}
        <div className="absolute bottom-0 left-0 right-0">
          <Image
            src="/images/illustrations/person-standing.svg"
            alt=""
            width={220}
            height={380}
            className="opacity-30"
          />
        </div>
      </div>

      {/* Right — login form panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <Image
              src="/images/logo/logo.jpg"
              alt="HireLens"
              width={160}
              height={44}
              className="h-[44px] w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back — sign in to continue.</p>
          </div>

          <LoginForm />

          <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-gray-100 text-xs text-gray-400">
            <Link href="/advice" className="hover:text-[#087F5B] transition-colors">Advice</Link>
            <span className="w-px h-3 bg-gray-200" />
            <Link href="/terms" className="hover:text-[#087F5B] transition-colors">Terms & Condition</Link>
            <span className="w-px h-3 bg-gray-200" />
            <Link href="/privacy-policy" className="hover:text-[#087F5B] transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
