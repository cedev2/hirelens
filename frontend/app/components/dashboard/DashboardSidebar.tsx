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
  ChevronLeft,
  ChevronRight,
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
  { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid className="h-5 w-5" /> },
  { label: "My Profile", href: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  { label: "Jobs", href: "/dashboard/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Applications", href: "/dashboard/applications", icon: <FileText className="h-5 w-5" /> },
  { label: "Calendar", href: "/dashboard/calendar", icon: <CalendarDays className="h-5 w-5" /> },
];

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const baseClass = `group relative flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
    collapsed ? "justify-center" : "gap-3"
  } ${
    active
      ? "bg-[#E8F7F0] text-[#087F5B]"
      : "text-[#25324B] hover:bg-[#F8F8FD]"
  }`;

  const activeLine = (
    <span
      className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition-opacity ${
        active ? "bg-[#087F5B] opacity-100" : "opacity-0"
      }`}
    />
  );

  const iconEl = (
    <span className={active ? "text-[#087F5B]" : "text-[#7C8493] group-hover:text-[#25324B]"}>
      {item.icon}
    </span>
  );

  const inner = (
    <>
      {activeLine}
      {iconEl}
      {!collapsed && <span className="truncate">{item.label}</span>}
    </>
  );

  if (item.onClick) {
    return (
      <button onClick={item.onClick} title={collapsed ? item.label : undefined} className={`w-full ${baseClass}`}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={item.href} title={collapsed ? item.label : undefined} className={baseClass}>
      {inner}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);

  const { data: user } = useQuery({
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
    { label: "Setting", href: "/dashboard/settings", icon: <Settings className="h-5 w-5" /> },
    { label: "Help & Support", href: "/dashboard/help", icon: <HelpCircle className="h-5 w-5" /> },
    { label: "Logout", href: "#", icon: <LogOut className="h-5 w-5" />, onClick: handleLogout },
  ];

  const currentUser = reduxUser || user;
  const displayName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    : "Loading...";
  const userPicture = currentUser?.picture || talent?.userId?.picture || "/images/companies/dummy.png";
  const userHeadline = talent?.headline || "Talent";

  const wrapClick = (item: NavItem) =>
    item.onClick ? item.onClick : () => { onNavigate?.(); };

  return (
    <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">
      {/* User card */}
      <div className={`flex items-center mt-6 mb-6 px-4 ${collapsed ? "justify-center" : "gap-3"}`}>
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100"
          title={collapsed ? displayName : undefined}
        >
          <Image src={userPicture} alt="User avatar" fill className="object-cover" sizes="40px" />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-[#25324B] truncate">{displayName}</p>
            <p className="text-xs text-[#7C8493] truncate">{userHeadline}</p>
          </div>
        )}
      </div>

      {/* Main nav */}
      <nav className="space-y-1 px-2">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <div key={item.href} onClick={wrapClick(item)}>
              <NavLink item={item} active={active} collapsed={collapsed} />
            </div>
          );
        })}
      </nav>

      <div className="my-3 mx-4 h-px bg-gray-100" />

      {/* Bottom nav */}
      <nav className="space-y-1 px-2">
        {bottomNav.map((item) => {
          const active = pathname === item.href;
          return (
            <div key={item.href} onClick={wrapClick(item)}>
              <NavLink item={item} active={active} collapsed={collapsed} />
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
  collapsed = false,
  onToggleCollapse,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col sticky top-[56px] h-[calc(100vh-56px)] shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ${
          collapsed ? "w-[64px]" : "w-[240px]"
        }`}
      >
        {/* Brand + toggle row */}
        <div className={`flex items-center border-b border-gray-100 px-3 py-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/dashboard" className="shrink-0">
              <span className="text-xl font-bold tracking-tight text-[#087F5B]">HireLens</span>
            </Link>
          )}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-1.5 text-[#7C8493] hover:bg-[#F8F8FD] hover:text-[#087F5B] transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-[270px] max-w-[85vw] bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <Link href="/dashboard">
                <span className="text-xl font-bold tracking-tight text-[#087F5B]">HireLens</span>
              </Link>
              <button
                onClick={onMobileClose}
                aria-label="Close menu"
                className="rounded-lg p-2 text-[#7C8493] hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[calc(100%-61px)]">
              <SidebarContent collapsed={false} onNavigate={onMobileClose} />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
