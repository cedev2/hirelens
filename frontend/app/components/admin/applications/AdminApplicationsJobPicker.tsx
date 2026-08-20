"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Briefcase,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type JobSummary = {
  id: string;
  title: string;
  company: string;
  applicants: number;
  status: "Open" | "Closed" | "Draft";
  postedAt: string;
};

type BackendJob = {
  _id: string;
  title: string;
  status: "open" | "closed" | "draft";
  createdAt: string;
};

type BackendApplication = {
  _id: string;
  jobId: string;
};

export default function AdminApplicationsJobPicker() {
  const [query, setQuery] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["admin", "jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as BackendJob[];
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const res = await api.get("/applications");
      return (res.data?.applications ?? []) as BackendApplication[];
    },
  });

  const isLoading = jobsQuery.isLoading || applicationsQuery.isLoading;

  const jobs = useMemo((): JobSummary[] => {
    const rawJobs = jobsQuery.data || [];
    const rawApps = applicationsQuery.data || [];

    const counts = new Map<string, number>();
    for (const app of rawApps) {
      counts.set(app.jobId, (counts.get(app.jobId) ?? 0) + 1);
    }

    return rawJobs.map((j) => ({
      id: j._id,
      title: j.title,
      company: "HireLens",
      applicants: counts.get(j._id) ?? 0,
      status:
        j.status === "open"
          ? "Open"
          : j.status === "closed"
            ? "Closed"
            : "Draft",
      postedAt: new Date(j.createdAt).toLocaleDateString(),
    }));
  }, [jobsQuery.data, applicationsQuery.data]);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(query.toLowerCase()) ||
      j.company.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#25324B]">Applications</h1>
        <p className="text-sm text-[#7C8493]">
          Select a job to manage its candidates
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[10px] border border-gray-200 bg-white">
            <Loader2 className="h-8 w-8 animate-spin text-[#087F5B] mb-2" />
            <p className="text-sm text-[#7C8493]">Loading jobs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[10px] border border-gray-200 bg-white">
            <p className="text-sm font-semibold text-[#25324B]">
              No jobs found
            </p>
            <p className="text-xs text-[#7C8493] mt-1">
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          filtered.map((job) => (
            <Link
              key={job.id}
              href={`/admin/jobs/${job.id}/applications`}
              className="group block rounded-[10px] border border-gray-200 bg-white p-5 transition-all hover:border-[#087F5B] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-[#25324B] group-hover:text-[#087F5B]">
                    {job.title}
                  </p>
                  <p className="text-sm text-[#7C8493]">{job.company}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    job.status === "Open"
                      ? "bg-green-100 text-green-700"
                      : job.status === "Closed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#25324B]">
                    <Users className="h-4 w-4 text-[#7C8493]" />
                    {job.applicants}
                  </div>
                  <div className="text-xs text-[#7C8493]">
                    Posted {job.postedAt}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-[#087F5B]" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
