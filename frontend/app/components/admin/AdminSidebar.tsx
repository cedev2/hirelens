"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  FileText,
  Briefcase,
  User,
  CalendarDays,
  Settings,
  HelpCircle,
  LogOut,
  UserSquare2,
  ScanTextIcon,
} from "lucide-react";
import { api } from "@/lib/api/client";

type UserData = {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  picture?: string;
  role?: "applicant" | "admin";
};

type MeUser = {
  user?: UserData;
};

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    label: "Applications",
    href: "/admin/applications",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Talents",
    href: "/admin/candidates",
    icon: <UserSquare2 className="h-5 w-5" />,
  },
  {
    label: "Screening",
    href: "/admin/screening",
    icon: <ScanTextIcon className="h-5 w-5" />,
  },
];

const bottomNav: NavItem[] = [
  {
    label: "Profile",
    href: "/admin/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "Setting",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  // {
  //   label: "Logout",
  //   href: "/admin/logout",
  //   icon: <LogOut className="h-5 w-5" />,
  // },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
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
      <span>{item.label}</span>
    </Link>
  );
}

export default function AdminSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();

  const { data: user, isLoading } = useQuery<MeUser>({
    queryKey: ["admin-me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data as MeUser;
    },
  });

  const meUser = user?.user;

  const displayName = meUser
    ? `${meUser.firstName || ""} ${meUser.lastName || ""}`.trim()
    : "HR Admin";
  const role = meUser?.role ?? "admin";
  const avatarUrl = meUser?.picture || "/images/companies/dummy.png";

  const content = (
    <phantom-ui loading={isLoading}>
      <div className="h-full px-5 py-12 flex flex-col overflow-y-auto">
        {/* User card */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={avatarUrl}
                alt="User avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#25324B]">
                {displayName || "Admin User"}
              </p>
              <p className="text-xs text-[#7C8493] capitalize">{role}</p>
            </div>
          </div>
        </div>

        {/* Main nav */}
        <nav className="space-y-2 relative left-[-21px]" onClick={onMobileClose}>
          {mainNav.map((item) => {
            const active = pathname === item.href;
            return <NavLink key={item.href} item={item} active={active} />;
          })}
        </nav>

        <div className="my-3 h-px w-full bg-gray-100" />

        {/* Bottom nav */}
        <nav className="space-y-2 relative left-[-21px]" onClick={onMobileClose}>
          {bottomNav.map((item) => {
            const active = pathname === item.href;
            return <NavLink key={item.href} item={item} active={active} />;
          })}
        </nav>

        <div className="flex-1" />
      </div>
    </phantom-ui>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block sticky top-[56px] h-[calc(100vh-56px)] w-[240px] shrink-0 bg-white border-r border-gray-100"
        data-tour="sidebar-navigation"
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[270px] max-w-[85vw] bg-white shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
