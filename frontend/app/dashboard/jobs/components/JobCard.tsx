"use client";

import React, { useMemo } from "react";
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { BsCash } from "react-icons/bs";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store/store";

export interface Job {
  id: string;
  title: string;
  company: string;
  logo?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Remote";
  salary: string;
  postedAt: string;
  description: string;
  tags: string[];
  status?: "Open" | "Closed" | "Applied";
}

interface JobCardProps {
  job: Job;
  onClick: (id: string) => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch talent info to get talentId
  const talentQuery = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
    enabled: !!user?._id,
    staleTime: 600_000, // 10 minutes cache
  });

  const talentId = talentQuery.data?._id;

  // Fetch applications for this user
  const applicationsQuery = useQuery({
    queryKey: ["applications", talentId],
    queryFn: async () => {
      const res = await api.get(`/applications/talent/${talentId}`);
      return res.data?.applications || [];
    },
    enabled: !!talentId,
    staleTime: 30_000, // 30 seconds cache
  });

  const hasUserApplied = useMemo(() => {
    if (!applicationsQuery.data) return false;
    return applicationsQuery.data.some(
      (app: any) => (app.jobId?._id || app.jobId) === job.id,
    );
  }, [applicationsQuery.data, job.id]);

  const isLoading = applicationsQuery.isLoading || talentQuery.isLoading;

  return (
    <Card
      className="group relative bg-white border border-gray-100 rounded-[10px] p-6 hover:border-[#087F5B] transition-all duration-500 cursor-pointer shadow-none"
      onClick={() => onClick(job.id)}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-gray-50 flex items-center justify-center overflow-hidden">
            <img
              src="/images/logo/hirelens-ai-logo.svg"
              alt="HireLens Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#25324B] group-hover:text-[#087F5B] transition-colors leading-tight">
                {job.title}
              </h3>
              <div className="absolute right-[-5px] top-[-10px]">
                {isLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-gray-300" />
                ) : hasUserApplied ? (
                  <Badge className="bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border-green-600 border">
                    Applied
                  </Badge>
                ) : null}
              </div>
            </div>
            <p className="text-sm font-semibold text-[#7C8493] mt-1">
              {job.company}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-y-3 gap-x-6 mb-6">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#444]">
          <MapPin className="w-4 h-4 text-gray-400" />
          {job.location}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#444]">
          <Briefcase className="w-4 h-4 text-gray-400" />
          {job.type}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#444]">
          <BsCash className="w-4 h-4 text-gray-400" />
          {job.salary}
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#7C8493]">
          <Clock className="w-4 h-4 text-gray-400" />
          {job.postedAt}
        </div>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-gray-50">
        <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 3).map((tag, i) => (
            <Badge
              key={i}
              className="bg-[#F8FAFC] text-[#444] border-none px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg"
            >
              {tag}
            </Badge>
          ))}
          {job.tags.length > 3 && (
            <span className="text-[11px] font-bold text-gray-400 flex items-center">
              +{job.tags.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#087F5B]">
          View Details
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Card>
  );
}
