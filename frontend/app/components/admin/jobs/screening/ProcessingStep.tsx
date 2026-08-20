"use client";

import { BrainCircuit } from "lucide-react";

export default function ProcessingStep({
  message,
  progress,
}: {
  message: string;
  progress: number;
}) {
  return (
    <div className="flex animate-in fade-in slide-in-from-bottom-2 duration-300 flex-col items-center justify-center rounded-[10px] border border-gray-100 bg-white py-20 shadow-sm">
      <div className="relative mb-8">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-[#087F5B]/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#087F5B] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-[#087F5B]/10" />
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-b-[#087F5B]/60 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
          <BrainCircuit className="h-10 w-10 text-[#087F5B]" />
        </div>
      </div>

      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-bold text-[#25324B]">
          Screening In Progress
        </h2>
        <div className="h-6 overflow-hidden relative">
          <p
            key={message}
            className="font-semibold text-[#087F5B] animate-in slide-in-from-top-2 fade-in duration-300"
          >
            {message}
          </p>
        </div>
      </div>

      <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-gray-100 relative">
        <div
          className="h-full bg-linear-to-r from-[#087F5B] via-[#5b8df0] to-[#087F5B] transition-all duration-500 ease-out relative"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}
