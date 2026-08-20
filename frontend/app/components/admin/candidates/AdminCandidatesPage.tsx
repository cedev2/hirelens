"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import TalentExportButton from "./export/TalentExportButton";
import type { ExportTalent } from "./export/talentExportUtils";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import AdminApplicationDetailModal from "@/app/components/admin/applications/AdminApplicationDetailModal";
import type { AdminApplicationRow } from "@/app/components/admin/applications/AdminApplicationsTable";
import { api } from "@/lib/api/client";

export type AdminCandidateRow = {
  id: string;
  talentId: string;
  name: string;
  headline: string;
  location: string;
  skills: string[];
  experience: string;
  education: string;
  availability: "Available" | "Open" | "Not Available";
  email: string;
  phone: string;
  socialLinks?: string[];
};

type BackendTalent = {
  _id: string;
  headline: string;
  location: string;
  skills: { name: string }[];
  experience: any[];
  education: any[];
  availability?: { status?: "Available" | "Open" | "Not Available" };
  socialLinks?: string[];
  userId?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

function formatExperience(value: BackendTalent["experience"]) {
  const n = Array.isArray(value) ? value.length : 0;
  if (n <= 0) return "-";
  if (n === 1) return "1 years";
  return `${n} years`;
}

function formatEducation(value: BackendTalent["education"]) {
  const n = Array.isArray(value) ? value.length : 0;
  if (n <= 0) return "HireLens";
  const latest = value[n - 1] as any;
  const degree = String(latest?.degree ?? "").trim();
  const field = String(latest?.fieldOfStudy ?? "").trim();
  if (degree && field) return `${degree} • ${field}`;
  return degree || field || "HireLens";
}

export default function AdminCandidatesPage() {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [query, setQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] =
    useState<AdminCandidateRow | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const talentsQuery = useQuery({
    queryKey: ["admin", "talents"],
    queryFn: async () => {
      const res = await api.get("/talents");
      const talents = (res.data?.talents ?? []) as BackendTalent[];
      return Array.isArray(talents) ? talents : [];
    },
    staleTime: 30_000,
  });

  const candidates = useMemo((): AdminCandidateRow[] => {
    const talents = talentsQuery.data ?? [];
    return talents.map((t) => {
      const firstName = String(
        t?.userId?.firstName ?? t?.firstName ?? "",
      ).trim();
      const lastName = String(t?.userId?.lastName ?? t?.lastName ?? "").trim();
      const name = `${firstName} ${lastName}`.trim() || "Unnamed talent";

      const skills = Array.isArray(t?.skills)
        ? t.skills
            .map((s) => String(s?.name ?? "").trim())
            .filter(Boolean)
            .slice(0, 6)
        : [];

      const availability =
        t?.availability?.status ??
        ("Open" as AdminCandidateRow["availability"]);

      return {
        id: t._id,
        talentId: t._id,
        name,
        headline: String(t?.headline ?? ""),
        location: String(t?.location ?? ""),
        skills,
        experience: formatExperience(t?.experience),
        education: formatEducation(t?.education),
        availability,
        email: String(t?.userId?.email ?? t?.email ?? ""),
        phone: String(t?.userId?.phone ?? t?.phone ?? ""),
        socialLinks: Array.isArray(t?.socialLinks) ? t.socialLinks : [],
      };
    });
  }, [talentsQuery.data]);

  const filtered = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.headline.toLowerCase().includes(query.toLowerCase()),
      ),
    [candidates, query],
  );

  const columns = useMemo<ColumnDef<AdminCandidateRow>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-[#25324B]">
              {row.original.name}
            </p>
            <p className="text-xs text-[#7C8493]">{row.original.headline}</p>
          </div>
        ),
      },
      {
        header: "Location",
        accessorKey: "location",
        cell: ({ row }) => (
          <span className="text-sm text-[#7C8493]">
            {row.original.location}
          </span>
        ),
      },
      {
        header: "Experience",
        accessorKey: "experience",
        cell: ({ row }) => (
          <span className="text-sm text-[#7C8493]">
            {row.original.experience}
          </span>
        ),
      },
      {
        header: "Education",
        accessorKey: "education",
        cell: ({ row }) => (
          <span className="text-sm text-[#7C8493]">
            {row.original.education}
          </span>
        ),
      },
      {
        header: "Availability",
        accessorKey: "availability",
        cell: ({ row }) => {
          const val = row.original.availability;
          const color =
            val === "Available"
              ? "bg-green-50 border-green-200 text-green-700"
              : val === "Open"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-gray-50 border-gray-200 text-gray-700";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${color}`}
            >
              {val}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedCandidate(row.original)}
              className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
              title="View Profile"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  const isLoading = talentsQuery.isLoading;
  const errorMessage = (talentsQuery.error as any)?.message || null;

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load candidates. {errorMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#25324B]">Candidates</h1>
          <p className="text-sm text-[#7C8493]">
            Browse and manage all registered talents
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-1">
          <button
            onClick={() => setViewMode("cards")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "cards"
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-[#7C8493] hover:bg-gray-50"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "table"
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-[#7C8493] hover:bg-gray-50"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates by name or role..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-[#25324B]">
            {filtered.length} Candidates Found
          </p>

          <div className="h-8 w-px bg-gray-100 hidden md:block" />

          <TalentExportButton
            talents={filtered.map(
              (c): ExportTalent => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                headline: c.headline,
                location: c.location,
                skills: c.skills,
                experience: c.experience,
                education: c.education,
                availability: c.availability,
                socialLinks: c.socialLinks || [],
              }),
            )}
            disabled={isLoading}
          />
          <button className="items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50 transition-colors hidden">
            <Filter className="h-4 w-4 text-gray-400" />
            Advanced Filter
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-gray-200 bg-white py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-sm text-[#7C8493]">Loading candidates...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border border-gray-200 bg-white py-20">
          <p className="text-sm font-semibold text-[#25324B]">
            No candidates found
          </p>
          <p className="text-xs text-[#7C8493] mt-1">
            Try adjusting your search query.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((candidate) => (
            <div
              key={candidate.id}
              className="group flex flex-col rounded-[10px] border border-gray-200 bg-white p-6 transition-all hover:border-indigo-100 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-lg border border-indigo-100 uppercase">
                  {candidate.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <a
                    href={
                      candidate.socialLinks?.find((l) =>
                        l.includes("linkedin"),
                      ) ?? "#"
                    }
                    target={
                      candidate.socialLinks?.some((l) => l.includes("linkedin"))
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      candidate.socialLinks?.some((l) => l.includes("linkedin"))
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="h-8 w-8 rounded-lg border border-gray-100 flex items-center justify-center text-[#7C8493] hover:text-[#0A66C2] hover:bg-indigo-50 hover:border-indigo-100 transition-colors"
                  >
                    <FaLinkedin className="h-4 w-4" />
                  </a>
                  <a
                    href={
                      candidate.socialLinks?.find((l) =>
                        l.includes("github"),
                      ) ?? "#"
                    }
                    target={
                      candidate.socialLinks?.some((l) => l.includes("github"))
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      candidate.socialLinks?.some((l) => l.includes("github"))
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="h-8 w-8 rounded-lg border border-gray-100 flex items-center justify-center text-[#7C8493] hover:text-[#181717] hover:bg-gray-50 hover:border-gray-200 transition-colors"
                  >
                    <FaGithub className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-[#25324B] group-hover:text-indigo-600 transition-colors">
                  {candidate.name}
                </h3>
                <p className="text-sm text-[#7C8493]">{candidate.headline}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1 text-xs text-[#25324B]">
                  <MapPin className="h-3.5 w-3.5 text-[#7C8493]" />
                  {candidate.location}
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50/50 px-2.5 py-1 text-xs text-[#25324B]">
                  <Briefcase className="h-3.5 w-3.5 text-[#7C8493]" />
                  {candidate.experience}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills.map((skill) => (
                    <span
                      key={`${skill} ${Math.random()}`}
                      className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-600 border border-indigo-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 flex items-center justify-between border-t border-gray-50">
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="block w-full rounded-xl bg-[#E8F7F0] px-4 py-2 text-center text-sm font-semibold text-[#087F5B] hover:bg-[#E8EAFF]"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8F8FD] border-b border-gray-200">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((header) => {
                      const sorted = header.column.getIsSorted();
                      return (
                        <th key={header.id} className="px-6 py-4">
                          <div
                            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7C8493] ${
                              header.column.getCanSort()
                                ? "cursor-pointer select-none"
                                : ""
                            } ${header.id === "actions" ? "justify-end" : ""}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {sorted === "asc" && (
                              <ArrowUp className="h-3 w-3" />
                            )}
                            {sorted === "desc" && (
                              <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#F8F8FD]/50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
            <p className="text-sm text-[#7C8493]">
              Showing{" "}
              <span className="font-semibold text-[#25324B]">
                {table.getRowModel().rows.length}
              </span>{" "}
              candidates
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedCandidate && (
        <AdminApplicationDetailModal
          application={
            {
              id: selectedCandidate.id,
              talentId: selectedCandidate.talentId,
              talentName: selectedCandidate.name,
              talentHeadline: selectedCandidate.headline,
              talentLocation: selectedCandidate.location,
              status: "pending", // Dummy status for modal compatibility
              appliedDate: "",
              resumeUrl: "#",
              coverLetter: "",
            } as AdminApplicationRow
          }
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
