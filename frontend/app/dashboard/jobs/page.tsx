"use client";

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/Card";
import JobCard, { Job } from "./components/JobCard";
import JobDetailsModal from "./components/JobDetailsModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";

type BackendJob = {
  _id: string;
  title: string;
  description: string;
  locationType: string;
  jobType: string;
  deadline: string;
  createdAt: string;
  salary?: { amount: number; currency: string };
  requirements: string[];
};

type BackendApplication = {
  _id: string;
  jobId: string;
  talentId: string;
  status: string;
  createdAt: string;
};

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewType, setViewType] = useState<"grid" | "list">("list");

  const talentQuery = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
  });

  const talentId = talentQuery.data?._id;

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as BackendJob[];
    },
    staleTime: 60_000,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications", talentId],
    queryFn: async () => {
      const res = await api.get(`/applications/talent/${talentId}`);
      return (res.data?.applications ?? []) as BackendApplication[];
    },
    enabled: !!talentId,
    staleTime: 30_000,
  });

  const backendJobs = jobsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  const jobs = useMemo((): Job[] => {
    return backendJobs.map((j) => {
      const hasApplied = applications.some((app) => app.jobId === j._id);

      const salaryStr = j.salary
        ? `${j.salary.currency} ${j.salary.amount.toLocaleString()}`
        : "Competitive";

      return {
        id: j._id,
        title: j.title,
        company: "HireLens",
        location: j.locationType === "remote" ? "Remote" : "Rwanda",
        type: (j.jobType.charAt(0).toUpperCase() + j.jobType.slice(1)) as any,
        salary: salaryStr,
        postedAt: new Date(j.createdAt).toLocaleDateString(),
        description: j.description,
        tags: j.requirements || [],
        status: hasApplied ? "Applied" : "Open",
      };
    });
  }, [backendJobs, applications]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
  }, [searchQuery, jobs]);

  const handleJobClick = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const handleApply = (id: string) => {
    router.push(`/applicant/jobs/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-2">
      <phantom-ui loading={jobsQuery.isLoading}>
        <div className="mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-[#111827] tracking-tight">
                Available Jobs
              </h1>
              <p className="text-lg font-semibold text-[#6B7280] mt-2">
                Find your next big opportunity today
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="p-4 bg-white border border-gray-100 rounded-[10px] shadow-none">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#087F5B] transition-colors" />
                <input
                  type="text"
                  placeholder="Search job titles, companies, or skills..."
                  className="w-full pl-14 pr-6 py-4 bg-[#F8FAFC] rounded-[10px] border-none outline-none focus:ring-2 focus:ring-[#087F5B] font-semibold text-[#111827] transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full lg:w-auto">
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-5 py-3 bg-white border-2 border-gray-100 rounded-[10px] font-bold text-[#111827] hover:border-[#087F5B] hover:text-[#087F5B] transition-all uppercase tracking-widest text-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-5 py-3 bg-[#087F5B] text-white rounded-[10px] font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:bg-[#066B4D] transition-all">
                  Search
                </button>
              </div>
            </div>
          </Card>

          {/* Jobs Grid/List */}
          <div
            className={
              viewType === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "grid grid-cols-1 lg:grid-cols-2 gap-4"
            }
          >
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={handleJobClick} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-white rounded-[10px] border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-black text-[#111827]">
                  No jobs found
                </h3>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search filters
                </p>
              </div>
            )}
          </div>

          {selectedJob && (
            <JobDetailsModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              job={selectedJob}
              onApply={handleApply}
            />
          )}
        </div>
      </phantom-ui>
    </div>
  );
}
