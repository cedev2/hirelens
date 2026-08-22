"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/lib/store/authSlice";
import { api } from "@/lib/api/client";
import {
  Briefcase,
  FileText,
  LogOut,
  LayoutGrid,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Settings,
} from "lucide-react";
import ChatWidget from "@/app/components/chat/ChatWidget";

const navItems = [
  { label: "Dashboard", href: "/applicant", icon: <LayoutGrid className="h-5 w-5" /> },
  { label: "Browse Jobs", href: "/applicant/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { label: "My Applications", href: "/applicant/applications", icon: <FileText className="h-5 w-5" /> },
  { label: "Profile", href: "/applicant/profile", icon: <User className="h-5 w-5" /> },
  { label: "Settings", href: "/applicant/settings", icon: <Settings className="h-5 w-5" /> },
];

export default function ApplicantLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthRoute = pathname?.includes("/auth/");
  const user = useSelector((state: any) => state.auth?.user);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthRoute && (!user || user.role !== "applicant")) {
      router.push("/dashboard/auth/login");
    }
  }, [user, isAuthRoute, router]);

  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#F8F8FD]">{children}</div>;
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    dispatch(logout());
    router.push("/dashboard/auth/login");
  };

  const sidebarWidth = sidebarCollapsed ? "w-[64px]" : "w-[220px]";
  const mainMargin = sidebarCollapsed ? "lg:ml-[64px]" : "lg:ml-[220px]";

  return (
    <div className="min-h-screen bg-[#F8F8FD]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden rounded-lg p-2 text-[#25324B] hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/applicant" className="shrink-0">
              <Image
                src="/images/logo/logo.jpg"
                alt="HireLens"
                width={120}
                height={32}
                className="h-[32px] w-auto object-contain"
              />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-600">
              {mounted ? (user?.firstName || "Applicant") : "Applicant"}
            </span>
            <button
              onClick={handleLogout}
              className="h-9 w-9 rounded-full bg-gray-50 border border-gray-100 grid place-items-center hover:bg-red-50 hover:border-red-200 transition-colors group"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-gray-500 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-[53px]">
        {/* Desktop sidebar */}
        <aside
          className={`hidden lg:flex flex-col fixed left-0 top-[53px] bottom-0 bg-white border-r border-gray-100 transition-all duration-300 ${sidebarWidth}`}
        >
          {/* Brand + collapse toggle */}
          <div
            className={`flex items-center border-b border-gray-100 px-3 py-4 ${
              sidebarCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!sidebarCollapsed && (
              <Link href="/applicant" className="shrink-0">
                <span className="text-xl font-bold tracking-tight text-[#087F5B]">
                  HireLens
                </span>
              </Link>
            )}
            <button
              onClick={() => setSidebarCollapsed((v) => !v)}
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="rounded-lg p-1.5 text-[#7C8493] hover:bg-[#F8F8FD] hover:text-[#087F5B] transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Nav items */}
          <nav className="space-y-1 px-2 mt-4">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/applicant" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`group relative flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    sidebarCollapsed ? "justify-center" : "gap-3"
                  } ${
                    active
                      ? "bg-[#E8F7F0] text-[#087F5B]"
                      : "text-[#25324B] hover:bg-[#F8F8FD]"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition-opacity ${
                      active ? "bg-[#087F5B] opacity-100" : "opacity-0"
                    }`}
                  />
                  <span
                    className={
                      active
                        ? "text-[#087F5B]"
                        : "text-[#7C8493] group-hover:text-[#25324B]"
                    }
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-[270px] max-w-[85vw] bg-white shadow-xl">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
                <Link href="/applicant">
                  <span className="text-xl font-bold tracking-tight text-[#087F5B]">
                    HireLens
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-[#7C8493] hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav
                className="space-y-1 px-4 mt-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {navItems.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/applicant" &&
                      pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#E8F7F0] text-[#087F5B]"
                          : "text-[#25324B] hover:bg-[#F8F8FD]"
                      }`}
                    >
                      <span
                        className={
                          active ? "text-[#087F5B]" : "text-[#7C8493]"
                        }
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main
          className={`flex-1 min-w-0 ${mainMargin} px-4 sm:px-6 py-6 sm:py-8 transition-all duration-300`}
        >
          {children}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
