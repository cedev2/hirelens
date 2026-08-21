"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="fixed left-1/2 top-4 -translate-x-1/2 z-50 w-fit">
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
