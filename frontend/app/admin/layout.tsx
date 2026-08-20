"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

import AdminHeader from "../components/admin/AdminHeader";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminOnboarding from "../components/admin/AdminOnboarding";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.includes("/auth/");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    const hasSeenOnboarding = localStorage.getItem(
      "admin-onboarding-completed",
    );
    const isDashboardPage = pathname === "/admin";

    if (!hasSeenOnboarding && isDashboardPage && !isAuthRoute) {
      // Small delay to ensure components are rendered
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [pathname, isAuthRoute]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem("admin-onboarding-completed", "true");
  };

  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#F8F8FD]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8FD]">
      <AdminHeader />
      <div className="flex pt-[56px]">
        <AdminSidebar />
        <main className="flex-1 px-4 py-8">{children}</main>
      </div>
      <AdminOnboarding
        run={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
