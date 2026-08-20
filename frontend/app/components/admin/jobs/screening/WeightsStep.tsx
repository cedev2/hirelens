"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Briefcase,
  GraduationCap,
  Wrench,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";

type Weights = {
  skills: number;
  experience: number;
  education: number;
};

const PRESETS = {
  balanced: { skills: 40, experience: 35, education: 25 },
  skills_focus: { skills: 60, experience: 25, education: 15 },
  experience_focus: { skills: 25, experience: 60, education: 15 },
  education_focus: { skills: 25, experience: 15, education: 60 },
};

const PRESET_LABELS: Record<
  keyof typeof PRESETS,
  { label: string; desc: string }
> = {
  balanced: { label: "Balanced", desc: "Equal focus on all areas" },
  skills_focus: {
    label: "Skills First",
    desc: "Prioritize technical abilities",
  },
  experience_focus: {
    label: "Experience First",
    desc: "Prioritize work history",
  },
  education_focus: {
    label: "Education First",
    desc: "Prioritize degrees & certs",
  },
};

const WEIGHT_CONFIG = {
  skills: {
    label: "Skills Match",
    icon: Wrench,
    desc: "How well the candidate's skills align with the job requirements",
    color: "bg-green-500",
    lightColor: "bg-green-100",
    textColor: "text-green-600",
  },
  experience: {
    label: "Experience Level",
    icon: Briefcase,
    desc: "Years of relevant work experience and career progression",
    color: "bg-emerald-500",
    lightColor: "bg-emerald-100",
    textColor: "text-emerald-600",
  },
  education: {
    label: "Education & Certs",
    icon: GraduationCap,
    desc: "Formal education, degrees, and professional certifications",
    color: "bg-violet-500",
    lightColor: "bg-violet-100",
    textColor: "text-violet-600",
  },
};

type WeightKey = keyof Weights;

export default function WeightsStep({
  jobId,
  initialWeights,
  onContinue,
  onBack,
}: {
  jobId: string;
  initialWeights: Weights;
  onContinue: (weights: Weights) => void;
  onBack: () => void;
}) {
  // Convert DB weights (0-1) to UI weights (0-100) for display
  const dbToUiWeights = (dbWeights: Weights): Weights => ({
    skills: Math.round(dbWeights.skills * 100),
    experience: Math.round(dbWeights.experience * 100),
    education: Math.round(dbWeights.education * 100),
  });

  // Convert UI weights (0-100) to DB weights (0-1) for saving
  const uiToDbWeights = (uiWeights: Weights): Weights => ({
    skills: uiWeights.skills / 100,
    experience: uiWeights.experience / 100,
    education: uiWeights.education / 100,
  });

  const [weights, setWeights] = useState<Weights>(() => {
    const defaultWeights = { skills: 50, experience: 30, education: 20 };
    return initialWeights ? dbToUiWeights(initialWeights) : defaultWeights;
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const total = useMemo(
    () => weights.skills + weights.experience + weights.education,
    [weights],
  );
  const isValid = total === 100;

  const adjustWeights = useCallback(
    (changedKey: WeightKey, newValue: number) => {
      const clampedValue = Math.max(0, Math.min(100, newValue));
      const otherKeys = (Object.keys(weights) as WeightKey[]).filter(
        (k) => k !== changedKey,
      );

      const currentOthers = otherKeys.reduce((sum, k) => sum + weights[k], 0);
      const remaining = 100 - clampedValue;

      if (currentOthers === 0) {
        const split = Math.floor(remaining / 2);
        setWeights({
          ...weights,
          [changedKey]: clampedValue,
          [otherKeys[0]]: split,
          [otherKeys[1]]: remaining - split,
        });
        setActivePreset(null);
        return;
      }

      const ratio = remaining / currentOthers;
      let newWeights: Weights = { ...weights, [changedKey]: clampedValue };

      let distributedTotal = 0;
      otherKeys.forEach((k, idx) => {
        const rawValue = Math.round(weights[k] * ratio);
        const isLast = idx === otherKeys.length - 1;
        const finalValue = isLast
          ? remaining - distributedTotal
          : Math.min(remaining - distributedTotal, Math.max(0, rawValue));
        newWeights[k] = finalValue;
        distributedTotal += finalValue;
      });

      const finalTotal = Object.values(newWeights).reduce((a, b) => a + b, 0);
      if (finalTotal !== 100) {
        const diff = 100 - finalTotal;
        const adjustKey =
          otherKeys.find((k) => newWeights[k] + diff >= 0) || otherKeys[0];
        newWeights[adjustKey] = Math.max(0, newWeights[adjustKey] + diff);
      }

      setWeights(newWeights);
      setActivePreset(null);
    },
    [weights],
  );

  const applyPreset = useCallback((preset: keyof typeof PRESETS) => {
    setWeights(PRESETS[preset]);
    setActivePreset(preset);
  }, []);

  const resetToInitial = useCallback(() => {
    setWeights(initialWeights);
    setActivePreset(null);
  }, [initialWeights]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 rounded-[10px] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-[#087F5B]" />
          <h2 className="text-xl font-bold text-[#25324B]">
            Adjust Screening Weights
          </h2>
        </div>
        <p className="text-sm text-[#7C8493]">
          Control how the AI prioritizes different candidate attributes. Total
          must equal 100%.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map((key) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`flex flex-col items-start rounded-lg border px-3 py-2 text-left transition-all ${
              activePreset === key
                ? "border-[#087F5B] bg-[#087F5B]/5 ring-1 ring-[#087F5B]"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <span
              className={`text-sm font-semibold ${activePreset === key ? "text-[#087F5B]" : "text-[#25324B]"}`}
            >
              {PRESET_LABELS[key].label}
            </span>
            <span className="text-xs text-[#7C8493]">
              {PRESET_LABELS[key].desc}
            </span>
          </button>
        ))}
        <button
          onClick={resetToInitial}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-[#7C8493] transition-all hover:border-gray-300"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {(Object.keys(WEIGHT_CONFIG) as Array<WeightKey>).map((key) => {
          const config = WEIGHT_CONFIG[key];
          const Icon = config.icon;
          const value = weights[key];

          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.lightColor}`}
                  >
                    <Icon className={`h-5 w-5 ${config.textColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#25324B]">
                      {config.label}
                    </p>
                    <p className="text-xs text-[#7C8493]">{config.desc}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${config.textColor}`}>
                  {value}%
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value < 0 ? value * 100 : value}
                  onChange={(e) => adjustWeights(key, parseInt(e.target.value))}
                  className={`h-2 flex-1 cursor-pointer appearance-none rounded-full bg-gray-200 accent-[#087F5B] ${config.color}`}
                  style={{
                    background: `linear-gradient(to right, #087F5B 0%, #087F5B ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`,
                  }}
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#7C8493]">
                <span>0%</span>
                <div className="flex-1" />
                <span>100%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#25324B]">Total Weight</span>
          <span
            className={`text-xl font-bold ${isValid ? "text-emerald-600" : "text-amber-600"}`}
          >
            {total}%
          </span>
        </div>
        {!isValid && (
          <p className="mt-1 text-sm text-amber-600">
            Total must equal 100%. Adjust sliders to balance.
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2"
          disabled={isSaving}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          onClick={async () => {
            setIsSaving(true);
            try {
              await api.put(`/jobs/${jobId}`, {
                weights: {
                  skills: weights.skills / 100,
                  experience: weights.experience / 100,
                  education: weights.education / 100,
                },
              });
              onContinue(uiToDbWeights(weights));
            } catch (err) {
              console.error("Failed to update job weights:", err);
              alert("Failed to save weights. Please try again.");
            } finally {
              setIsSaving(false);
            }
          }}
          disabled={!isValid || isSaving}
          className="gap-2 bg-[#087F5B] hover:bg-[#1d5fd1]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
