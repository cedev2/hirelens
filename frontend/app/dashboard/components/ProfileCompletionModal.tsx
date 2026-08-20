"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight, X } from "lucide-react";
import toast from "react-hot-toast";
import { UploadDropzone } from "@/lib/upload";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileCompletionModalProps {
  missingFields: string[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function ProfileCompletionModal({
  missingFields,
  isOpen,
  onClose,
  onComplete,
}: ProfileCompletionModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleManualEntry = () => {
    onClose();
    router.push("/dashboard/profile");
  };

  if (!isOpen) return null;

  const fieldLabels: Record<string, string> = {
    headline: "Professional Headline",
    location: "Location",
    skills: "Skills",
    experience: "Work Experience",
    availability: "Availability Status",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-[10px] shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-16 h-16 bg-green-50 rounded-[10px] flex items-center justify-center mb-6 mx-auto">
            <FileText className="w-8 h-8 text-[#087F5B]" />
          </div>

          <h2 className="text-2xl font-black text-[#25324B] text-center mb-2">
            Complete Your Profile
          </h2>
          <p className="text-[#7C8493] text-center mb-6">
            To get the best experience, please complete your profile. You can
            either upload your resume for automatic parsing or fill in the
            details manually.
          </p>

          {missingFields.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Missing Information:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingFields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-[#25324B]"
                  >
                    {fieldLabels[field] || field}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <UploadDropzone
              endpoint="cvUploader"
              headers={{
                Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
              }}
              onClientUploadComplete={(res) => {
                 toast.success("Resume uploaded and profile parsed!");
                 queryClient.invalidateQueries({ queryKey: ["talent", "me"] });
                 onComplete?.();
                 onClose();
                 router.push("/dashboard/profile");
               }}
              onUploadError={(error: Error) => {
                toast.error(`ERROR! ${error.message}`);
              }}
              config={{
                mode: "manual",
              }}
              className="ut-label:text-[#087F5B] ut-button:bg-[#087F5B] ut-button:ut-readying:bg-[#087F5B]/50 border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-[#087F5B] transition-all"
            />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-[#7C8493]">or</span>
            </div>
          </div>

          <button
            onClick={handleManualEntry}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-[#25324B] rounded-xl font-bold text-sm hover:border-[#087F5B] hover:text-[#087F5B] transition-all"
          >
            Enter Details Manually
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
