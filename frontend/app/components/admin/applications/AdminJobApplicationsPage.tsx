"use client";

import { useState } from "react";
import { ArrowLeft, Search, Filter, Download, Loader2, Users, Eye, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AdminApplicationsTable, {
  type AdminApplicationRow,
} from "@/app/components/admin/applications/AdminApplicationsTable";
import AdminApplicationDetailModal from "@/app/components/admin/applications/AdminApplicationDetailModal";
import { api } from "@/lib/api/client";

type BackendApplication = {
  _id: string;
  jobId: string;
  talentId: string;
  status: AdminApplicationRow["status"];
  coverLetter?: string;
  resumeUrl: string;
  cvUrl?: string;
  phoneNumber?: string;
  location?: string;
  skills?: { name: string; level: string; yearsOfExperience: number }[];
  experience?: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    technologies: string[];
    isCurrent: boolean;
  }[];
  education?: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    issueDate: string;
  }[];
  createdAt: string;
};

type BackendTalent = {
  _id: string;
  headline: string;
  location: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
    picture?: string;
  };
};

type BackendJob = {
  _id: string;
  title: string;
};

export default function AdminJobApplicationsPage({ jobId }: { jobId: string }) {
  const [query, setQuery] = useState("");
  const [selectedApplication, setSelectedApplication] =
    useState<AdminApplicationRow | null>(null);
  const [selectedTalentIds, setSelectedTalentIds] = useState<string[]>([]);
  const router = useRouter();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      await api.put(`/applications/${appId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "job", jobId, "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const jobQuery = useQuery({
    queryKey: ["admin", "job", jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data?.job as BackendJob;
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin", "job", jobId, "applications"],
    queryFn: async () => {
      const res = await api.get(`/applications/job/${jobId}`);
      const apps = res.data?.applications as BackendApplication[];

      const candidates: AdminApplicationRow[] = await Promise.all(
        apps.map(async (app) => {
          const talentRes = await api.get(`/talents/${app.talentId}`);
          const talent = talentRes.data?.fetchedTalent as BackendTalent;

          return {
            id: app._id,
            talentId: app.talentId,
            talentName: `${talent.userId.firstName} ${talent.userId.lastName}`,
            talentAvatar: talent.userId.picture,
            talentHeadline: talent.headline,
            talentLocation: talent.location,
            status: app.status,
            appliedDate: new Date(app.createdAt).toISOString().split("T")[0],
            resumeUrl: app.resumeUrl,
            coverLetter: app.coverLetter,
            cvUrl: app.cvUrl,
            phoneNumber: app.phoneNumber,
            location: app.location,
            skills: app.skills,
            experience: app.experience,
            education: app.education,
            certifications: app.certifications,
          };
        }),
      );

      return candidates;
    },
  });

  const isLoading = jobQuery.isLoading || applicationsQuery.isLoading;
  const applications = applicationsQuery.data || [];

  const filteredApplications = (applications || []).filter(
    (app) =>
      app.talentName.toLowerCase().includes(query.toLowerCase()) ||
      app.talentHeadline.toLowerCase().includes(query.toLowerCase()),
  );

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleStatusChange = (appId: string, status: string) => {
    statusMutation.mutate({ appId, status });
  };

  const selectedCount = selectedTalentIds.length;
  const canCompare = selectedCount === 2;
  const selectedNames = selectedTalentIds
    .map(
      (id) => filteredApplications.find((a) => a.talentId === id)?.talentName,
    )
    .filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href={`/admin/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#087F5B] hover:underline mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job Details
          </Link>
          <h1 className="text-2xl font-bold text-[#25324B]">Applications</h1>
          <p className="text-sm text-[#7C8493]">
            Managing candidates for{" "}
            <span className="font-semibold text-[#25324B]">
              {jobQuery.data?.title || "..."}
            </span>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Export All
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or headline..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={!canCompare}
            onClick={() => {
              if (selectedTalentIds.length !== 2) return;
              const [a, b] = selectedTalentIds;
              router.push(
                `/admin/jobs/${jobId}/applications/compare?a=${encodeURIComponent(
                  a,
                )}&b=${encodeURIComponent(b)}`,
              );
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
              canCompare
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
            title={
              canCompare
                ? `Compare ${selectedNames[0] ?? ""} vs ${
                    selectedNames[1] ?? ""
                  }`
                : "Select exactly 2 applicants to compare"
            }
          >
            Vs
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 text-gray-400" />
            Filters
          </button>
          <div className="h-8 w-px bg-gray-100 hidden md:block" />
          <p className="text-sm font-medium text-[#25324B]">
            {filteredApplications.length} Candidates
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {!isLoading && applications.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Users, color: "text-[#25324B]", bg: "bg-gray-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-gray-600", bg: "bg-gray-50" },
            { label: "Reviewing", value: stats.reviewing, icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Shortlisted", value: stats.shortlisted, icon: Star, color: "text-green-600", bg: "bg-green-50" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-100 p-4 flex items-center gap-3`}>
              <div className={`p-2 rounded-lg bg-white`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-[#25324B]">{s.value}</p>
                <p className="text-xs font-medium text-[#7C8493]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-gray-200 bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm text-[#7C8493]">Loading applications...</p>
        </div>
      ) : (
        <AdminApplicationsTable
          rows={filteredApplications}
          onViewDetails={(app) => setSelectedApplication(app)}
          selectedTalentIds={selectedTalentIds}
          onToggleSelect={(talentId) => {
            setSelectedTalentIds((prev) => {
              if (prev.includes(talentId))
                return prev.filter((x) => x !== talentId);
              if (prev.length >= 2) return prev;
              return [...prev, talentId];
            });
          }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Detail Modal */}
      <AdminApplicationDetailModal
        application={selectedApplication}
        allApplications={filteredApplications}
        onClose={() => setSelectedApplication(null)}
        onNavigate={(app) => setSelectedApplication(app)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
