"use client";

import Link from "next/link";
import {
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminJobsToolbar({
  query,
  onQuery,
  status,
  onStatus,
  type,
  onType,
  viewMode,
  onViewMode,
  pageSize,
  onPageSize,
  totalLabel,
}: {
  query: string;
  onQuery: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  type: string;
  onType: (v: string) => void;
  viewMode: "table" | "cards";
  onViewMode: (v: "table" | "cards") => void;
  pageSize: number;
  onPageSize: (n: number) => void;
  totalLabel: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xl font-semibold text-[#25324B]">Jobs</p>
          <p className="text-sm text-[#7C8493]">
            Manage job posts, status, and performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#087F5B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#066B4D]"
          >
            <Plus className="h-4 w-4" />
            Create Job
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto_auto] lg:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search title, company..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#087F5B]"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={status}
            onChange={(e) => onStatus(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[#25324B] outline-none"
          >
            <option value="all">All status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-400" />
          <select
            value={type}
            onChange={(e) => onType(e.target.value)}
            className="bg-transparent text-sm font-semibold text-[#25324B] outline-none"
          >
            <option value="all">All types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <span className="text-sm font-semibold text-[#7C8493]">Rows</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSize(Number(e.target.value))}
            className="bg-transparent text-sm font-semibold text-[#25324B] outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2">
          <span className="text-sm font-semibold text-[#25324B]">
            {totalLabel}
          </span>
          <div className="flex items-center gap-1 rounded-lg bg-[#F8F8FD] p-1">
            <button
              type="button"
              onClick={() => onViewMode("table")}
              className={`rounded-md p-2 transition-colors ${
                viewMode === "table"
                  ? "bg-white shadow-sm"
                  : "hover:bg-white/70"
              }`}
              aria-label="Table view"
            >
              <List className="h-4 w-4 text-[#25324B]" />
            </button>
            <button
              type="button"
              onClick={() => onViewMode("cards")}
              className={`rounded-md p-2 transition-colors ${
                viewMode === "cards"
                  ? "bg-white shadow-sm"
                  : "hover:bg-white/70"
              }`}
              aria-label="Card view"
            >
              <LayoutGrid className="h-4 w-4 text-[#25324B]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
