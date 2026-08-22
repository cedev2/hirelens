"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Globe,
  Users,
  Calendar,
  ChevronLeft,
  Share2,
  CheckCircle2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Job } from "./JobCard";
import { BsCash } from "react-icons/bs";
import SafeHtml from "@/app/components/SafeHtml";

interface JobDetailsModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onApply: (id: string) => void;
}

export default function JobDetailsModal({
  job,
  isOpen,
  onClose,
  onApply,
}: JobDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[10px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-linear-to-r from-white to-green-50/30">
          <div className="flex gap-6 min-w-0">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black text-[#111827] mb-2 break-words">
                {job.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="text-lg font-bold text-[#087F5B]">
                  {job.company}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#6B7280]">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white hover:shadow cursor-pointer transition-all rounded-full"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Side: Job Info */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-xl font-black text-[#111827] mb-4">
                  Description
                </h3>
                <SafeHtml
                  html={job.description}
                  className="text-[#6B7280] leading-relaxed font-medium"
                />
              </section>

              <section>
                <h3 className="text-xl font-black text-[#111827] mb-4">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.tags.map((tag, i) => (
                    <Badge
                      key={i}
                      className="bg-green-50 text-[#087F5B] border-none px-3 py-1 text-xs font-medium uppercase tracking-widest rounded-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Side: Quick Stats */}
            <div className="space-y-6">
              <Card className="p-6 bg-[#F8FAFC] border-none shadow-none rounded-[10px] space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm text-[#087F5B]">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Type
                    </p>
                    <p className="text-sm font-bold text-[#111827]">
                      {job.type}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm text-[#087F5B]">
                    <BsCash className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Salary
                    </p>
                    <p className="text-sm font-bold text-[#111827]">
                      {job.salary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-full shadow-sm text-[#087F5B]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Posted
                    </p>
                    <p className="text-sm font-bold text-[#111827]">
                      {job.postedAt}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onApply(job.id)}
                  className="w-full py-5 bg-[#087F5B] text-white rounded-[10px] font-black uppercase tracking-widest text-sm shadow shadow-green-100 hover:bg-[#066B4D] transition-all flex items-center justify-center gap-3"
                >
                  Apply Now
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                {/* <button className="w-full py-5 border-2 border-gray-100 text-[#111827] rounded-[10px] font-black uppercase tracking-widest text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                  Save for Later
                  <Share2 className="w-5 h-5" />
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
