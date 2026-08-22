"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  MoreHorizontal,
  Star,
} from "lucide-react";

export type InterviewStatus =
  | "invited"
  | "confirmed"
  | "completed"
  | "no-show"
  | "rejected";

export interface InterviewCandidate {
  candidateId: string;
  name: string;
  email: string;
  rank: number;
  matchScore: number;
  status: InterviewStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  rating?: number; // 1-5
  feedback?: string;
}

interface InterviewManageStepProps {
  candidates: InterviewCandidate[];
  jobTitle: string;
  onContinue: (selectedIds: string[]) => void;
  onBack: () => void;
  onUpdateCandidates?: (candidates: InterviewCandidate[]) => void;
}

const STATUS_CONFIG: Record<
  InterviewStatus,
  { label: string; color: string; icon: any }
> = {
  invited: {
    label: "Invited",
    color: "bg-green-100 text-green-700",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    color: "bg-purple-100 text-purple-700",
    icon: CheckCircle2,
  },
  "no-show": {
    label: "No Show",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-gray-100 text-gray-700",
    icon: XCircle,
  },
};

export default function InterviewManageStep({
  candidates,
  jobTitle,
  onContinue,
  onBack,
  onUpdateCandidates,
}: InterviewManageStepProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localCandidates, setLocalCandidates] = useState(candidates);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with parent candidates on mount/update
  useEffect(() => {
    setLocalCandidates(candidates);
  }, [candidates]);

  const updateCandidate = (
    id: string,
    updates: Partial<InterviewCandidate>,
  ) => {
    setLocalCandidates((prev) => {
      const updated = prev.map((c) =>
        c.candidateId === id ? { ...c, ...updates } : c,
      );
      // Notify parent of change for auto-save
      onUpdateCandidates?.(updated);
      return updated;
    });
  };

  const handleStatusChange = (id: string, status: InterviewStatus) => {
    updateCandidate(id, { status }); // Save all changes (now handled by parent auto-save, but keep for button feedback)
  };

  const handleSave = async () => {
    setIsSaving(true);
    onUpdateCandidates?.(localCandidates);
    await new Promise((r) => setTimeout(r, 300));
    setIsSaving(false);
  };

  const confirmedForContract = localCandidates.filter(
    (c) => c.status === "completed" && (c.rating || 0) >= 4,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Interview Invites
        </button>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Calendar className="h-4 w-4" />
          <span>Manage Interviews</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, config]) => {
          const count = localCandidates.filter(
            (c) => c.status === status,
          ).length;
          const Icon = config.icon;
          return (
            <div
              key={status}
              className={`rounded-xl border p-3 ${
                count > 0
                  ? "border-gray-200 bg-white"
                  : "border-gray-100 bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280]">{config.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold text-[#111827]">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Candidates List */}
      <div className="space-y-3">
        {localCandidates.map((c) => {
          const isExpanded = expandedId === c.candidateId;
          const statusConfig = STATUS_CONFIG[c.status];
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={c.candidateId}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? "border-[#087F5B] shadow-md"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* Summary Row */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : c.candidateId)}
                className="flex flex-wrap items-center gap-3 sm:gap-4 p-4 cursor-pointer"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold ${
                    c.rank === 1
                      ? "bg-amber-100 text-amber-700"
                      : "bg-gray-100 text-[#111827]"
                  }`}
                >
                  #{c.rank}
                </div>
                <div className="flex-1 min-w-[140px]">
                  <h4 className="font-bold text-[#111827] truncate">{c.name}</h4>
                  <p className="text-sm text-[#6B7280] truncate">{c.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {c.scheduledDate && (
                    <span className="text-xs sm:text-sm text-[#6B7280]">
                      {c.scheduledDate} {c.scheduledTime}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${statusConfig.color}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-[#F9FAFB]/50">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Status Update */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-[#111827]">
                        Update Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_CONFIG).map(
                          ([status, config]) => (
                            <button
                              key={status}
                              onClick={() =>
                                handleStatusChange(
                                  c.candidateId,
                                  status as InterviewStatus,
                                )
                              }
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                c.status === status
                                  ? config.color
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {config.label}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Rating (for completed) */}
                    {c.status === "completed" && (
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#111827]">
                          Interview Rating
                        </label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() =>
                                updateCandidate(c.candidateId, { rating: star })
                              }
                              className={`p-1 ${(c.rating || 0) >= star ? "text-amber-400" : "text-gray-300"}`}
                            >
                              <Star className="h-5 w-5 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-semibold text-[#111827]">
                        <MessageSquare className="inline h-4 w-4 mr-1" />
                        Interview Notes & Feedback
                      </label>
                      <textarea
                        value={c.notes || ""}
                        onChange={(e) =>
                          updateCandidate(c.candidateId, {
                            notes: e.target.value,
                          })
                        }
                        rows={3}
                        placeholder="Add notes about the interview..."
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-[#6B7280]">
          {confirmedForContract.length > 0 ? (
            <span className="inline-flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {confirmedForContract.length} candidates ready for contract
            </span>
          ) : (
            <span>Mark interviews as completed with 4+ stars to proceed</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-lg border border-gray-200 px-6 py-2 text-sm font-semibold text-[#111827] hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={() =>
              onContinue(confirmedForContract.map((c) => c.candidateId))
            }
            disabled={confirmedForContract.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#087F5B] px-6 py-2 text-sm font-bold text-white shadow-md shadow-green-100 hover:bg-[#066B4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowRight className="h-4 w-4" />
            Generate Contracts ({confirmedForContract.length})
          </button>
        </div>
      </div>
    </div>
  );
}
