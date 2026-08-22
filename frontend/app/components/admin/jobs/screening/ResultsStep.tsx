"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Loader2,
} from "lucide-react";
import AdminApplicationDetailModal from "@/app/components/admin/applications/AdminApplicationDetailModal";
import type { AdminApplicationRow } from "@/app/components/admin/applications/AdminApplicationsTable";

export type CandidateResult = {
  candidateId: string;
  name: string;
  email: string;
  rank: number;
  matchScore: number;
  confidence: "high" | "medium" | "low";
  strengths: string[];
  gaps: string[];
  reasoning: string;
  finalRecommendation: string;
  comparisonNotes?: string;
};

export default function ResultsStep({
  results,
  comparisonSummary,
  selectedCandidateIds,
  expandedCandidate,
  onToggleSelect,
  onToggleExpand,
  onNext,
  onCompare,
  onRestart,
  onBack,
}: {
  results: CandidateResult[];
  comparisonSummary?: string;
  selectedCandidateIds: string[];
  expandedCandidate: string | null;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (id: string | null) => void;
  onNext: () => void;
  onCompare: () => void;
  onRestart: () => void;
  onBack: () => void;
}) {
  const [view, setView] = useState<"summary" | "detailed">("summary");
  const [displayedSummary, setDisplayedSummary] = useState("");
  const [profileCandidate, setProfileCandidate] =
    useState<CandidateResult | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const topRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typing animation for comparison summary
  useEffect(() => {
    const summaryText =
      comparisonSummary ||
      "Top candidates show a strong correlation with job requirements.";
    let index = 0;
    setDisplayedSummary("");

    const interval = setInterval(() => {
      if (index < summaryText.length) {
        const nextChar = summaryText.charAt(index);
        index += 1;
        setDisplayedSummary((prev) => prev + nextChar);
      } else {
        clearInterval(interval);
      }
    }, 20); // 20ms per character for smooth typing

    return () => clearInterval(interval);
  }, [comparisonSummary]);

  useEffect(() => {
    if (revealTimerRef.current) {
      clearInterval(revealTimerRef.current);
      revealTimerRef.current = null;
    }

    if (!results || results.length === 0) {
      setVisibleCount(0);
      return;
    }

    setVisibleCount(0);

    revealTimerRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        const next = Math.min(results.length, prev + 1);
        return next;
      });
    }, 300);

    return () => {
      if (revealTimerRef.current) {
        clearInterval(revealTimerRef.current);
        revealTimerRef.current = null;
      }
    };
  }, [results]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (visibleCount <= 0) return;

    if (visibleCount < results.length) {
      requestAnimationFrame(() => {
        lastItemRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    const t = setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);

    return () => clearTimeout(t);
  }, [visibleCount, results.length]);

  const confidenceColor = (conf: string) => {
    if (conf === "high") return "bg-green-100 text-green-700 border-green-200";
    if (conf === "medium")
      return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  const summary = useMemo(() => {
    const total = results.length;
    const high = results.filter((r) => r.confidence === "high").length;
    return { total, high };
  }, [results]);

  const canCompare = selectedCandidateIds.length === 2;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div ref={topRef} />
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </button>

      <div className="flex flex-col items-center justify-between gap-6 rounded-[10px] border border-green-100 bg-[#F9FAFB] p-6 md:flex-row">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#111827]">
              Screening Summary
            </h3>
            <p className="text-sm text-[#6B7280]">
              {displayedSummary}
              {displayedSummary !==
                (comparisonSummary ||
                  "Top candidates show a strong correlation with job requirements.")}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-green-50 bg-white px-4 py-2 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              Total Evaluated
            </p>
            <p className="text-xl font-bold text-[#111827]">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-green-50 bg-white px-4 py-2 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              High Confidence
            </p>
            <p className="text-xl font-bold text-green-600">{summary.high}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-2 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-[#111827]">
            Ranked Candidates
          </h3>
          <div className="inline-flex items-center rounded-xl border border-gray-200 bg-white p-1">
            <button
              onClick={() => setView("summary")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                view === "summary"
                  ? "bg-[#087F5B] text-white"
                  : "text-[#111827] hover:bg-gray-50"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setView("detailed")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                view === "detailed"
                  ? "bg-[#087F5B] text-white"
                  : "text-[#111827] hover:bg-gray-50"
              }`}
            >
              Detailed
            </button>
          </div>
        </div>

        <div
          data-tour="compare-candidates"
          className="flex flex-wrap items-center justify-end gap-2"
        >
          <button
            onClick={onCompare}
            disabled={!canCompare}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-colors ${
              canCompare
                ? "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
            }`}
            title={
              canCompare
                ? "Compare selected candidates"
                : "Select exactly 2 candidates to compare"
            }
          >
            Vs
          </button>

          <button
            onClick={onNext}
            disabled={selectedCandidateIds.length === 0}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-bold transition-all ${
              selectedCandidateIds.length > 0
                ? "bg-[#087F5B] text-white shadow-md shadow-green-100 hover:bg-[#066B4D]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ArrowRight className="h-4 w-4" />
            Next Step: Shortlist ({selectedCandidateIds.length})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {results.slice(0, visibleCount).map((c, idx, arr) => {
          const isExpanded =
            view === "detailed" || expandedCandidate === c.candidateId;
          const selected = selectedCandidateIds.includes(c.candidateId);
          return (
            <div
              key={c.candidateId}
              ref={idx === arr.length - 1 ? lastItemRef : undefined}
              className={`overflow-hidden rounded-[10px] border bg-white transition-all ${
                isExpanded
                  ? "border-[#087F5B] shadow-md"
                  : "border-gray-200 hover:border-gray-300"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className="flex flex-wrap items-center">
                <div
                  data-tour="candidate-selection"
                  className="pl-4 sm:pl-5 pt-3 sm:pt-0 flex items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggleSelect(c.candidateId)}
                    className="h-5 w-5 cursor-pointer rounded-md border-gray-300 text-[#087F5B] focus:ring-[#087F5B]"
                    title="Select candidate"
                  />
                </div>

                <div
                  className={`flex-1 min-w-0 items-center gap-3 sm:gap-4 p-4 sm:p-5 flex flex-wrap ${
                    view === "summary" ? "cursor-pointer" : "cursor-default"
                  }`}
                  onClick={() => {
                    if (view !== "summary") return;
                    onToggleExpand(
                      expandedCandidate === c.candidateId
                        ? null
                        : c.candidateId,
                    );
                  }}
                >
                  <div
                    className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full font-bold text-base sm:text-lg ${
                      c.rank === 1
                        ? "bg-[#d5b011] text-amber-700"
                        : c.rank === 2
                          ? "bg-[#b7c0bf] text-[#2f3131]"
                          : c.rank === 3
                            ? "bg-[#7e5920] text-[#f0aa3c]"
                            : "bg-gray-100 text-[#111827]"
                    }`}
                  >
                    {"#" + c.rank}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-[#111827]">
                      {c.name}
                    </h4>
                    <div className="mt-1 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                        Score:{" "}
                        <span className="font-bold text-[#111827]">
                          {c.matchScore}%
                        </span>
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${confidenceColor(
                          c.confidence,
                        )}`}
                      >
                        {c.confidence} Confidence
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileCandidate(c);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-700 hover:bg-green-100 transition-colors"
                    title="View candidate profile"
                  >
                    {" "}
                    Profile
                  </button>

                  {view === "summary" && (
                    <div className="flex items-center gap-4">
                      <div className="hidden text-right lg:block">
                        <p className="text-xs font-bold text-green-600">
                          Recommended
                        </p>
                        <p className="text-[10px] text-[#6B7280]">
                          Technical Assessment
                        </p>
                      </div>
                      {expandedCandidate === c.candidateId ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="ml-10 animate-in slide-in-from-top-2 duration-200 border-t border-gray-50 bg-[#F9FAFB]/50 px-5 pb-6">
                  <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-5">
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-green-600">
                          <CheckCircle2 className="h-4 w-4" /> Core Strengths
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.strengths.map((s) => (
                            <span
                              key={s}
                              className="rounded-lg border border-green-100 bg-white px-3 py-1.5 text-xs font-medium text-green-800"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                          <AlertCircle className="h-4 w-4" /> Notable Gaps
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {c.gaps.map((g) => (
                            <span
                              key={g}
                              className="rounded-lg border border-amber-100 bg-white px-3 py-1.5 text-xs font-medium text-amber-800"
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                      {c.comparisonNotes && (
                        <div>
                          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                            Notes
                          </p>
                          <div className="rounded-xl border border-gray-100 bg-white p-4">
                            <p className="text-sm leading-relaxed text-[#111827]">
                              {c.comparisonNotes}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-5">
                      <div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6B7280]">
                          AI Reasoning
                        </p>
                        <div className="rounded-xl border border-gray-100 bg-white p-4">
                          <p className="text-sm leading-relaxed italic text-[#111827]">
                            "{c.reasoning}"
                          </p>
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#087F5B] p-4 text-white">
                        <p className="mb-1 text-[10px] font-bold uppercase opacity-70">
                          Final Recommendation
                        </p>
                        <p className="text-sm font-bold">
                          {c.finalRecommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AdminApplicationDetailModal
        application={
          profileCandidate
            ? ({
                id: profileCandidate.candidateId,
                talentId: profileCandidate.candidateId,
                talentName: profileCandidate.name,
                talentHeadline: "",
                talentLocation: "",
                status: "pending",
                appliedDate: "",
                resumeUrl: "#",
                coverLetter: "",
              } as AdminApplicationRow)
            : null
        }
        onClose={() => setProfileCandidate(null)}
      />

      <div className="flex justify-center pt-6">
        <button
          onClick={onRestart}
          className="text-sm font-bold text-[#6B7280] transition-colors hover:text-[#111827]"
        >
          Restart Screening Process
        </button>
      </div>
    </div>
  );
}
