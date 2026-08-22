"use client";

import Image from "next/image";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <header className="fixed left-6 top-5 z-50">
      <Link href="/">
        <Image
          src="/images/logo/hirelens.jpg"
          alt="HireLens"
          width={130}
          height={36}
          className="h-[36px] w-auto object-contain"
          priority
        />
      </Link>
    </header>
  );
}
