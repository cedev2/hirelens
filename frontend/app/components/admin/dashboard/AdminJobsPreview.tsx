"use client";

import { Briefcase, CalendarDays, MapPin, Users } from "lucide-react";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  status: "Open" | "Closed";
  postedAtLabel: string;
  applicants: number;
};

function statusClasses(status: Job["status"]) {
  if (status === "Open") return "bg-green-100 text-green-700 border-green-200";
  return "bg-gray-100 text-gray-700 border-gray-200";
}

function typeClasses(type: Job["type"]) {
  if (type === "Full-time") return "bg-green-50 text-green-700 border-green-100";
  if (type === "Part-time") return "bg-purple-50 text-purple-700 border-purple-100";
  if (type === "Contract") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-pink-50 text-pink-700 border-pink-100";
}

export default function AdminJobsPreview({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[#25324B]">Recent Jobs</p>
          <p className="text-sm text-[#7C8493]">Quick snapshot of active roles</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#25324B]">
          <Briefcase className="h-4 w-4 text-[#7C8493]" />
          Showing {jobs.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="rounded-[10px] border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#25324B]">
                  {job.title}
                </p>
                <p className="truncate text-xs text-[#7C8493]">{job.company}</p>
              </div>

              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(job.status)}`}
              >
                {job.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${typeClasses(job.type)}`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                {job.type}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#25324B]">
                <MapPin className="h-3.5 w-3.5 text-[#7C8493]" />
                {job.location}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs min-w-0">
              <div className="rounded-xl border border-gray-100 bg-[#F8F8FD] p-3">
                <div className="flex items-center gap-2 text-[#7C8493]">
                  <Users className="h-4 w-4" />
                  Applicants
                </div>
                <p className="mt-1 text-sm font-bold text-[#25324B]">
                  {job.applicants}
                </p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#F8F8FD] p-3">
                <div className="flex items-center gap-2 text-[#7C8493]">
                  <CalendarDays className="h-4 w-4" />
                  Posted
                </div>
                <p className="mt-1 text-sm font-bold text-[#25324B]">
                  {job.postedAtLabel}
                </p>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl bg-[#E8F7F0] px-4 py-2 text-sm font-semibold text-[#087F5B] hover:bg-[#E8EAFF]">
              View job details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
