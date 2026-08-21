"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between transition-all duration-300 max-w-[96vw] ${
        scrolled
          ? "w-[94%] sm:w-[80%] px-4 sm:px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100"
          : "w-full px-4 sm:px-8 lg:px-[122px] py-5 bg-[#f8f8fd]"
      }`}
    >
      <div className="flex items-center gap-4 lg:gap-8">
        <Link href="/">
          <Image
            src="/images/logo/logo.svg"
            alt="HireLens Logo"
            width={100}
            height={30}
            className="h-[24px] sm:h-[30px] w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <Link href="/admin" className="hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/admin/jobs" className="hover:text-gray-900">
            Jobs
          </Link>
          <Link href="/admin/screening" className="hover:text-gray-900">
            Screening
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/applicant/auth/register"
          className="text-sm font-bold text-[#087F5B] hover:text-[#4338CA]"
        >
          Apply Now
        </Link>
        <Link
          href="/dashboard/auth/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Login
        </Link>
        <Link
          href="/admin"
          className="px-5 py-2.5 text-sm font-medium text-white bg-[#087F5B] hover:bg-[#066B4D]"
        >
          Dashboard
        </Link>
      </div>
    </header>
  );
}
