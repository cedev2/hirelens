"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { Clock, FileText, Award, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string; description: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Pending",
    description: "Your application is awaiting review",
  },
  reviewing: {
    icon: <Eye className="h-4 w-4" />,
    color: "text-indigo-700",
    bg: "bg-indigo-50 border-indigo-200",
    label: "Under Review",
    description: "The hiring team is reviewing your application",
  },
  shortlisted: {
    icon: <Award className="h-4 w-4" />,
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    label: "Shortlisted",
    description: "You've been shortlisted for this position",
  },
  hired: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    label: "Hired",
    description: "Congratulations! You've been hired",
  },
  rejected: {
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    label: "Not Selected",
    description: "Unfortunately, you were not selected",
  },
};

export default function ApplicationsPage() {
  const user = useSelector((state: any) => state.auth?.user);
  const talentId = user?.talentProfileId;
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applicant", "applications", talentId],
    queryFn: async () => {
      if (!talentId) return [];
      const res = await api.get(`/applications/talent/${talentId}`);
      return res.data?.applications ?? [];
    },
    enabled: !!talentId,
  });

  const filtered = filterStatus === "all"
    ? applications
    : applications.filter((a: any) => a.status === filterStatus);

  const statusCounts = applications.reduce((acc: Record<string, number>, app: any) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#25324B]">My Applications</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track the status of all your job applications
        </p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === "all"
              ? "bg-[#087F5B] text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:border-[#087F5B]"
          }`}
        >
          All ({applications.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === key
                ? "bg-[#087F5B] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#087F5B]"
            }`}
          >
            {config.label} ({statusCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Loading applications...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">
            {applications.length === 0
              ? "You haven't applied to any jobs yet."
              : "No applications match this filter."}
          </p>
          {applications.length === 0 && (
            <Link href="/applicant/jobs" className="text-sm text-[#087F5B] hover:underline font-medium">
              Browse open jobs
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app: any) => {
            const config = statusConfig[app.status] || statusConfig.pending;
            const job = app.jobId;

            return (
              <div key={app._id} className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#25324B]">
                        {job?.title || "Unknown Job"}
                      </h3>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${config.bg} ${config.color}`}>
                        {config.icon}
                        {config.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {job?.locationType} · {job?.jobType}
                    </p>

                    <p className="text-sm text-gray-400 mb-3">
                      Applied on {new Date(app.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-1 mt-4">
                      {["pending", "reviewing", "shortlisted", "hired"].map((step, idx) => {
                        const stepOrder = ["pending", "reviewing", "shortlisted", "hired"];
                        const currentIdx = stepOrder.indexOf(app.status);
                        const isCompleted = idx <= currentIdx && app.status !== "rejected";
                        const isCurrent = step === app.status;

                        return (
                          <div key={step} className="flex items-center">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                isCompleted
                                  ? isCurrent
                                    ? "w-8 bg-[#087F5B]"
                                    : "w-8 bg-[#087F5B]"
                                  : "w-8 bg-gray-200"
                              }`}
                            />
                            {idx < 3 && (
                              <div
                                className={`h-0.5 w-4 ${
                                  idx < currentIdx ? "bg-[#087F5B]" : "bg-gray-200"
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{config.description}</p>
                  </div>

                  {job && (
                    <Link
                      href={`/applicant/jobs/${job._id || app.jobId}`}
                      className="text-sm text-[#087F5B] hover:underline shrink-0 ml-4"
                    >
                      View Job
                    </Link>
                  )}
                </div>

                {app.status === "rejected" && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-sm text-red-600">
                      This application was not successful. Keep applying — your next opportunity is waiting!
                    </p>
                  </div>
                )}

                {app.status === "hired" && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-sm text-green-600 font-medium">
                      Congratulations! You've been hired for this position. The hiring team will reach out to you soon.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
