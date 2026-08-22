"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  User,
  Briefcase,
  AlertCircle,
  MoreVertical,
  Circle,
} from "lucide-react";
import Link from "next/link";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "application" | "job" | "system" | "user";
  createdAt: string;
  isRead: boolean;
}

interface NotificationDropdownProps {
  role: "admin" | "applicant";
}

export default function NotificationDropdown({
  role,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored) as Notification[];
      setNotifications(parsed);
    }
  }, []);

  // Sync notifications to localStorage when they change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Format timestamp to relative time
  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  // Mark single notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (category: Notification["category"]) => {
    switch (category) {
      case "application":
        return <Briefcase className="w-4 h-4" />;
      case "job":
        return <Clock className="w-4 h-4" />;
      case "user":
        return <User className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getColors = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-600";
      case "warning":
        return "bg-amber-50 text-amber-600";
      case "error":
        return "bg-red-50 text-red-600";
      default:
        return "bg-green-50 text-green-600";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 w-10 rounded-full bg-white border border-gray-100 shadow-sm grid place-items-center hover:bg-gray-50 transition-colors relative"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-[-5px] right-[-5px] h-4 w-4 bg-[#087F5B] text-white text-[10px] font-bold rounded-full border-2 border-white grid place-items-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[20px] shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 pt-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-[#111827]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-bold text-[#087F5B] hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.isRead ? "bg-green-50/20" : ""}`}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Circle className="w-2 h-2 fill-[#087F5B] text-[#087F5B]" />
                      </div>
                    )}
                    <div className="flex gap-4 items-center">
                      <div
                        className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${getColors(notification.type)}`}
                      >
                        {getIcon(notification.category)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-bold ${!notification.isRead ? "text-[#111827]" : "text-gray-600"}`}
                          >
                            {notification.title}
                          </p>
                          <span className="text-[10px] font-medium text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-sm font-bold text-[#111827]">
                  No notifications yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  We'll notify you when something happens
                </p>
              </div>
            )}
          </div>

          {/* <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
            <Link
              href={
                role === "admin"
                  ? "/admin/notifications"
                  : "/dashboard/notifications"
              }
              className="text-xs font-bold text-[#111827] hover:text-[#087F5B] transition-colors uppercase tracking-widest"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </Link>
          </div> */}
        </div>
      )}
    </div>
  );
}
