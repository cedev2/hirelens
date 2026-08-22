"use client";

import React from "react";
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  appliedDate: string;
  status: "Reviewing" | "Shortlisted" | "Interviewing" | "Rejected" | "Offered";
  nextStep?: string;
}

interface ApplicationCardProps {
  application: Application;
  onClick: (id: string) => void;
}

const statusConfig = {
  Reviewing: {
    color: "bg-green-50 text-green-600",
    icon: <Clock3 className="w-4 h-4" />,
    label: "Under Review",
  },
  Shortlisted: {
    color: "bg-purple-50 text-purple-600",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Shortlisted",
  },
  Interviewing: {
    color: "bg-amber-50 text-amber-600",
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Interviewing",
  },
  Rejected: {
    color: "bg-red-50 text-red-600",
    icon: <XCircle className="w-4 h-4" />,
    label: "Not Selected",
  },
  Offered: {
    color: "bg-green-50 text-green-600",
    icon: <CheckCircle2 className="w-4 h-4" />,
    label: "Offered",
  },
};

export default function ApplicationCard({
  application,
  onClick,
}: ApplicationCardProps) {
  const config = statusConfig[application.status];
  // console.log(application);
  return (
    <Card
      className="group relative bg-white border shadow-none border-gray-100 rounded-[10px] p-5 hover:border-[#087F5B]/30 transition-all duration-500 cursor-pointer"
      onClick={() => onClick(application.id)}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 rounded-full bg-[#F8FAFC] border border-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/images/logo/hirelens.jpg"
              alt="HireLens logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#25324B] group-hover:text-[#087F5B] transition-colors leading-tight">
              {application.jobTitle}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
              <p className="text-sm font-semibold text-[#7C8493]">
                {application.company}
              </p>
              <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                {application.location}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Date Applied
            </span>
            <div className="flex items-center gap-2 text-sm font-bold text-[#25324B]">
              <Calendar className="w-4 h-4 text-gray-400" />
              {application.appliedDate}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Status
            </span>
            <Badge
              className={`${config.color} border-none px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-2`}
            >
              {config.icon}
              {config.label}
            </Badge>
          </div>

          <button className="hidden md:flex items-center justify-center w-12 h-12 bg-[#F8FAFC] rounded-[10px] cursor-pointer text-gray-400 group-hover:bg-[#087F5B] group-hover:text-white transition-all duration-300">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {application.nextStep && application.status !== "Rejected" && (
        <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 text-[#087F5B] rounded-full">
              <AlertCircle className="w-4 h-4" />
            </div>
            <p className="text-sm font-semibold text-[#25324B]">
              Next Step:{" "}
              <span className="text-[#087F5B]">{application.nextStep}</span>
            </p>
          </div>
          <button className="text-xs font-bold text-[#087F5B] hover:underline uppercase tracking-wider">
            View Instructions
          </button>
        </div>
      )}
    </Card>
  );
}
