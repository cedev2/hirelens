"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import NotificationDropdown from "../notifications/NotificationDropdown";

export default function DashboardHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F8FD]/80 backdrop-blur-md border-b border-gray-100/60">
      <div className="flex items-center justify-between px-6 py-2.5">
        <Link href="/dashboard" className="shrink-0">
          <Image
            src="/images/logo/logo.svg"
            alt="HireLens Logo"
            width={80}
            height={14}
            className="h-[14px] w-auto"
          />
        </Link>

        <div className="mx-6 w-full max-w-md">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm border border-gray-100">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <NotificationDropdown role="applicant" />
      </div>
    </header>
  );
}
