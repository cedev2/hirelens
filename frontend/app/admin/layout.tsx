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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex pt-[56px]">
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>
      <AdminOnboarding
        run={showOnboarding}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
