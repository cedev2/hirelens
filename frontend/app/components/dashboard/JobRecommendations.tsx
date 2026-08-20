import Image from "next/image";
import { Briefcase, CalendarDays, Filter, MapPin, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { stripHtmlToText } from "@/app/components/SafeHtml";
import { useState } from "react";
import JobDetailsModal from "@/app/dashboard/jobs/components/JobDetailsModal";
import { Job } from "@/app/dashboard/jobs/components/JobCard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import toast from "react-hot-toast";

type RecommendedJob = Job & {
  daysLeft: number;
  mode: string;
};

export default function JobRecommendations({ jobs }: { jobs: RecommendedJob[] }) {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<RecommendedJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      // We need talentId here, but we can also fetch it in the mutation or pass it from parent
      // For now, let's assume the backend can identify the user from the token
      const res = await api.post("/applications", {
        jobId,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to submit application",
      );
    },
  });

  const handleJobClick = (job: RecommendedJob) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleApply = (id: string) => {
    applyMutation.mutate(id);
  };

  return (
    <>
      <div className="rounded-[10px] bg-white border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#7C8493]">Jobs recommendations</p>
            <p className="text-lg font-semibold text-[#25324B]">
              Recommendations ({jobs.length})
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={`${job.id}-${job.title}`}
              className="rounded-[10px] border border-gray-100 bg-[#FBFBFF] p-5 hover:border-[#087F5B]/30 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => handleJobClick(job)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="size-10 rounded-full relative">
                    <Image
                      src="/images/logo/hirelens-ai-logo.svg"
                      alt=""
                      width={50}
                      height={50}
                      className="object-cover w-full h-full rounded-full"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#25324B] line-clamp-2 group-hover:text-[#087F5B] transition-colors">
                        {job.title}
                      </p>
                      {job.status === "Applied" && (
                        <span className="shrink-0 bg-green-100 text-green-700 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full">
                          Applied
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#7C8493]">{job.company}</p>
                  </div>
                </div>
                <Button
                  size="xs"
                  className="bg-[#087F5B] hover:bg-[#066B4D] rounded-xl cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJobClick(job);
                  }}
                >
                  More Details
                </Button>
              </div>

              <p className="mt-4 text-sm text-[#4B5563] leading-relaxed line-clamp-3">
                {stripHtmlToText(job.description)}
              </p>

              <div className="mt-5 flex items-center gap-6 text-xs text-[#7C8493]">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {job.type}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  {job.daysLeft} days left
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {job.mode}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3">
          <p className="text-xs text-[#7C8493]">Showing {jobs.length} of 20 jobs</p>
          <div className="flex items-center gap-2 text-xs">
            <button className="rounded-lg border border-gray-100 px-3 py-2 text-[#25324B] hover:bg-gray-50">
              Previous
            </button>
            <button className="rounded-lg border border-gray-100 px-3 py-2 text-[#25324B] hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          job={selectedJob}
          onApply={handleApply}
        />
      )}
    </>
  );
}
