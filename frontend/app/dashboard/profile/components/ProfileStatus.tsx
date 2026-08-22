"use client";

import React from "react";
import { CheckCircle2, FileText, Upload } from "lucide-react";
import { UploadButton } from "@/lib/upload";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

interface StatusItemProps {
  label: string;
  isCompleted: boolean;
  isRequired?: boolean;
  onClick?: () => void;
}

const StatusItem = ({
  label,
  isCompleted,
  isRequired,
  onClick,
}: StatusItemProps) => (
  <div
    className={`flex items-center gap-2 py-1 ${onClick ? "cursor-pointer hover:translate-x-1 transition-transform" : ""}`}
    onClick={onClick}
  >
    <CheckCircle2
      className={`w-5 h-5 ${isCompleted ? "text-green-500" : "text-gray-300"}`}
    />
    <span className="text-sm font-medium text-[#444] leading-none">
      {label}
      {isRequired && <span className="text-[#d93025] ml-0.5">*</span>}
    </span>
  </div>
);

interface ProfileStatusProps {
  progress: {
    percentage: number;
    items: {
      label: string;
      isCompleted: boolean;
      isRequired?: boolean;
      targetId?: string;
    }[];
    hasCv: boolean;
    cvUrl?: string;
  };
}

export default function ProfileStatus({ progress }: ProfileStatusProps) {
  const { percentage, items, hasCv, cvUrl } = progress;
  const queryClient = useQueryClient();
  const [isChangingCv, setIsChangingCv] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky headers
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white rounded-[10px] sticky top-[100px] overflow-hidden shadow-none border border-gray-100">
      <div className="bg-[#1e5631] px-6 py-4">
        <h2 className="text-white text-lg font-bold uppercase tracking-wider">
          Profile Status
        </h2>
      </div>

      <div className="p-6">
        <p className="text-[#d93025] text-xs font-semibold mb-4">
          * is required
        </p>

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            {items.map((item, index) => (
              <StatusItem
                key={index}
                label={item.label}
                isCompleted={item.isCompleted}
                isRequired={item.isRequired}
                onClick={
                  item.targetId
                    ? () => scrollToSection(item.targetId!)
                    : undefined
                }
              />
            ))}
            <StatusItem
              label="Upload CV"
              isCompleted={hasCv}
              isRequired={true}
              onClick={() => scrollToSection("cv-section")}
            />
          </div>

          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-100"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                className="text-green-500 transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-xl font-bold text-green-600">
              {percentage}%
            </span>
          </div>
        </div>

        <div id="cv-section">
          {hasCv && !isChangingCv ? (
            <div className="space-y-3">
              <button
                onClick={() => cvUrl && window.open(cvUrl, "_blank")}
                className="w-full bg-[#f8f9fa] cursor-pointer hover:bg-gray-100 border border-gray-200 rounded-[10px] p-4 transition-colors flex items-center gap-4"
              >
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <FileText className="w-6 h-6 text-[#d93025]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[#111827]">
                    View uploaded CV
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    PDF
                  </p>
                </div>
              </button>
              <button
                onClick={() => setIsChangingCv(true)}
                className="w-full py-2 text-sm font-bold text-[#087F5B] hover:text-[#066B4D] flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Change CV
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#6B7280]">
                  {hasCv
                    ? "Upload new CV"
                    : "Upload your CV to complete your profile"}
                </p>
                {hasCv && (
                  <button
                    onClick={() => setIsChangingCv(false)}
                    className="text-xs font-bold text-gray-400 hover:text-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <UploadButton
                endpoint="cvUploader"
                headers={{
                  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
                }}
                onClientUploadComplete={() => {
                  toast.success("CV Uploaded successfully!");
                  queryClient.invalidateQueries({ queryKey: ["talent", "me"] });
                  setIsChangingCv(false);
                }}
                onUploadError={(error: Error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
                className="ut-button:bg-[#087F5B] ut-button:w-full ut-button:rounded-xl ut-button:font-bold ut-button:text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
