"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import DashboardHeader from "@/app/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";
import ProfileCompletionModal from "./components/ProfileCompletionModal";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.includes("/auth/");
  const isProfileRoute = pathname?.includes("/profile");

  const { data: completionData } = useQuery({
    queryKey: ["talent", "profile-completion"],
    queryFn: async () => {
      const res = await api.get("/talents/check-completion");
      return res.data;
    },
    enabled: !isAuthRoute && !isProfileRoute,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const shouldShowModal = completionData && !completionData.isComplete && !isProfileRoute;

  if (isAuthRoute) {
    return <div className="min-h-screen bg-[#F8F8FD]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F8FD]">
      <DashboardHeader />
      <div className="flex pt-[56px]">
        <DashboardSidebar />
        <main className="flex-1 px-4 py-8">{children}</main>
      </div>

      {shouldShowModal && (
        <ProfileCompletionModal
          isOpen={true}
          missingFields={completionData.missingFields || []}
          onClose={() => {}}
          onComplete={() => {}}
        />
      )}
    </div>
  );
}
