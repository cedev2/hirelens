"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import AdminKpiCards from "@/app/components/admin/dashboard/AdminKpiCards";
import AdminJobsCards from "@/app/components/admin/jobs/AdminJobsCards";
import AdminRecentApplicationsTable from "@/app/components/admin/dashboard/AdminRecentApplicationsTable";
import AdminCandidateCompositionChart from "@/app/components/admin/charts/AdminCandidateCompositionChart";
import AdminJobStatisticsChart from "@/app/components/admin/charts/AdminJobStatisticsChart";
import { api } from "@/lib/api/client";
import type { AdminJobRow } from "@/app/components/admin/jobs/AdminJobsTable";

type BackendJob = {
  _id?: string;
  id?: string;
  title?: string;
  jobType?: string;
  locationType?: string;
  deadline?: string | Date;
  status?: "open" | "closed" | "draft";
  createdAt?: string;
};

type BackendApplication = {
  _id?: string;
  jobId?: string;
  talentId?: string;
  status?: string;
  createdAt?: string;
};

function formatDate(value: string | Date | undefined) {
  if (!value) return "HireLens";
  const dt = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(dt.getTime())) return "HireLens";
  return dt.toISOString().slice(0, 10);
}

function mapJobType(jobType: string | undefined): AdminJobRow["type"] {
  if (jobType === "part-time") return "Part-time";
  if (jobType === "full-time") return "Full-time";
  return "Full-time";
}

function mapLocation(locationType: string | undefined) {
  if (locationType === "remote") return "Remote";
  if (locationType === "hybrid") return "Hybrid";
  if (locationType === "on-site") return "On-site";
  return "HireLens";
}

function deriveStatus(
  deadline: string | Date | undefined,
): AdminJobRow["status"] {
  if (!deadline) return "Open";
  const dt = typeof deadline === "string" ? new Date(deadline) : deadline;
  if (Number.isNaN(dt.getTime())) return "Open";
  return dt.getTime() >= Date.now() ? "Open" : "Closed";
}

function mapStatus(
  status: BackendJob["status"],
  deadline: BackendJob["deadline"],
): AdminJobRow["status"] {
  if (status === "draft") return "Draft";
  if (status === "closed") return "Closed";
  if (status === "open") return "Open";
  return deriveStatus(deadline);
}

export default function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as BackendJob[];
    },
    staleTime: 60_000,
  });

  const talentsQuery = useQuery({
    queryKey: ["admin", "talents"],
    queryFn: async () => {
      const res = await api.get("/talents");
      return (res.data?.talents ?? []) as any[];
    },
    staleTime: 60_000,
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const res = await api.get("/applications");
      return (res.data?.applications ?? []) as BackendApplication[];
    },
    staleTime: 30_000,
  });

  const jobs = jobsQuery.data ?? [];
  const talents = talentsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  const now = Date.now();

  const kpis = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter(
      // @ts-ignore
      (j) => new Date(j.deadline).getTime() > now,
    ).length;
    const totalApplications = applications.length;
    const candidates = talents.length;
    return { totalJobs, openJobs, totalApplications, candidates };
  }, [jobs, talents, applications, now]);

  const jobRows = useMemo((): AdminJobRow[] => {
    const counts = new Map<string, number>();
    for (const app of applications) {
      const key = String(app.jobId ?? "");
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return jobs
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .map((j): AdminJobRow | null => {
        const id = String(j?._id ?? j?.id ?? "").trim();
        if (!id) return null;

        return {
          id,
          title: String(j?.title ?? "Untitled job"),
          company: "HireLens",
          location: mapLocation(j?.locationType),
          type: mapJobType(j?.jobType),
          status: mapStatus(j?.status, j?.deadline),
          postedAt: formatDate(j?.createdAt),
          deadline: formatDate(j?.deadline),
          applicants: counts.get(id) ?? 0,
          views: 0,
        };
      })
      .filter((v): v is AdminJobRow => Boolean(v));
  }, [applications, jobs, now]);

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({
      jobId,
      status,
    }: {
      jobId: string;
      status: string;
    }) => {
      const res = await api.put(`/jobs/${jobId}`, { status });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Job updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update job");
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await api.delete(`/jobs/${jobId}`);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Job deleted");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to delete job");
    },
  });

  const recentJobCards = useMemo(() => jobRows.slice(0, 6), [jobRows]);

  const recentApplicationsRows = useMemo(() => {
    const jobsById = new Map<string, any>(jobs.map((j) => [String(j._id), j]));
    const talentsById = new Map<string, any>(
      talents.map((t) => [String(t._id), t]),
    );

    return applications
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5)
      .map((app) => {
        const talent = talentsById.get(String(app.talentId));
        const user = talent?.userId;
        const job = jobsById.get(String(app.jobId));

        const name =
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
          "Unknown";
        const jobTitle = job?.title || "Unknown";
        const statusMap: Record<string, any> = {
          shortlisted: "Shortlisted",
          reviewing: "Under Review",
          rejected: "Rejected",
          pending: "Under Review",
          hired: "Shortlisted",
        };

        return {
          id: String(app._id),
          applicantName: name,
          jobTitle,
          department: "HireLens",
          experience: "HireLens",
          status: statusMap[String(app.status)] || "Under Review",
          avatar: user?.picture || "/images/companies/dummy.jpg",
        };
      });
  }, [applications, jobs, talents]);

  const jobStats = useMemo(() => {
    const applicationsBuckets = new Map<string, number>();
    for (const app of applications) {
      const d = new Date(app.createdAt || app.createdAt || Date.now());
      const label = d.toLocaleString("en-US", { month: "short" });
      applicationsBuckets.set(label, (applicationsBuckets.get(label) || 0) + 1);
    }

    const postedBuckets = new Map<string, number>();
    for (const j of jobs) {
      const d = new Date(j.createdAt || Date.now());
      const label = d.toLocaleString("en-US", { month: "short" });
      postedBuckets.set(label, (postedBuckets.get(label) || 0) + 1);
    }

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((m) => ({
      label: m,
      posted: postedBuckets.get(m) || 0,
      applications: applicationsBuckets.get(m) || 0,
    }));
  }, [applications, jobs]);

  const composition = useMemo(() => {
    const yearsForTalent = (t: any) => {
      const ex = Array.isArray(t.experience) ? t.experience : [];
      let totalMonths = 0;
      for (const e of ex) {
        const start = e?.startDate ? new Date(e.startDate).getTime() : 0;
        const end = e?.endDate ? new Date(e.endDate).getTime() : Date.now();
        if (!start) continue;
        totalMonths += Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 30));
      }
      return totalMonths / 12;
    };

    let junior = 0;
    let mid = 0;
    let senior = 0;

    for (const t of talents) {
      const years = yearsForTalent(t);
      if (years < 2) junior++;
      else if (years < 5) mid++;
      else senior++;
    }

    return [
      {
        label: "Junior",
        value: junior,
        color: "#4F46E5",
        icon: "single" as const,
      },
      {
        label: "Mid-level",
        value: mid,
        color: "#10B981",
        icon: "group" as const,
      },
      {
        label: "Senior",
        value: senior,
        color: "#F59E0B",
        icon: "single" as const,
      },
    ];
  }, [talents]);

  return (
    <phantom-ui loading={talentsQuery.isLoading}>
      <div className="space-y-6">
        <div data-tour="kpi-cards">
          <AdminKpiCards
            totalJobs={kpis.totalJobs}
            openJobs={kpis.openJobs}
            totalApplications={kpis.totalApplications}
            candidates={kpis.candidates}
          />
        </div>

        <div data-tour="job-statistics-chart">
          <AdminJobStatisticsChart data={jobStats} rangeLabel="This Month" />
        </div>

        <div
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          data-tour="recent-jobs"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-[#25324B]">
                Recent Jobs
              </p>
              <p className="text-sm text-[#7C8493]">
                Quick snapshot of active roles
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/jobs")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50"
            >
              View All
            </button>
          </div>

          <AdminJobsCards
            rows={recentJobCards}
            onAction={(action, row) => {
              if (action === "view") {
                router.push("/admin/jobs/" + row.id);
                return;
              }

              if (action === "edit") {
                router.push(`/admin/jobs/${row.id}/edit`);
                return;
              }

              if (action === "delete") {
                const ok = window.confirm(
                  "Delete this job? This cannot be undone.",
                );
                if (!ok) return;
                deleteJobMutation.mutate(row.id);
                return;
              }

              if (action === "close") {
                updateJobStatusMutation.mutate({
                  jobId: row.id,
                  status: "closed",
                });
                return;
              }

              if (action === "open") {
                updateJobStatusMutation.mutate({
                  jobId: row.id,
                  status: "open",
                });
              }
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="xl:col-span-1" data-tour="recent-applications">
            <AdminRecentApplicationsTable />
          </div>
          <div className="xl:col-span-1" data-tour="candidate-composition">
            <AdminCandidateCompositionChart
              data={composition}
              totalLabel={`${kpis.candidates} candidates total`}
            />
          </div>
        </div>
      </div>
    </phantom-ui>
  );
}
