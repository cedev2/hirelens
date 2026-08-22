"use client";

import { CheckCircle2 } from "lucide-react";

type Step = {
  id: string;
  label: string;
};

export default function ScreeningStepper({
  steps,
  currentStep,
}: {
  steps: Step[];
  currentStep: string;
}) {
  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        {steps.map((s, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = s.id === currentStep;

          return (
            <div key={s.id} className="z-10 flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                      ? "bg-[#087F5B] text-white shadow-lg shadow-green-200"
                      : "bg-gray-100 text-[#6B7280]"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-bold ${
                  isActive ? "text-[#111827]" : "text-[#6B7280]"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 z-0 h-0.5 bg-gray-100" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#087F5B] transition-all duration-500 ease-out"
          style={{
            width: `${(currentIdx / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
