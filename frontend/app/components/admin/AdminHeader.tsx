"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { LogOut, Menu, Search } from "lucide-react";
import { logout } from "@/lib/store/authSlice";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { api } from "@/lib/api/client";

export default function AdminHeader({
  onMenuClick,
}: {
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    dispatch(logout());
    router.push("/admin/auth/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F8F8FD]/80 backdrop-blur-md border-b border-gray-100/60">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden rounded-lg p-2 text-[#25324B] hover:bg-white/70"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="shrink-0">
            <Image
              src="/images/logo/hirelens.jpg"
              alt="HireLens Logo"
              width={160}
              height={40}
              loading="eager"
              className="h-[36px] w-auto object-contain"
            />
          </Link>
        </div>

        <div className="hidden sm:block mx-6 w-full max-w-md">
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm border border-gray-100">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationDropdown role="admin" />
          <button
            onClick={handleLogout}
            className="h-10 w-10 rounded-full bg-white border border-gray-100 shadow-sm grid place-items-center hover:bg-red-50 hover:border-red-200 transition-colors group"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
}
