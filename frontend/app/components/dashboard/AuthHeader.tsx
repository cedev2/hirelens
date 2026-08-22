"use client";

import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="fixed left-1/2 top-4 -translate-x-1/2 z-50 w-fit">
      <Link href="/">
        <span className="text-2xl font-bold tracking-tight text-[#087F5B]">HireLens</span>
      </Link>
    </header>
  );
}
