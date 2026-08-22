"use client";

import { ArrowLeft, ArrowRight, Briefcase, Users } from "lucide-react";

export type JobSummary = {
  id: string;
  title: string;
  company: string;
  applicants: number;
};

export default function JobSelectionStep({
  jobs,
  onSelect,
  onBack,
}: {
  jobs: JobSummary[];
  onSelect: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to History
      </button>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => onSelect(job.id)}
            className="group flex flex-col rounded-[10px] border border-gray-200 bg-white p-6 text-left transition-all hover:border-[#087F5B] hover:shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-[#087F5B] transition-colors group-hover:bg-[#087F5B] group-hover:text-white">
              <Briefcase className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[#111827] group-hover:text-[#087F5B]">
              {job.title}
            </h3>
            <p className="mt-1 text-xs text-[#6B7280]">{job.company}</p>
            <div className="mt-6 flex w-full items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                <Users className="h-4 w-4 text-[#6B7280]" />
                {job.applicants} Applicants
              </div>
              <ArrowRight className="h-4 w-4 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#087F5B]" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
