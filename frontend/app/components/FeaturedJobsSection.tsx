"use client";

import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { stripHtmlToText } from "./SafeHtml";
import Link from "next/link";

type ApiJob = {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  deadline?: string;
  jobType: string;
  locationType: string;
  status: "open" | "closed" | "draft";
};

const tagColors = [
  "bg-orange-100 text-orange-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-red-100 text-red-600",
];

export default function FeaturedJobsSection() {
  const jobsQuery = useQuery({
    queryKey: ["jobs", "featured"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as ApiJob[];
    },
    staleTime: 60_000,
  });

  const featuredJobs = (jobsQuery.data ?? [])
    .filter((j) => j.status === "open")
    .slice(0, 8);

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-[122px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#25324B]">
            Active <span className="text-[#087F5B]">Job Postings</span>
          </h2>
          <a
            href="/admin/jobs"
            className="flex items-center gap-2 text-sm font-medium text-[#4F46E5] hover:text-[#4338CA]"
          >
            Manage all jobs
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {jobsQuery.isLoading ? (
            <div className="col-span-full py-12 text-center text-sm font-semibold text-gray-500">
              Loading jobs...
            </div>
          ) : jobsQuery.isError ? (
            <div className="col-span-full py-12 text-center text-sm font-semibold text-red-600">
              Failed to load jobs
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="col-span-full py-12 text-center text-sm font-semibold text-gray-500">
              No active job postings.{" "}
              <Link
                href="/admin/jobs"
                className="text-[#087F5B] hover:underline"
              >
                Create your first job posting
              </Link>
            </div>
          ) : (
            featuredJobs.map((job) => (
              <div
                key={job._id}
                className="p-6 border border-gray-100 hover:border-[#087F5B] hover:shadow-md transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-end mb-4">
                  <span className="px-3 py-1 text-xs font-medium text-[#4F46E5] border border-[#4F46E5] rounded">
                    {job.jobType}
                  </span>
                </div>

                {/* Job Info */}
                <h3 className="text-lg font-semibold text-[#25324B] mb-1">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{job.locationType}</p>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {stripHtmlToText(job.description)}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {(job.requirements ?? []).slice(0, 2).map((req, idx) => (
                    <span
                      key={`${job._id}_${idx}`}
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        tagColors[idx % tagColors.length]
                      }`}
                    >
                      {req}
                    </span>
                  ))}
                </div>

                {/* Apply Button */}
                <Link
                  href={`/applicant/jobs/${job._id}`}
                  className="block w-full rounded-xl bg-[#087F5B] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#066B4D] transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
