"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Users,
  Mail,
  Calendar,
  X,
  Search,
  Filter,
  Star,
  Briefcase,
} from "lucide-react";

export type ShortlistCandidate = {
  candidateId: string;
  name: string;
  email: string;
  rank: number;
  matchScore: number;
  confidence: "high" | "medium" | "low";
  strengths: string[];
  headline?: string;
  phone?: string;
};

type SortOption = "rank" | "score" | "name";
type FilterConfidence = "all" | "high" | "medium";

export default function ShortlistStep({
  candidates,
  initiallySelected = [],
  jobTitle,
  onContinue,
  onBack,
}: {
  candidates: ShortlistCandidate[];
  initiallySelected?: string[];
  jobTitle: string;
  onContinue: (selectedIds: string[]) => void;
  onBack: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initiallySelected),
  );
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("rank");
  const [filterConf, setFilterConf] = useState<FilterConfidence>("all");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCandidates.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCandidates.map((c) => c.candidateId)));
    }
  };

  const filteredCandidates = useMemo(() => {
    let list = candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.strengths.some((s) =>
          s.toLowerCase().includes(query.toLowerCase()),
        ),
    );

    if (filterConf !== "all") {
      list = list.filter((c) => c.confidence === filterConf);
    }

    list.sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "score") return b.matchScore - a.matchScore;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [candidates, query, sortBy, filterConf]);

  const summary = useMemo(() => {
    const selected = candidates.filter((c) => selectedIds.has(c.candidateId));
    return {
      total: candidates.length,
      selected: selected.length,
      highConfidence: selected.filter((c) => c.confidence === "high").length,
    };
  }, [candidates, selectedIds]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C8493] hover:text-[#25324B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Results
        </button>
        <div className="flex items-center gap-2 text-sm text-[#7C8493]">
          <span className="font-semibold text-[#25324B]">{jobTitle}</span>
          <span>•</span>
          <span>Select candidates for interview</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-green-100 bg-[#F8F8FD] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#087F5B]/10 text-[#087F5B]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#25324B]">
                {summary.total}
              </p>
              <p className="text-xs text-[#7C8493]">Total Candidates</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#25324B]">
                {summary.selected}
              </p>
              <p className="text-xs text-[#7C8493]">Selected for Interview</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#25324B]">
                {summary.highConfidence}
              </p>
              <p className="text-xs text-[#7C8493]">High Confidence Picks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/20"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
          >
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
          <select
            value={filterConf}
            onChange={(e) => setFilterConf(e.target.value as FilterConfidence)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#087F5B]"
          >
            <option value="all">All Confidence</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50 transition-colors"
          >
            {selectedIds.size === filteredCandidates.length
              ? "Deselect All"
              : "Select All"}
          </button>
          <button
            onClick={() => onContinue(Array.from(selectedIds))}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#087F5B] px-6 py-2 text-sm font-bold text-white shadow-md shadow-green-100 hover:bg-[#066B4D] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Selected Preview */}
      {selectedIds.size > 0 && (
        <div className="rounded-xl border border-green-200 bg-[#E8F7F0] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[#087F5B]" />
              <span className="font-semibold text-[#25324B]">
                {selectedIds.size} candidates selected
              </span>
            </div>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-[#7C8493] hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidates
              .filter((c) => selectedIds.has(c.candidateId))
              .slice(0, 8)
              .map((c) => (
                <span
                  key={c.candidateId}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#25324B]"
                >
                  #{c.rank} {c.name}
                  <button
                    onClick={() => toggleSelect(c.candidateId)}
                    className="ml-1 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            {selectedIds.size > 8 && (
              <span className="rounded-full bg-white px-3 py-1 text-xs text-[#7C8493]">
                +{selectedIds.size - 8} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredCandidates.map((c) => {
          const isSelected = selectedIds.has(c.candidateId);
          return (
            <div
              key={c.candidateId}
              onClick={() => toggleSelect(c.candidateId)}
              className={`flex items-center gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
                isSelected
                  ? "border-[#087F5B] bg-[#E8F7F0]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold text-lg ${
                  c.rank === 1
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-[#25324B]"
                }`}
              >
                #{c.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-[#25324B]">{c.name}</h4>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-[#087F5B]" />
                  )}
                </div>
                <p className="text-sm text-[#7C8493] truncate">{c.email}</p>
                {c.headline && (
                  <p className="text-xs text-gray-500 mt-0.5">{c.headline}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-[#25324B]">
                    {c.matchScore}%
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      c.confidence === "high"
                        ? "bg-green-100 text-green-700"
                        : c.confidence === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {c.confidence}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                  {c.strengths.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] text-[#25324B]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-[#7C8493]">No candidates match your filters</p>
        </div>
      )}
    </div>
  );
}
