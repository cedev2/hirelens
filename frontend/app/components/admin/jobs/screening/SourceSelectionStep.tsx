"use client";

import { ArrowLeft, ArrowRight, FileUp, Users, Globe } from "lucide-react";
import { useMemo, useState } from "react";

export default function SourceSelectionStep({
  onSelect,
  onBack,
}: {
  onSelect: (
    source: "internal" | "upload" | "hirelens",
    params: { file?: File; topN: number },
  ) => void;
  onBack: () => void;
}) {
  const [topChoice, setTopChoice] = useState<"10" | "20" | "custom">("10");
  const [customTop, setCustomTop] = useState("10");

  const topN = useMemo(() => {
    if (topChoice === "10") return 10;
    if (topChoice === "20") return 20;
    const n = Number(customTop);
    if (!Number.isFinite(n)) return 10;
    return Math.max(1, Math.floor(n));
  }, [customTop, topChoice]);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C8493] hover:text-[#25324B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Job Selection
      </button>

      <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-bold text-[#25324B]">Top candidates</p>
        <p className="mt-1 text-xs text-[#7C8493]">
          Choose number of top ranked candidates to keep.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#25324B]">
            <input
              type="radio"
              name="topN"
              checked={topChoice === "10"}
              onChange={() => setTopChoice("10")}
              className="h-4 w-4"
            />
            10
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#25324B]">
            <input
              type="radio"
              name="topN"
              checked={topChoice === "20"}
              onChange={() => setTopChoice("20")}
              className="h-4 w-4"
            />
            20
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-[#25324B]">
            <input
              type="radio"
              name="topN"
              checked={topChoice === "custom"}
              onChange={() => setTopChoice("custom")}
              className="h-4 w-4"
            />
            Custom
          </label>

          {topChoice === "custom" && (
            <input
              value={customTop}
              onChange={(e) => setCustomTop(e.target.value)}
              inputMode="numeric"
              className="w-full sm:w-40 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#25324B] outline-none focus:ring-2 focus:ring-[#087F5B]"
              placeholder="e.g. 15"
            />
          )}

          <span className="text-xs font-semibold text-[#7C8493] sm:ml-auto">
            Selected: {topN}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pt-4 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          onClick={() => onSelect("internal", { topN })}
          className="group flex flex-col items-center rounded-[10px] border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-all hover:border-[#087F5B] hover:bg-green-50/30"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[10px] bg-green-50 text-[#087F5B] transition-transform group-hover:scale-110">
            <Users className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-[#25324B]">
            Use Submitted Applications
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-[#7C8493]">
            Analyze candidates who applied through the platform for this
            specific job.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#087F5B]">
            Start Screening <ArrowRight className="h-4 w-4" />
          </div>
        </button>

        <button
          onClick={() => onSelect("hirelens", { topN })}
          className="group flex flex-col items-center rounded-[10px] border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-all hover:border-[#087F5B] hover:bg-green-50/30"
        >
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[10px] bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110">
            <Globe className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-[#25324B]">
            Import from HireLens Talent Pool
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-[#7C8493]">
            Pull candidates from HireLens pool (dummy API for now) and rank them
            against job.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-emerald-600">
            Import & Screen <ArrowRight className="h-4 w-4" />
          </div>
        </button>

        <div className="group relative flex flex-col items-center overflow-hidden rounded-[10px] border-2 border-dashed border-gray-200 bg-white p-10 text-center transition-all hover:border-[#087F5B] hover:bg-green-50/30">
          <input
            type="file"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => {
              const file = e.target.files?.[0];
              onSelect("upload", { file, topN });
            }}
          />
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[10px] bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110">
            <FileUp className="h-10 w-10" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-[#25324B]">
            Upload External Data
          </h3>
          <p className="max-w-xs text-sm leading-relaxed text-[#7C8493]">
            Upload CSV, Excel, or PDF files. AI will parse and rank them against
            the job description.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm font-bold text-indigo-600">
            Browse Files <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
