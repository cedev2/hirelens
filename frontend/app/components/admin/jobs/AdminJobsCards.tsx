"use client";

import Link from "next/link";
import { Briefcase, CalendarDays, Eye, MapPin, Users } from "lucide-react";
import type { AdminJobRow } from "@/app/components/admin/jobs/AdminJobsTable";
import AdminJobActionsMenu from "@/app/components/admin/jobs/AdminJobActionsMenu";

function statusClasses(status: AdminJobRow["status"]) {
  if (status === "Open") return "bg-green-100 text-green-700 border-green-200";
  if (status === "Closed") return "bg-gray-100 text-gray-700 border-gray-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}

function typeClasses(type: AdminJobRow["type"]) {
  if (type === "Full-time") return "bg-green-50 text-green-700 border-green-100";
  if (type === "Part-time")
    return "bg-purple-50 text-purple-700 border-purple-100";
  if (type === "Contract") return "bg-amber-50 text-amber-700 border-amber-100";
  return "bg-pink-50 text-pink-700 border-pink-100";
}

export default function AdminJobsCards({
  rows,
  onAction,
}: {
  rows: AdminJobRow[];
  onAction: (
    action: "view" | "edit" | "close" | "open" | "delete",
    row: AdminJobRow,
  ) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((row) => (
        <div
          key={row.id}
          className="rounded-[10px] border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#25324B]">
                {row.title}
              </p>
              <p className="truncate text-xs text-[#7C8493]">{row.company}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusClasses(row.status)}`}
              >
                {row.status}
              </span>
              <AdminJobActionsMenu row={row} onAction={onAction} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${typeClasses(row.type)}`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              {row.type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#25324B]">
              <MapPin className="h-3.5 w-3.5 text-[#7C8493]" />
              {row.location}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-100 bg-[#F8F8FD] p-3">
              <div className="flex items-center gap-2 text-xs text-[#7C8493]">
                <Users className="h-4 w-4" />
                Applicants
              </div>
              <p className="mt-1 text-sm font-bold text-[#25324B]">
                {row.applicants}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#F8F8FD] p-3">
              <div className="flex items-center gap-2 text-xs text-[#7C8493]">
                <Eye className="h-4 w-4" />
                Views
              </div>
              <p className="mt-1 text-sm font-bold text-[#25324B]">
                {row.views}
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#F8F8FD] p-3">
              <div className="flex items-center gap-2 text-xs text-[#7C8493]">
                <CalendarDays className="h-4 w-4" />
                Deadline
              </div>
              <p className="mt-1 text-sm font-bold text-[#25324B]">
                {row.deadline}
              </p>
            </div>
          </div>

          <Link
            href={`/admin/jobs/${row.id}`}
            className="mt-2 block w-full rounded-xl bg-[#E8F7F0] px-4 py-2 text-center text-sm font-semibold text-[#087F5B] hover:bg-[#E8EAFF]"
          >
            View job details
          </Link>

          <Link
            href={`/admin/jobs/${row.id}/screening`}
            className="mt-2 block w-full rounded-xl bg-[#4F46E5] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#4338CA]"
          >
            AI Screening
          </Link>
        </div>
      ))}

      {rows.length === 0 && (
        <div className="rounded-[10px] border border-gray-200 bg-white p-10 text-center text-sm text-[#7C8493] md:col-span-2 xl:col-span-3">
          No jobs found.
        </div>
      )}
    </div>
  );
}
