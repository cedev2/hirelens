"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  FileText,
  Briefcase,
  User,
  Settings,
  UserSquare2,
  ScanTextIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const mainNav: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <LayoutGrid className="h-5 w-5" /> },
  { label: "Jobs", href: "/admin/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Applications", href: "/admin/applications", icon: <FileText className="h-5 w-5" /> },
  { label: "Talents", href: "/admin/candidates", icon: <UserSquare2 className="h-5 w-5" /> },
  { label: "Screening", href: "/admin/screening", icon: <ScanTextIcon className="h-5 w-5" /> },
];

const bottomNav: NavItem[] = [
  { label: "Profile", href: "/admin/profile", icon: <User className="h-5 w-5" /> },
  { label: "Setting", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

function NavLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`group relative flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
        collapsed ? "justify-center" : "gap-3"
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
      <span className={active ? "text-[#087F5B]" : "text-[#7C8493] group-hover:text-[#25324B]"}>
        {item.icon}
      </span>
      {!collapsed && <span className="truncate">{item.label}</span>}
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

  return (
    <div className="h-full flex flex-col overflow-y-auto overflow-x-hidden">

      {/* Main nav */}
      <nav className="space-y-1 px-2" data-tour="sidebar-navigation">
        {mainNav.map((item) => {
          const active = pathname === item.href;
          return (
            <NavLink key={item.href} item={item} active={active} collapsed={collapsed} onClick={onNavigate} />
          );
        })}
      </nav>

      <div className="my-3 mx-4 h-px bg-gray-100" />

      {/* Bottom nav */}
      <nav className="space-y-1 px-2">
        {bottomNav.map((item) => {
          const active = pathname === item.href;
          return (
            <NavLink key={item.href} item={item} active={active} collapsed={collapsed} onClick={onNavigate} />
          );
        })}
      </nav>

      <div className="flex-1" />
    </div>
  );
}

export default function AdminSidebar({
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
            <Link href="/admin" className="shrink-0">
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
          <aside className="absolute left-0 top-0 h-full w-[270px] max-w-[85vw] bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <Link href="/admin" className="shrink-0">
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
