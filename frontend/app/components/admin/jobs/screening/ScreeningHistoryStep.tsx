"use client";

import {
  BrainCircuit,
  Play,
  Eye,
  Calendar,
  Users,
  Target,
  Plus,
  Trash2,
} from "lucide-react";

const STEP_LABELS: Record<string, string> = {
  results: "Results",
  shortlist: "Shortlist",
  interview_email: "Interview Invite",
  interview_manage: "Interview",
  contract_generate: "Contract Draft",
  contract_email: "Contract Sent",
  complete: "Hired",
};

const STEP_COLORS: Record<string, string> = {
  results: "bg-gray-500",
  shortlist: "bg-green-500",
  interview_email: "bg-yellow-500",
  interview_manage: "bg-orange-500",
  contract_generate: "bg-purple-500",
  contract_email: "bg-pink-500",
  complete: "bg-green-500",
};

const STEP_ORDER = [
  "results",
  "shortlist",
  "interview_email",
  "interview_manage",
  "contract_generate",
  "contract_email",
  "complete",
];

export type SavedScreening = {
  id: string;
  jobId: string;
  jobTitle: string;
  date: string;
  candidateCount: number;
  topScore: number;
  confidence: "high" | "medium" | "low";
  currentStep?: string;
};

export default function ScreeningHistoryStep({
  screenings,
  onView,
  onReRun,
  onStartNew,
  onDelete,
}: {
  screenings: SavedScreening[];
  onView: (id: string) => void;
  onReRun: (id: string) => void;
  onStartNew: () => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#111827]">Recent Screenings</h2>
        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-2 rounded-xl bg-[#087F5B] px-4 py-2 text-sm font-bold text-white shadow-md shadow-green-100 transition-all hover:bg-[#066B4D]"
        >
          <Plus className="h-4 w-4" />
          New Screening
        </button>
      </div>

      {screenings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[10px] bg-gray-50 text-gray-400">
            <BrainCircuit className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#111827]">
            No screenings yet
          </h3>
          <p className="mt-1 max-w-xs text-sm text-[#6B7280]">
            Start your first AI-powered candidate screening to see results here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {screenings.map((s) => (
            <div
              key={s.id}
              className="group rounded-[10px] border border-gray-200 bg-white p-5 transition-all hover:border-[#087F5B] hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[#111827] group-hover:text-[#087F5B]">
                    {s.jobTitle}
                  </h3>
                  <div className="mt-1 flex items-center gap-3 text-xs text-[#6B7280]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {s.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.candidateCount} Candidates
                    </span>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    s.confidence === "high"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {s.confidence} Confidence
                </span>
              </div>

              {/* Progress Bar */}
              {s.currentStep && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#6B7280]">
                      {STEP_LABELS[s.currentStep] || s.currentStep}
                    </span>
                    <span className="text-[#087F5B] font-semibold">
                      {Math.round(
                        ((STEP_ORDER.indexOf(s.currentStep) + 1) /
                          STEP_ORDER.length) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${STEP_COLORS[s.currentStep] || "bg-gray-500"}`}
                      style={{
                        width: `${((STEP_ORDER.indexOf(s.currentStep) + 1) / STEP_ORDER.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
                <div className="flex items-center gap-1 text-sm font-bold text-[#111827]">
                  <Target className="h-4 w-4 text-[#087F5B]" />
                  Top Score: {s.topScore}%
                </div>
                <div className="flex gap-2">
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            "Are you sure you want to delete this screening?",
                          )
                        ) {
                          onDelete(s.id);
                        }
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-red-500 transition-colors hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                      title="Delete Screening"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onReRun(s.id)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-[#6B7280] transition-colors hover:border-[#087F5B] hover:bg-green-50 hover:text-[#087F5B]"
                    title="Re-run Screening"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onView(s.id)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gray-50 px-3 text-xs font-bold text-[#111827] transition-colors hover:bg-gray-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Results
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
