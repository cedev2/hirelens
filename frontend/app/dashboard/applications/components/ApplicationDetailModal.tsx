"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  AlertCircle,
  X,
  CheckCircle2,
  Clock3,
  XCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Application } from "./ApplicationCard";

interface ApplicationDetailModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  Reviewing: {
    color: "bg-green-50 text-green-600",
    icon: <Clock3 className="w-5 h-5" />,
    label: "Under Review",
    description:
      "Your application is currently being reviewed by the hiring team.",
  },
  Shortlisted: {
    color: "bg-purple-50 text-purple-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: "Shortlisted",
    description: "Great news! You've been shortlisted for this position.",
  },
  Interviewing: {
    color: "bg-amber-50 text-amber-600",
    icon: <AlertCircle className="w-5 h-5" />,
    label: "Interviewing",
    description: "The interview process has started. Prepare well!",
  },
  Rejected: {
    color: "bg-red-50 text-red-600",
    icon: <XCircle className="w-5 h-5" />,
    label: "Not Selected",
    description:
      "Thank you for your interest. The team has decided to move forward with other candidates.",
  },
  Offered: {
    color: "bg-green-50 text-green-600",
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: "Offered",
    description: "Congratulations! You have received a job offer.",
  },
};

export default function ApplicationDetailModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailModalProps) {
  if (!isOpen) return null;

  const config = statusConfig[application.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[10px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-linear-to-r from-white to-green-50/30">
          <div className="flex gap-6">
            <div>
              <h2 className="text-2xl font-black text-[#25324B] mb-2">
                {application.jobTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <p className="text-lg font-bold text-[#087F5B]">
                  {application.company}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#7C8493]">
                  <MapPin className="w-4 h-4" />
                  {application.location}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white hover:shadow-md rounded-full cursor-pointer transition-all"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-8">
          {/* Status Section */}
          <section className="">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#25324B] uppercase tracking-widest">
                Application Status
              </h3>
              <Badge
                className={`${config.color} border-none px-2 py-1.5 text-xs font-bold rounded-xl flex items-center gap-2`}
              >
                {config.icon}
                {config.label}
              </Badge>
            </div>
            <p className="text-[#7C8493] font-medium text-sm leading-relaxed">
              {config.description}
            </p>
            {application.nextStep && application.status !== "Rejected" && (
              <div className="mt-4 p-4 bg-white rounded-[10px] border border-green-100 flex items-center gap-4">
                <div className="p-2 bg-green-50 text-[#087F5B] rounded-full">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Next Step
                  </p>
                  <p className="text-sm font-bold text-[#25324B]">
                    {application.nextStep}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-black text-[#25324B] uppercase tracking-widest mb-4">
                  Job Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Employment Type
                      </p>
                      <p className="text-sm font-bold text-[#25324B]">
                        {application.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Date Applied
                      </p>
                      <p className="text-sm font-bold text-[#25324B]">
                        {application.appliedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-black text-[#25324B] uppercase tracking-widest mb-4">
                  Resources
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-4 bg-white border border-gray-100 rounded-[10px] flex items-center justify-between hover:border-[#087F5B] hover:bg-green-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#087F5B]" />
                      <span className="text-sm font-bold text-[#25324B]">
                        View Submitted Resume
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#087F5B]" />
                  </button>
                  <button className="w-full p-4 bg-white border border-gray-100 rounded-[10px] flex items-center justify-between hover:border-[#087F5B] hover:bg-green-50/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-[#087F5B]" />
                      <span className="text-sm font-bold text-[#25324B]">
                        Contact Hiring Team
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#087F5B]" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-gray-100 flex gap-4 hidden">
          <button className="flex-1 py-4 bg-[#087F5B] text-white rounded-[10px] font-black uppercase tracking-widest text-xs shadow-xl shadow-green-100 hover:bg-[#066B4D] transition-all">
            Withdraw Application
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-gray-50 text-[#25324B] rounded-[10px] font-black uppercase tracking-widest text-xs hover:bg-gray-100 transition-all"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
