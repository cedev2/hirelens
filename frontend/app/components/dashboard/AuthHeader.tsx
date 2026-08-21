"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="fixed left-1/2 top-2 -translate-x-1/2 z-50 w-fit px-5 py-1.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gray-100">
      <Link href="/">
        <Image
          src="/images/logo/logo.svg"
          alt="HireLens Logo"
          width={110}
          height={34}
        />
      </Link>
    </header>
  );
}
