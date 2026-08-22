"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthHeader({ hideLogo = false }: { hideLogo?: boolean }) {
  return (
    <header
      className={
        hideLogo
          ? "fixed top-5 right-6 z-50"
          : "fixed top-5 left-6 z-50 flex items-center gap-3 sm:gap-4"
      }
    >
      {!hideLogo && (
        <Link href="/" aria-label="HireLens home">
          <Image
            src="/images/logo/hirelens.jpg"
            alt="HireLens"
            width={130}
            height={36}
            className="h-[36px] w-auto object-contain"
            priority
          />
        </Link>
      )}
      <Link
        href="/"
        className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-gray-200 bg-white/90 pl-2.5 pr-3 sm:pl-3 sm:pr-4 py-2 text-xs sm:text-sm font-medium text-[#25324B] shadow-sm backdrop-blur-sm hover:border-[#087F5B]/40 hover:text-[#087F5B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span>Back</span>
        <span className="hidden sm:inline">to website</span>
      </Link>
    </header>
  );
}
