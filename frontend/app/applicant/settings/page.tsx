"use client";

import { useState } from "react";
import {
  Shield,
  Eye,
  EyeOff,
  Save,
  ChevronRight,
  Smartphone,
  Trash2,
  Loader2,
  XCircle,
  Laptop,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/lib/store/store";
import { logout } from "@/lib/store/authSlice";
import toast from "react-hot-toast";

export default function ApplicantSettingsPage() {
  const [activeTab, setActiveTab] = useState("security");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const router = useRouter();
  const { user: reduxUser } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const userQuery = useQuery({
    queryKey: ["user", "me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data?.user;
    },
  });

  const currentUser = userQuery.data || reduxUser;
  const hasPassword = !!currentUser?.hasPassword;

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await api.get("/users/sessions");
      return res.data?.sessions || [];
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.put("/users/password", payload);
    },
    onSuccess: (res) => {
      toast.success(res.data.message);
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update password");
    },
  });

  const revokeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await api.post(`/users/sessions/${sessionId}/revoke`);
    },
    onSuccess: () => {
      toast.success("Session revoked");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => {
      toast.error("Failed to revoke session");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return await api.delete("/users/");
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      dispatch(logout());
      router.push("/dashboard/auth/login");
    },
    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  const handleSave = () => {
    if (activeTab === "security") {
      if (!formData.newPassword) return;
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (formData.newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
      updatePasswordMutation.mutate({
        currentPassword: hasPassword ? formData.currentPassword : "",
        newPassword: formData.newPassword,
      });
    }
  };

  const tabs = [
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <button
          type="button"
          onClick={() => router.push("/applicant")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex gap-8 relative">
          {/* Sidebar */}
          <div className="w-56 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#E8F7F0] text-[#087F5B] border-r-2 border-[#087F5B]"
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

            <div className="mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                    deleteAccountMutation.mutate();
                  }
                }}
                disabled={deleteAccountMutation.isPending}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
                {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {activeTab === "security" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      {hasPassword ? "Change Password" : "Create Password"}
                    </h2>
                    <div className="space-y-4">
                      {hasPassword && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.currentPassword}
                              onChange={(e) =>
                                setFormData({ ...formData, currentPassword: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {hasPassword ? "New Password" : "Password"}
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, newPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm {hasPassword ? "New Password" : "Password"}
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#087F5B]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Active Sessions */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                    <div className="space-y-4">
                      {sessionsQuery.isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin text-[#087F5B]" />
                        </div>
                      ) : sessionsQuery.data?.length === 0 ? (
                        <p className="text-gray-500 text-center py-4 italic">
                          No active sessions found.
                        </p>
                      ) : (
                        sessionsQuery.data?.map((session: any) => (
                          <div
                            key={session._id}
                            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 bg-[#E8F7F0] rounded-full">
                                {session.userAgent?.toLowerCase().includes("mobi") ? (
                                  <Smartphone className="h-5 w-5 text-[#087F5B]" />
                                ) : (
                                  <Laptop className="h-5 w-5 text-[#087F5B]" />
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 flex items-center gap-2">
                                  {session.ipAddress || "Unknown IP"}
                                  {session.token === localStorage.getItem("accessToken") && (
                                    <span className="text-[10px] bg-[#E8F7F0] text-[#087F5B] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      Current Device
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {session.userAgent || "Unknown Device"}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tight">
                                  Last active: {new Date(session.lastAccess).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {session.token !== localStorage.getItem("accessToken") && (
                              <button
                                onClick={() => revokeSessionMutation.mutate(session._id)}
                                className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                                title="Revoke Session"
                              >
                                <XCircle className="h-5 w-5" />
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
                    disabled={updatePasswordMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2 bg-[#087F5B] text-white rounded-lg hover:bg-[#066B4D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePasswordMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
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
