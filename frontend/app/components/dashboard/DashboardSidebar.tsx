"use client";

import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Briefcase,
  User,
  CalendarDays,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/lib/store/authSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  onClick?: () => void;
};

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: <User className="h-5 w-5" />,
  },
  {
    label: "Jobs",
    href: "/dashboard/jobs",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Calendar",
    href: "/dashboard/calendar",
    icon: <CalendarDays className="h-5 w-5" />,
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  if (item.onClick) {
    return (
      <button
        onClick={item.onClick}
        className={`w-full group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
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
      </button>
    );
  }

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data?.user;
    },
    enabled: !reduxUser,
  });

  const { data: talent } = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
  });

  const handleLogout = () => {
    dispatch(logout());
    router.push("/dashboard/auth/login");
  };

  const bottomNav: NavItem[] = [
    {
      label: "Setting",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "Help & Support",
      href: "/dashboard/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: "Logout",
      href: "#",
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout,
    },
  ];

  const currentUser = reduxUser || user;
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    : "Loading...";
  const userPicture =
    currentUser?.picture ||
    talent?.userId?.picture ||
    "/images/companies/dummy.png";
  const userHeadline = talent?.headline || "Talent";

  const wrapClick = (item: NavItem) =>
    item.onClick
      ? item.onClick
      : () => {
          onNavigate?.();
        };

  return (
    <div className="h-full px-5 py-8 flex flex-col overflow-y-auto">
      {/* User card */}
      <div className="flex items-center justify-between mb-8">
        <phantom-ui loading={!currentUser && userLoading}>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
              <Image
                src={userPicture}
                alt="User avatar"
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-[#25324B]">
                {displayName}
              </p>
              <p className="text-xs text-[#7C8493] line-clamp-1">
                {userHeadline}
              </p>
            </div>
          </div>
        </phantom-ui>
      </div>

      {/* Main nav */}
      <nav className="space-y-2 relative left-[-21px]">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <div key={item.href} onClick={wrapClick(item)}>
              <NavLink item={item} active={active} />
            </div>
          );
        })}
      </nav>

      <div className="my-3 h-px w-full bg-gray-100" />

      {/* Bottom nav */}
      <nav className="space-y-2 relative left-[-21px]">
        {bottomNav.map((item) => {
          const active = pathname === item.href;
          return (
            <div key={item.href} onClick={wrapClick(item)}>
              <NavLink item={item} active={active} />
            </div>
          );
        })}
      </nav>

      <div className="flex-1" />
    </div>
  );
}

export default function DashboardSidebar({
  mobileOpen = false,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-[56px] h-[calc(100vh-56px)] w-[240px] shrink-0 bg-white border-r border-gray-100">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[270px] max-w-[85vw] bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 pt-4">
              <Image
                src="/images/logo/logo.svg"
                alt="HireLens Logo"
                width={80}
                height={14}
                className="h-[14px] w-auto"
              />
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="rounded-lg p-2 text-[#7C8493] hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-52px)]">
              <SidebarContent onNavigate={onMobileClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
