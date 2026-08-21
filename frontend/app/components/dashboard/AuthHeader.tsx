"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function AuthHeader() {
  return (
    <header
      className={`fixed left-1/2 top-2 -translate-x-1/2 z-50 flex items-center gap-8 transition-all duration-300 w-fit px-6 py-3 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100`}
    >
      <Link href="/">
        <Image
          src="/images/logo/logo.svg"
          alt="HireLens Logo"
          width={110}
          height={34}
        />
      </Link>

      <nav className="flex items-center gap-6 text-sm text-gray-700">
        <Link href="/advice" className="hover:text-gray-900">
          Advice
        </Link>

        <div className="w-px h-[20px] bg-black" />

        <Link href="/terms" className="hover:text-gray-900">
          Terms & Condition
        </Link>

        <div className="w-[2px] h-[20px] bg-black" />

        <Link href="/privacy-policy" className="hover:text-gray-900">
          Privacy Policy
        </Link>
      </nav>
    </header>
  );
}
