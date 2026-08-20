"use client";

import React from "react";
import { Award, Plus, BarChart3, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

interface SkillsSectionProps {
  skills: Skill[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

export default function SkillsSection({
  skills,
  onAdd,
  onEdit,
}: SkillsSectionProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Expert":
        return "bg-green-600";
      case "Advanced":
        return "bg-green-400";
      case "Intermediate":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getLevelSteps = (level: string) => {
    switch (level) {
      case "Expert":
        return 4;
      case "Advanced":
        return 3;
      case "Intermediate":
        return 2;
      default:
        return 1;
    }
  };

  return (
    <Card className="p-8 bg-white rounded-[10px] border border-gray-100 shadow-none">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div>
            <Award className="w-5 h-5 text-[#087F5B]" />
          </div>
          <h2 className="text-xl font-bold text-[#25324B]">
            Technical Expertise
          </h2>
        </div>
        <button
          onClick={onAdd}
          className="p-2 text-[#087F5B] hover:bg-[#E8F7F0] rounded-xl transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <div
            key={index}
            onClick={() => onEdit(index)}
            className="group relative p-5 bg-white rounded-[10px] border border-gray-100 hover:border-[#087F5B] hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#25324B] group-hover:text-[#087F5B] transition-colors uppercase tracking-wider">
                  {skill.name}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${getLevelColor(skill.level)} uppercase tracking-widest`}
                  >
                    {skill.level}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {skill.yearsOfExperience} YRS EXP
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-4 rounded-full transition-colors ${
                      i < getLevelSteps(skill.level)
                        ? getLevelColor(skill.level)
                        : "bg-gray-100"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
