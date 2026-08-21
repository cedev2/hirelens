"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Shield,
  Globe,
  Eye,
  EyeOff,
  Save,
  ChevronRight,
  LogOut,
  Monitor,
  HelpCircle,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";

type MeUser = {
  _id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  picture?: string;
  role?: "applicant" | "admin";
};

type Session = {
  id: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
};

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("security");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: true,
    marketingEmails: false,
    language: "english",
    timezone: "UTC-8",
    theme: "light",
  });

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data?.user as MeUser;
    },
    staleTime: 60_000,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/auth/logout");
      return res.data;
    },
    onSuccess: () => {
      if (typeof window !== "undefined") {
        // Clear all auth tokens from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Clear all cookies
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.split("=");
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      queryClient.clear();
      toast.success("Logged out");
      router.push("/dashboard/auth/login");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Logout failed");
      if (typeof window !== "undefined") {
        // Clear all auth tokens from localStorage even on error
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Clear all cookies even on error
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.split("=");
          document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      queryClient.clear();
      router.push("/dashboard/auth/login");
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put("/auth/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Password updated");
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowPassword(false);
      setShowNewPassword(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Password update failed");
    },
  });

  const sessionsQuery = useQuery<Session[]>({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const res = await api.get("/sessions");
      return res.data || [];
    },
    enabled: activeTab === "account",
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await api.delete(`/sessions/${sessionId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Session ended");
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to end session");
    },
  });

  const prefsKey = useMemo(() => {
    const id = String(meQuery.data?._id ?? "").trim();
    return id ? `admin_settings_${id}` : "admin_settings";
  }, [meQuery.data?._id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(prefsKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<typeof formData>;
      setFormData((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefsKey]);

  const tabs = [
    { id: "security", label: "Security", icon: Shield },
    { id: "account", label: "Account", icon: Globe },
  ];

  const handleSave = () => {
    if (activeTab === "security") {
      if (!formData.currentPassword || !formData.newPassword) {
        toast.error("Fill current + new password");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      updatePasswordMutation.mutate();
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(
        prefsKey,
        JSON.stringify({
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
          smsNotifications: formData.smsNotifications,
          marketingEmails: formData.marketingEmails,
          language: formData.language,
          timezone: formData.timezone,
          theme: formData.theme,
        }),
      );
    }

    toast.success("Settings saved");
  };

  const handleRestartTour = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("admin-onboarding-completed");
    toast.success("Admin tour will run again on your next Dashboard visit.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full px-5 mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
          <button
            type="button"
            onClick={handleRestartTour}
            className="items-center justify-center rounded-lg border border-green-600 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors hidden"
          >
            Restart Dashboard Tour
          </button>
        </div>

        <div className="flex gap-8 relative">
          {/* Sidebar */}
          <div className="w-64 shrink-0 sticky top-5">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium  transition-colors ${
                      activeTab === tab.id
                        ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Security Tab */}
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Change Password
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={formData.currentPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === "account" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Account Actions
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <LogOut className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">Logout</p>
                            <p className="text-sm text-gray-600">
                              End session on this device
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => logoutMutation.mutate()}
                          disabled={logoutMutation.isPending}
                          className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-60"
                        >
                          {logoutMutation.isPending
                            ? "Logging out..."
                            : "Logout"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Active Login Sessions
                    </h2>
                    <div className="space-y-3">
                      {sessionsQuery.isLoading ? (
                        <p className="text-sm text-gray-500">
                          Loading sessions...
                        </p>
                      ) : sessionsQuery.data?.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No active sessions found.
                        </p>
                      ) : (
                        sessionsQuery.data?.map((session) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {session.userAgent}
                                {session.isCurrent && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                                    Current
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                IP: {session.ip}
                              </p>
                              <p className="text-xs text-gray-500">
                                Started:{" "}
                                {new Date(session.createdAt).toLocaleString()}
                              </p>
                            </div>
                            {!session.isCurrent && (
                              <button
                                onClick={() =>
                                  terminateSessionMutation.mutate(session.id)
                                }
                                disabled={terminateSessionMutation.isPending}
                                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors disabled:opacity-60"
                              >
                                {terminateSessionMutation.isPending
                                  ? "Ending..."
                                  : "End Session"}
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="border-t p-6">
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
