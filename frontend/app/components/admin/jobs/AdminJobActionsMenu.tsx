"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Lock,
  Unlock,
  Eye,
  BrainCircuit,
} from "lucide-react";

import type { AdminJobRow } from "@/app/components/admin/jobs/AdminJobsTable";

type Action = "view" | "edit" | "close" | "open" | "delete";

export default function AdminJobActionsMenu({
  row,
  onAction,
  align = "right",
}: {
  row: AdminJobRow;
  onAction: (action: Action, row: AdminJobRow) => void;
  align?: "left" | "right";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(e.target as Node)) return;
      setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const closeLabel = row.status === "Closed" ? "Reopen" : "Close";
  const closeAction: Action = row.status === "Closed" ? "open" : "close";

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-[#25324B] hover:bg-gray-50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute top-[calc(100%+8px)] z-50 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction("view", row);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#25324B] hover:bg-[#F8F8FD]"
            >
              <Eye className="h-4 w-4 text-[#7C8493]" />
              View Details
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push(`/admin/jobs/${row.id}/screening`);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#087F5B] hover:bg-green-50"
            >
              <BrainCircuit className="h-4 w-4" />
              AI Screening
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onAction("edit", row);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#25324B] hover:bg-[#F8F8FD]"
            >
              <Pencil className="h-4 w-4 text-[#7C8493]" />
              Edit Job
            </button>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAction(closeAction, row);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#25324B] hover:bg-[#F8F8FD]"
          >
            {row.status === "Closed" ? (
              <Unlock className="h-4 w-4 text-[#7C8493]" />
            ) : (
              <Lock className="h-4 w-4 text-[#7C8493]" />
            )}
            {closeLabel}
          </button>

          <div className="my-1 h-px w-full bg-gray-100" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onAction("delete", row);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
