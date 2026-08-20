"use client";

import React from "react";
import {
  Briefcase,
  Plus,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  IsCurrent: boolean;
}

interface ExperienceSectionProps {
  experience: Experience[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

export default function ExperienceSection({
  experience,
  onAdd,
  onEdit,
}: ExperienceSectionProps) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <Card className="p-8 bg-white rounded-[10px] border border-gray-100 shadow-none">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div>
            <Briefcase className="w-5 h-5 text-[#087F5B]" />
          </div>
          <h2 className="text-xl font-bold text-[#25324B]">Work Experience</h2>
        </div>
        <button
          onClick={onAdd}
          className="p-2 text-[#087F5B] hover:bg-[#E8F7F0] rounded-xl transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110" />
        </button>
      </div>

      <div className="space-y-10">
        {experience.map((exp, index) => (
          <div
            key={index}
            className="relative group pl-10 cursor-pointer"
            onClick={() => onEdit(index)}
          >
            {/* Timeline Line */}
            {index !== experience.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-[-40px] w-[2px] bg-gray-100 group-last:hidden" />
            )}
            {/* Timeline Dot */}
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#E8F7F0] border-2 border-white shadow-sm flex items-center justify-center z-10">
              <div
                className={`w-2.5 h-2.5 rounded-full ${exp.IsCurrent ? "bg-green-500 animate-pulse" : "bg-[#087F5B]"}`}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#25324B] group-hover:text-[#087F5B] transition-colors">
                  {exp.role}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#444]">
                    <Building className="w-4 h-4 text-gray-400" />
                    {exp.company}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(exp.startDate)} -{" "}
                    {exp.IsCurrent ? "Present" : formatDate(exp.endDate || "")}
                  </div>
                </div>
              </div>
              {exp.IsCurrent && (
                <Badge className="bg-green-50 text-green-700 border-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  Current
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed text-[#7C8493] font-medium max-w-2xl mb-5">
              {exp.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {exp.technologies.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-3 py-1.5 bg-[#F8FAFC] text-[#444] text-[10px] font-bold rounded-lg border border-gray-100 uppercase tracking-wider"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
