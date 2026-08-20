"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  LayoutList,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import ApplicationCard, { Application } from "./components/ApplicationCard";
import ApplicationDetailModal from "./components/ApplicationDetailModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type BackendJob = {
  _id: string;
  title: string;
  locationType: string;
  jobType: string;
};

type BackendApplication = {
  _id: string;
  jobId: BackendJob;
  talentId: string;
  status: string;
  createdAt: string;
};

export default function ApplicationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Active" | "Past">("All");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const talentQuery = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
  });

  const talentId = talentQuery.data?._id;

  const applicationsQuery = useQuery({
    queryKey: ["applications", talentId],
    queryFn: async () => {
      const res = await api.get(`/applications/talent/${talentId}`);
      return (res.data?.applications ?? []) as BackendApplication[];
    },
    enabled: !!talentId,
    staleTime: 30_000,
  });

  const backendApplications = applicationsQuery.data ?? [];
  console.log(backendApplications);
  const applications = useMemo((): Application[] => {
    return backendApplications.map((app) => {
      const job = app.jobId;
      const statusMap: Record<string, Application["status"]> = {
        pending: "Reviewing",
        reviewing: "Reviewing",
        shortlisted: "Shortlisted",
        hired: "Offered",
        rejected: "Rejected",
      };

      return {
        id: app._id,
        jobTitle: job?.title || "Unknown Job",
        company: "HireLens",
        location: job?.locationType === "remote" ? "Remote" : "Rwanda",
        type: job?.jobType ? (job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)) as any : "Full-time",
        appliedDate: new Date(app.createdAt).toLocaleDateString(),
        status: statusMap[app.status] || "Reviewing",
      };
    });
  }, [backendApplications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.company.toLowerCase().includes(searchQuery.toLowerCase());

      const isActive = ["Reviewing", "Shortlisted", "Interviewing"].includes(
        app.status,
      );
      const isPast = ["Rejected", "Offered"].includes(app.status);

      if (activeTab === "Active") return matchesSearch && isActive;
      if (activeTab === "Past") return matchesSearch && isPast;
      return matchesSearch;
    });
  }, [searchQuery, activeTab, applications]);

  const stats = useMemo(() => ({
    total: applications.length,
    active: applications.filter((a) =>
      ["Reviewing", "Shortlisted", "Interviewing"].includes(a.status),
    ).length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    rejected: applications.filter((a) => a.status === "Rejected").length,
  }), [applications]);

  const handleApplicationClick = (id: string) => {
    const app = applications.find((a) => a.id === id);
    if (app) {
      setSelectedApplication(app);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2">
      <phantom-ui loading={applicationsQuery.isLoading}>
      <div className="mx-auto space-y-6">
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-[#25324B] tracking-tight">
              My Applications
            </h1>
            <p className="text-lg font-semibold text-[#7C8493] mt-2">
              Track your progress and upcoming interviews
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1.5 rounded-[10px] shadow-sm border border-gray-50">
              {(["All", "Active", "Past"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-1.5 rounded-[10px] text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-[#087F5B] text-white shadow-md shadow-green-100"
                      : "text-[#7C8493] hover:text-[#087F5B] hover:bg-green-50/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 bg-white border border-gray-100 rounded-[10px] shadow-none flex items-center gap-5">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#087F5B]">
              <LayoutList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Total
              </p>
              <p className="text-2xl font-black text-[#25324B]">
                {stats.total}
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-[10px] shadow-none flex items-center gap-5">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Active
              </p>
              <p className="text-2xl font-black text-[#25324B]">
                {stats.active}
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-[10px] shadow-none flex items-center gap-5">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Shortlisted
              </p>
              <p className="text-2xl font-black text-[#25324B]">
                {stats.shortlisted}
              </p>
            </div>
          </Card>
          <Card className="p-6 bg-white border border-gray-100 rounded-[10px] shadow-none flex items-center gap-5">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Rejected
              </p>
              <p className="text-2xl font-black text-[#25324B]">
                {stats.rejected}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Search Content */}
        <div className="space-y-6">
          <Card className="p-3 bg-white border border-gray-100 rounded-[10px] shadow-none">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#087F5B] transition-colors" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                className="w-full pl-12 pr-6 py-3 bg-[#F8FAFC] rounded-[8px] border-none outline-none focus:ring-2 focus:ring-[#087F5B] font-semibold text-[#25324B] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={handleApplicationClick}
                />
              ))
            ) : (
              <div className="py-20 text-center bg-white rounded-[10px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <LayoutList className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-[#25324B]">
                  No applications found
                </h3>
                <p className="text-gray-500 mt-2">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "You haven't applied to any jobs yet"}
                </p>
              </div>
            )}
          </div>
        </div>

            
        {selectedApplication && (
          <ApplicationDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            application={selectedApplication}
          />
        )}
      </div>
      </phantom-ui>
    </div>
  );
}
