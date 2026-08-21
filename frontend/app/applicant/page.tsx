"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import { Briefcase, FileText, Clock, CheckCircle, Award } from "lucide-react";
import Link from "next/link";

export default function ApplicantDashboard() {
  const user = useSelector((state: any) => state.auth?.user);
  const talentId = user?.talentProfileId;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applicant", "applications", talentId],
    queryFn: async () => {
      if (!talentId) return [];
      const res = await api.get(`/applications/talent/${talentId}`);
      return res.data?.applications ?? [];
    },
    enabled: !!talentId,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return res.data?.jobs ?? [];
    },
  });

  const openJobs = jobs.filter((j: any) => j.status === "open");
  const pending = applications.filter((a: any) => a.status === "pending");
  const reviewing = applications.filter((a: any) => a.status === "reviewing");
  const shortlisted = applications.filter((a: any) => a.status === "shortlisted");
  const hired = applications.filter((a: any) => a.status === "hired");

  const stats = [
    { label: "Open Jobs", value: openJobs.length, icon: <Briefcase className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Applications", value: applications.length, icon: <FileText className="h-5 w-5" />, color: "text-[#087F5B]", bg: "bg-[#E8F7F0]" },
    { label: "Pending", value: pending.length, icon: <Clock className="h-5 w-5" />, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Under Review", value: reviewing.length, icon: <FileText className="h-5 w-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Shortlisted", value: shortlisted.length, icon: <Award className="h-5 w-5" />, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Hired", value: hired.length, icon: <CheckCircle className="h-5 w-5" />, color: "text-green-600", bg: "bg-green-50" },
  ];

  const recentApplications = applications.slice(0, 5);

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#25324B]" suppressHydrationWarning>
          Welcome back, {user?.firstName || "Applicant"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here's an overview of your job search activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-2xl font-bold text-[#25324B]">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#25324B]">Recent Applications</h2>
            <Link href="/applicant/applications" className="text-sm text-[#087F5B] hover:underline">
              View all
            </Link>
          </div>
          {mounted && isLoading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 mb-3">You haven't applied to any jobs yet.</p>
              <Link href="/applicant/jobs" className="text-sm text-[#087F5B] hover:underline font-medium">
                Browse open jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app: any) => (
                <div key={app._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-[#25324B]">
                      {app.jobId?.title || "Unknown Job"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-[#25324B] mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/applicant/jobs"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-[#087F5B] hover:bg-[#E8F7F0]/30 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#25324B]">Browse Jobs</p>
                <p className="text-xs text-gray-500">Find and apply to open positions</p>
              </div>
            </Link>
            <Link
              href="/applicant/applications"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-[#087F5B] hover:bg-[#E8F7F0]/30 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-[#E8F7F0] flex items-center justify-center text-[#087F5B]">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#25324B]">Track Applications</p>
                <p className="text-xs text-gray-500">Check the status of your applications</p>
              </div>
            </Link>
          </div>

          {/* Status Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-400 uppercase mb-3">Status Legend</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2"><StatusBadge status="pending" /> <span className="text-xs text-gray-500">Awaiting review</span></div>
              <div className="flex items-center gap-2"><StatusBadge status="reviewing" /> <span className="text-xs text-gray-500">Being reviewed</span></div>
              <div className="flex items-center gap-2"><StatusBadge status="shortlisted" /> <span className="text-xs text-gray-500">Shortlisted</span></div>
              <div className="flex items-center gap-2"><StatusBadge status="hired" /> <span className="text-xs text-gray-500">Hired</span></div>
              <div className="flex items-center gap-2"><StatusBadge status="rejected" /> <span className="text-xs text-gray-500">Not selected</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    reviewing: "bg-indigo-50 text-indigo-700 border-indigo-200",
    shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
    hired: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
