"use client";

import { ArrowLeft, ArrowRight, Cpu, Zap } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export type ScreeningModel = "gemini" | "groq";

export default function ModelSelectionStep({
  initialModel,
  onContinue,
  onBack,
}: {
  initialModel: ScreeningModel;
  onContinue: (model: ScreeningModel) => void;
  onBack: () => void;
}) {
  const [model, setModel] = useState<ScreeningModel>(initialModel);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Weights
      </button>

      <div className="rounded-[10px] border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#111827]">Choose AI model</h3>
        <p className="mt-1 text-sm text-[#6B7280]">
          Select which provider to use for screening.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setModel("gemini")}
            className={`flex items-start gap-4 rounded-[10px] border p-5 text-left transition-all ${
              model === "gemini"
                ? "border-[#087F5B] bg-green-50/40 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                model === "gemini"
                  ? "bg-green-100 text-[#087F5B]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Image
                src={"/images/models/gemini.png"}
                alt="Groq Logo"
                width={20}
                height={20}
                className="size-[35px] rounded-full"
              />
            </div>
            <div className="min-w-0 flex flex-col">
              <p className="font-bold text-[#111827]">Gemini</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Default model. May rate-limit on heavy traffic.
              </p>

              <div className="flex flex-wrap gap-2 mt-1">
                {["<50s Results", "Gemma 4 31B", "Most Accurate"].map(
                  (ft, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-green-200 bg-green-50 text-green-600"
                    >
                      {ft}
                    </span>
                  ),
                )}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setModel("groq")}
            className={`flex items-start gap-4 rounded-[10px] border p-5 text-left transition-all ${
              model === "groq"
                ? "border-[#087F5B] bg-green-50/40 shadow-sm"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                model === "groq"
                  ? "bg-green-100 text-[#087F5B]"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Image
                src={"/images/models/groq.png"}
                alt="Groq Logo"
                width={20}
                height={20}
                className="size-[35px] rounded-full"
              />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#111827]">Groq</p>
              <p className="mt-1 text-xs text-[#6B7280]">
                Groq powered models. Uses lates Groq LPU.
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {["<7s Results", "Llama 3.3 70B", "Fastest Screening"].map(
                  (ft, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border border-green-200 bg-green-50 text-green-600"
                    >
                      {ft}
                    </span>
                  ),
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onContinue(model)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#087F5B] px-6 py-2 text-sm font-bold text-white shadow-md shadow-green-100 hover:bg-[#066B4D]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
