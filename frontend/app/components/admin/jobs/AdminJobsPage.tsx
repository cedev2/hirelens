"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import AdminJobsCards from "@/app/components/admin/jobs/AdminJobsCards";
import AdminJobsTable, {
  type AdminJobRow,
  type SortKey,
} from "@/app/components/admin/jobs/AdminJobsTable";
import AdminJobsToolbar from "@/app/components/admin/jobs/AdminJobsToolbar";
import { api } from "@/lib/api/client";

type BackendJob = {
  _id?: string;
  id?: string;
  title?: string;
  jobType?: string;
  locationType?: string;
  deadline?: string | Date;
  status?: "open" | "closed" | "draft";
  createdAt?: string;
  updatedAt?: string;
};

type BackendApplication = {
  _id?: string;
  id?: string;
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

function compare(a: AdminJobRow, b: AdminJobRow, key: SortKey) {
  const va = a[key];
  const vb = b[key];

  if (typeof va === "number" && typeof vb === "number") return va - vb;
  return String(va).localeCompare(String(vb));
}

export default function AdminJobsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      const jobs = (res.data?.jobs ?? []) as BackendJob[];
      return Array.isArray(jobs) ? jobs : [];
    },
    staleTime: 30_000,
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const res = await api.get("/applications");
      const applications = (res.data?.applications ??
        []) as BackendApplication[];
      return Array.isArray(applications) ? applications : [];
    },
    staleTime: 30_000,
  });

  const rows = useMemo((): AdminJobRow[] => {
    const apps = applicationsQuery.data ?? [];
    const counts = new Map<string, number>();
    for (const app of apps) {
      const jobId = app?.jobId;
      if (!jobId) continue;
      counts.set(jobId, (counts.get(jobId) ?? 0) + 1);
    }

    const jobs = jobsQuery.data ?? [];
    return jobs
      .map((job): AdminJobRow | null => {
        const id = String(job?._id ?? job?.id ?? "").trim();
        if (!id) return null;

        const deadline = job?.deadline;

        return {
          id,
          title: String(job?.title ?? "Untitled job"),
          company: "HireLens",
          location: mapLocation(job?.locationType),
          type: mapJobType(job?.jobType),
          status: mapStatus(job?.status, deadline),
          postedAt: formatDate(job?.createdAt),
          deadline: formatDate(deadline),
          applicants: counts.get(id) ?? 0,
        };
      })
      .filter((v): v is AdminJobRow => Boolean(v));
  }, [applicationsQuery.data, jobsQuery.data]);

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
    onSuccess: async (_data, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "job", vars.jobId],
      });
      toast.success("Job updated");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update job");
    },
  });

  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>(
    { key: "postedAt", direction: "desc" },
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return rows.filter((job) => {
      const matchesQuery =
        q.length === 0 ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q);

      const matchesStatus = status === "all" || job.status === status;
      const matchesType = type === "all" || job.type === type;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [query, rows, status, type]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const diff = compare(a, b, sort.key);
      return sort.direction === "asc" ? diff : -diff;
    });
    return copy;
  }, [filtered, sort]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const total = sorted.length;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [page, safePage]);

  const handleSort = (key: SortKey) => {
    setPage(0);
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const onPrev = () => setPage((p) => Math.max(0, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const onRowAction = (
    action: "view" | "edit" | "close" | "open" | "delete",
    row: AdminJobRow,
  ) => {
    if (action === "view") {
      router.push("/admin/jobs/" + row.id);
      return;
    }

    if (action === "edit") {
      router.push(`/admin/jobs/${row.id}/edit`);
      return;
    }

    if (action === "delete") {
      const ok = window.confirm("Delete this job? This cannot be undone.");
      if (!ok) return;
      deleteJobMutation.mutate(row.id);
      return;
    }

    if (action === "close") {
      updateJobStatusMutation.mutate({ jobId: row.id, status: "closed" });
      return;
    }

    if (action === "open") {
      updateJobStatusMutation.mutate({ jobId: row.id, status: "open" });
    }
  };

  const isLoading = jobsQuery.isLoading || applicationsQuery.isLoading;
  const errorMessage =
    (jobsQuery.error as any)?.message ||
    (applicationsQuery.error as any)?.message ||
    null;

  return (
    <div className="space-y-5">
      <AdminJobsToolbar
        query={query}
        onQuery={(v) => {
          setPage(0);
          setQuery(v);
        }}
        status={status}
        onStatus={(v) => {
          setPage(0);
          setStatus(v);
        }}
        type={type}
        onType={(v) => {
          setPage(0);
          setType(v);
        }}
        viewMode={viewMode}
        onViewMode={setViewMode}
        pageSize={pageSize}
        onPageSize={(n) => {
          setPage(0);
          setPageSize(n);
        }}
        totalLabel={`${total} jobs`}
      />

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load jobs. {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm font-semibold text-[#111827]">
          Loading jobs...
        </div>
      )}

      {!isLoading && viewMode === "table" ? (
        <AdminJobsTable
          rows={paged}
          sort={sort}
          onSort={handleSort}
          page={safePage}
          pageSize={pageSize}
          total={total}
          onPrev={onPrev}
          onNext={onNext}
          onRowAction={onRowAction}
        />
      ) : !isLoading ? (
        <AdminJobsCards rows={paged} onAction={onRowAction} />
      ) : null}
    </div>
  );
}
