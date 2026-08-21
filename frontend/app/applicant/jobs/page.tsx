"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import Link from "next/link";
import { MapPin, Clock, DollarSign, ArrowRight, Search } from "lucide-react";
import { useState } from "react";

type Job = {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  jobType: string;
  locationType: string;
  status: string;
  salary?: { amount: number; currency: string };
  benefits?: string[];
  deadline?: string;
};

export default function JobsPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as Job[];
    },
  });

  const openJobs = jobs.filter((j) => j.status === "open");

  const filtered = openJobs.filter((job) => {
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || job.jobType === filterType;
    const matchLocation = filterLocation === "all" || job.locationType === filterLocation;
    return matchSearch && matchType && matchLocation;
  });

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#25324B]">Browse Jobs</h1>
        <p className="text-gray-500 text-sm mt-1">
          Find your next opportunity from {openJobs.length} open position{openJobs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] transition-colors"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] bg-white"
        >
          <option value="all">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
        </select>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#087F5B] bg-white"
        >
          <option value="all">All Locations</option>
          <option value="on-site">On-site</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-sm text-gray-400">Loading jobs...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No jobs match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((job) => (
            <Link
              key={job._id}
              href={`/applicant/jobs/${job._id}`}
              className="bg-white rounded-xl border border-gray-100 p-6 hover:border-[#087F5B] hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#25324B] group-hover:text-[#087F5B] transition-colors">
                  {job.title}
                </h3>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-[#087F5B] transition-colors mt-1 shrink-0" />
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {job.jobType}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {job.locationType}
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5" />
                    {job.salary.amount?.toLocaleString()} {job.salary.currency}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {job.description.replace(/<[^>]*>/g, "").slice(0, 150)}...
              </p>

              {job.requirements && job.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.slice(0, 3).map((req, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"
                    >
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-400">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
