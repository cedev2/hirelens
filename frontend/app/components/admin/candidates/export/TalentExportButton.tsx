"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Download, X, Printer } from "lucide-react";
import {
  exportTalentsToExcel,
  exportTalentsToPDF,
  printTalents,
  type ExportTalent,
} from "./talentExportUtils";

type TalentExportButtonProps = {
  talents: ExportTalent[];
  disabled?: boolean;
};

export default function TalentExportButton({
  talents,
  disabled = false,
}: TalentExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<
    "excel" | "pdf" | "print" | null
  >(null);

  const handleExport = async (type: "excel" | "pdf" | "print") => {
    setIsExporting(type);
    try {
      if (type === "excel") {
        exportTalentsToExcel(talents);
      } else if (type === "pdf") {
        exportTalentsToPDF(talents);
      } else if (type === "print") {
        printTalents(talents);
      }
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  const count = talents.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || count === 0}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
          disabled || count === 0
            ? "cursor-not-allowed bg-gray-100 text-gray-400"
            : "bg-[#087F5B] text-white hover:bg-[#1d5fd1]"
        }`}
      >
        <Download className="h-4 w-4" />
        Export
        {count > 0 && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-semibold text-[#7C8493]">
                Export Options
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-2 space-y-1">
              <button
                onClick={() => handleExport("excel")}
                disabled={isExporting !== null}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#E8F7F0] disabled:opacity-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  {isExporting === "excel" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#25324B]">
                    Excel Spreadsheet
                  </p>
                  <p className="text-xs text-[#7C8493]">
                    Full data with all fields
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleExport("pdf")}
                disabled={isExporting !== null}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#E8F7F0] disabled:opacity-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                  {isExporting === "pdf" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-600 border-t-transparent" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#25324B]">PDF Report</p>
                  <p className="text-xs text-[#7C8493]">Download as PDF file</p>
                </div>
              </button>

              <div className="my-2 border-t border-gray-100" />

              <button
                onClick={() => handleExport("print")}
                disabled={isExporting !== null}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#E8F7F0] disabled:opacity-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-[#087F5B]">
                  {isExporting === "print" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#087F5B] border-t-transparent" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-[#25324B]">Print</p>
                  <p className="text-xs text-[#7C8493]">Open print dialog</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
