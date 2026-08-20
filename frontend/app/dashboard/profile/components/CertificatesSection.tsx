"use client";

import React from "react";
import { Award, Plus, Calendar, Building } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface Certificate {
  name: string;
  issuer: string;
  issueDate: string;
}

interface CertificatesSectionProps {
  certificates: Certificate[];
  onAdd: () => void;
  onEdit: (index: number) => void;
}

export default function CertificatesSection({
  certificates,
  onAdd,
  onEdit,
}: CertificatesSectionProps) {
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
            <Award className="w-5 h-5 text-[#087F5B]" />
          </div>
          <h2 className="text-xl font-bold text-[#25324B]">Certificates</h2>
        </div>
        <button
          onClick={onAdd}
          className="p-2 text-[#087F5B] hover:bg-[#E8F7F0] rounded-xl transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110" />
        </button>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-8 text-[#7C8493] font-medium">
          No certificates added yet. Click + to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert, index) => (
            <div
              key={index}
              onClick={() => onEdit(index)}
              className="group relative p-5 bg-white rounded-[10px] border border-gray-100 hover:border-[#087F5B] hover:shadow-[0_4px_15px_rgba(0,0,0,0.03)] transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-50 rounded-full">
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[#25324B] group-hover:text-[#087F5B] transition-colors uppercase tracking-wider">
                    {cert.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-500">
                    <Building className="w-3 h-3" />
                    {cert.issuer || "Unknown Issuer"}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs font-medium text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {cert.issueDate ? formatDate(cert.issueDate) : "No date"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
