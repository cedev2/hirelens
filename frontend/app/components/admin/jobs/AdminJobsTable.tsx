"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import AdminJobActionsMenu from "@/app/components/admin/jobs/AdminJobActionsMenu";

export type AdminJobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  status: "Open" | "Closed" | "Draft";
  postedAt: string;
  deadline: string;
  applicants: number;
};

export type SortKey = keyof Pick<
  AdminJobRow,
  | "title"
  | "status"
  | "postedAt"
  | "deadline"
  | "applicants"
>;

export default function AdminJobsTable({
  rows,
  sort,
  onSort,
  page,
  pageSize,
  total,
  onPrev,
  onNext,
  onRowAction,
}: {
  rows: AdminJobRow[];
  sort: { key: SortKey; direction: "asc" | "desc" };
  onSort: (key: SortKey) => void;
  page: number;
  pageSize: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onRowAction: (
    action: "view" | "edit" | "close" | "open" | "delete",
    row: AdminJobRow,
  ) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = ((): ColumnDef<AdminJobRow, unknown>[] => {
    const base: ColumnDef<AdminJobRow, unknown>[] = [
      {
        header: "Job",
        accessorKey: "title",
        meta: { sortKey: "title" satisfies SortKey },
        cell: ({ row }) => (
          <div className="min-w-0">
            <Link
              href={`/admin/jobs/${row.original.id}`}
              className="truncate text-sm font-semibold text-[#111827] hover:underline"
            >
              {row.original.title}
            </Link>
            <p className="truncate text-xs text-[#6B7280]">
              {row.original.company} • {row.original.location} • {row.original.type}
            </p>
          </div>
        ),
      },
      {
        header: "Status",
        accessorKey: "status",
        meta: { sortKey: "status" satisfies SortKey },
        cell: ({ row }) => (
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              row.original.status === "Open"
                ? "border-green-200 bg-green-100 text-green-700"
                : row.original.status === "Closed"
                  ? "border-gray-200 bg-gray-100 text-gray-700"
                  : "border-amber-200 bg-amber-100 text-amber-700"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        header: "Posted",
        accessorKey: "postedAt",
        meta: { sortKey: "postedAt" satisfies SortKey },
        cell: ({ row }) => (
          <p className="whitespace-nowrap text-sm text-[#111827]">{row.original.postedAt}</p>
        ),
      },
      {
        header: "Deadline",
        accessorKey: "deadline",
        meta: { sortKey: "deadline" satisfies SortKey },
        cell: ({ row }) => (
          <p className="whitespace-nowrap text-sm text-[#111827]">{row.original.deadline}</p>
        ),
      },
      {
        header: () => <div className="text-right">Applicants</div>,
        accessorKey: "applicants",
        meta: { sortKey: "applicants" satisfies SortKey },
        cell: ({ row }) => (
          <p className="text-right text-sm font-semibold text-[#111827]">
            {row.original.applicants}
          </p>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <AdminJobActionsMenu row={row.original} onAction={onRowAction} />
          </div>
        ),
      },
    ];

    return base;
  })();

  const sorting: SortingState = [
    { id: sort.key, desc: sort.direction === "desc" },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
      pagination: { pageIndex: page, pageSize },
    },
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-gray-100">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const meta = header.column.columnDef.meta as
                    | { sortKey?: SortKey }
                    | undefined;
                  const sortKey = meta?.sortKey;

                  const sorted =
                    sortKey && sort.key === sortKey ? sort.direction : false;

                  return (
                    <th key={header.id} className="px-6 py-4">
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 text-xs font-semibold ${
                            canSort
                              ? "cursor-pointer select-none text-[#6B7280] hover:text-[#111827]"
                              : "text-[#6B7280]"
                          } ${
                            header.column.id === "applicants" ||
                            header.column.id === "actions"
                              ? "justify-end"
                              : ""
                          }`}
                          onClick={
                            canSort && sortKey
                              ? () => onSort(sortKey)
                              : undefined
                          }
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sorted === "asc" && (
                            <ArrowUp className="h-3.5 w-3.5" />
                          )}
                          {sorted === "desc" && (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-[#F9FAFB]"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-[#111827]">
                    No jobs found
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Try adjusting your search or filters.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#6B7280]">
          Page <span className="font-semibold text-[#111827]">{page + 1}</span>{" "}
          of <span className="font-semibold text-[#111827]">{totalPages}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrev}
            disabled={page === 0}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={page + 1 >= totalPages}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
