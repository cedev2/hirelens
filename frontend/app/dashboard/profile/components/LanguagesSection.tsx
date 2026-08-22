"use client";

import React from "react";
import { Globe, Plus, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface Language {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

interface LanguagesSectionProps {
  languages: Language[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
}

export default function LanguagesSection({ 
  languages, 
  onAdd,
  onEdit,
  onRemove 
}: LanguagesSectionProps) {
  return (
    <Card className="p-8 bg-white rounded-[10px] border border-gray-100 shadow-none">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#111827] flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#087F5B]" />
          Languages
        </h2>
        <button 
          onClick={onAdd}
          className="p-2 text-[#087F5B] hover:bg-[#E8F7F0] rounded-xl transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110" />
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {languages.map((lang, index) => (
          <div
            key={index}
            onClick={() => onEdit(index)}
            className="group relative px-5 py-3 bg-[#F8FAFC] border border-gray-100 rounded-[10px] flex items-center gap-3 cursor-pointer hover:border-[#087F5B] transition-all"
          >
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-bold text-[#111827]">
              {lang.name}
            </span>
            <span className="text-[10px] font-bold text-[#087F5B] uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full">
              {lang.proficiency}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
