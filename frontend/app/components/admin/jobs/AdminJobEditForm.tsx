"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

import RichTextEditor from "@/app/components/admin/form/RichTextEditor";
import JobOnboarding from "./JobOnboarding";
import { api } from "@/lib/api/client";

type FormValues = {
  title: string;
  description: string;
  requirements: { value: string }[];
  weights: {
    skills: number;
    experience: number;
    education: number;
  };
  deadline: string;
  jobType: "full-time" | "part-time";
  locationType: "on-site" | "hybrid" | "remote";
  status: "open" | "closed" | "draft";
  salary: {
    amount: number;
    currency: "USD" | "RWF";
  };
  benefits: { value: string }[];
};

type BackendJob = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  requirements?: string[];
  weights?: { skills?: number; experience?: number; education?: number };
  deadline?: string | Date;
  jobType?: "full-time" | "part-time";
  locationType?: "on-site" | "hybrid" | "remote";
  status?: "open" | "closed" | "draft";
  salary?: { amount?: number; currency?: "USD" | "RWF" };
  benefits?: string[];
};

function isoToDateInput(value: string | Date | undefined) {
  if (!value) return "";
  const dt = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
}

export default function AdminJobEditForm() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? "";

  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      requirements: [{ value: "" }],
      weights: {
        skills: 40,
        experience: 35,
        education: 25,
      },
      deadline: "",
      jobType: "full-time",
      locationType: "remote",
      status: "open",
      salary: {
        amount: 0,
        currency: "USD",
      },
      benefits: [{ value: "" }],
    },
    mode: "onChange",
  });

  const requirementsArray = useFieldArray({ control, name: "requirements" });
  const benefitsArray = useFieldArray({ control, name: "benefits" });

  const jobQuery = useQuery({
    queryKey: ["admin", "job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return (res.data?.job ?? null) as BackendJob | null;
    },
    staleTime: 30_000,
  });

  useEffect(() => {
    const raw = jobQuery.data;
    if (!raw) return;

    const next: FormValues = {
      title: String(raw?.title ?? ""),
      description: String(raw?.description ?? ""),
      requirements:
        Array.isArray(raw?.requirements) && raw.requirements.length > 0
          ? raw.requirements.map((r) => ({ value: String(r ?? "") }))
          : [{ value: "" }],
      weights: {
        // Convert DB weights (0-1) to UI weights (0-100)
        skills: Math.round(Number(raw?.weights?.skills ?? 0.4) * 100),
        experience: Math.round(Number(raw?.weights?.experience ?? 0.35) * 100),
        education: Math.round(Number(raw?.weights?.education ?? 0.25) * 100),
      },
      deadline: isoToDateInput(raw?.deadline),
      jobType: (raw?.jobType ?? "full-time") as FormValues["jobType"],
      locationType: (raw?.locationType ??
        "remote") as FormValues["locationType"],
      status: (raw?.status ?? "open") as FormValues["status"],
      salary: {
        amount: Number(raw?.salary?.amount ?? 0),
        currency: (raw?.salary?.currency ??
          "USD") as FormValues["salary"]["currency"],
      },
      benefits:
        Array.isArray(raw?.benefits) && raw.benefits.length > 0
          ? raw.benefits.map((b) => ({ value: String(b ?? "") }))
          : [{ value: "" }],
    };

    reset(next);
  }, [jobQuery.data, reset]);

  const weights = watch("weights");
  const weightsTotal = useMemo(() => {
    const s = Number(weights?.skills ?? 0);
    const e = Number(weights?.experience ?? 0);
    const ed = Number(weights?.education ?? 0);
    return s + e + ed;
  }, [weights]);

  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  const rebalanceWeights = (
    key: "skills" | "experience" | "education",
    nextValue: number,
  ) => {
    const current = {
      skills: Number(weights?.skills ?? 0),
      experience: Number(weights?.experience ?? 0),
      education: Number(weights?.education ?? 0),
    };

    const next = {
      ...current,
      [key]: clamp(nextValue),
    };

    const otherKeys = (Object.keys(next) as (keyof typeof next)[]).filter(
      (k) => k !== key,
    ) as ("skills" | "experience" | "education")[];

    const remaining = 100 - next[key];
    const aKey = otherKeys[0];
    const bKey = otherKeys[1];

    const a = next[aKey];
    const b = next[bKey];
    const sum = a + b;

    if (remaining <= 0) {
      next[aKey] = 0;
      next[bKey] = 0;
    } else if (sum <= 0) {
      const half = Math.floor(remaining / 2);
      next[aKey] = half;
      next[bKey] = remaining - half;
    } else {
      const aShare = Math.floor((a / sum) * remaining);
      next[aKey] = aShare;
      next[bKey] = remaining - aShare;
    }

    setValue("weights.skills", clamp(next.skills), { shouldDirty: true });
    setValue("weights.experience", clamp(next.experience), {
      shouldDirty: true,
    });
    setValue("weights.education", clamp(next.education), { shouldDirty: true });
  };

  const updateJobMutation = useMutation<any, unknown, { payload: any }>({
    mutationFn: async ({ payload }) => {
      const res = await api.put(`/jobs/${jobId}`, payload);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "job", jobId],
      });
      toast.success("Job updated");
      router.push(`/admin/jobs/${jobId}`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update job");
    },
  });

  const buildPayload = (values: FormValues) => {
    return {
      title: values.title.trim(),
      description: values.description,
      requirements: values.requirements
        .map((r) => r.value.trim())
        .filter(Boolean),
      weights: {
        // Convert UI weights (0-100) to DB weights (0-1)
        skills: Number(values.weights.skills) / 100,
        experience: Number(values.weights.experience) / 100,
        education: Number(values.weights.education) / 100,
      },
      deadline: new Date(values.deadline).toISOString(),
      jobType: values.jobType,
      locationType: values.locationType,
      status: values.status,
      salary: {
        amount: Number(values.salary.amount),
        currency: values.salary.currency,
      },
      benefits: values.benefits.map((b) => b.value.trim()).filter(Boolean),
    };
  };

  const onSubmit = async (values: FormValues) => {
    const payload = buildPayload(values);
    await updateJobMutation.mutateAsync({ payload });
  };

  const isLoading = jobQuery.isLoading;
  const errorMessage = (jobQuery.error as any)?.message || null;

  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("job-onboarding-seen");
    if (!hasSeenOnboarding && !isLoading) {
      setRunTour(true);
    }
  }, [isLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("job-onboarding-seen", "true");
  };

  const fieldClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#087F5B]";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load job. {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm font-semibold text-[#111827]">
          Loading job...
        </div>
      )}

      {!isLoading && jobQuery.data && (
        <>
          <div className="mb-6">
            <p className="text-xl font-semibold text-[#111827]">Edit Job</p>
            <p className="text-sm text-[#6B7280]">Update job details</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div data-tour="job-title">
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Title
                </label>
                <input
                  className={fieldClass}
                  {...register("title", { required: "Title is required" })}
                  placeholder="e.g. Senior Frontend Engineer"
                />
                {errors.title?.message && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Deadline
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    className={`${fieldClass} pl-10`}
                    {...register("deadline", {
                      required: "Deadline is required",
                    })}
                  />
                </div>
                {errors.deadline?.message && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.deadline.message}
                  </p>
                )}
              </div>
            </div>

            <div data-tour="job-description">
              <label className="mb-1 block text-sm font-semibold text-[#111827]">
                Description
              </label>
              <Controller
                control={control}
                name="description"
                rules={{
                  required: "Description is required",
                  validate: (v) => {
                    const stripped = String(v ?? "")
                      .replace(/<[^>]*>/g, "")
                      .replace(/&nbsp;/g, " ")
                      .trim();
                    return stripped.length > 0 || "Description is required";
                  },
                }}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={(html) => field.onChange(html)}
                    placeholder="Write a clear job description..."
                  />
                )}
              />
              {errors.description?.message && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div
              data-tour="job-details"
              className="grid grid-cols-1 gap-4 lg:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Job Type
                </label>
                <select
                  className={fieldClass}
                  {...register("jobType", { required: true })}
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Location Type
                </label>
                <select
                  className={fieldClass}
                  {...register("locationType", { required: true })}
                >
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Status
                </label>
                <select
                  className={fieldClass}
                  {...register("status", { required: true })}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-[#111827]">
                  Salary
                </label>
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input
                    type="number"
                    className={fieldClass}
                    {...register("salary.amount", {
                      required: "Amount is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0",
                      },
                    })}
                    placeholder="Amount"
                  />
                  <select
                    className={fieldClass}
                    {...register("salary.currency", { required: true })}
                  >
                    <option value="USD">USD</option>
                    <option value="RWF">RWF</option>
                  </select>
                </div>
                {errors.salary?.amount?.message && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {errors.salary.amount.message}
                  </p>
                )}
              </div>
            </div>

            <div
              data-tour="job-weights"
              className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">
                    Screening Weights
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    Backend requires all three weights
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    weightsTotal === 100
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  Total: {weightsTotal}%
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7280]">
                    Skills %
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Number(weights?.skills ?? 0)}
                      onChange={(e) =>
                        rebalanceWeights("skills", Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-[#087F5B]"
                    />
                    <span className="w-12 text-right text-sm font-semibold text-[#111827]">
                      {Number(weights?.skills ?? 0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7280]">
                    Experience %
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Number(weights?.experience ?? 0)}
                      onChange={(e) =>
                        rebalanceWeights("experience", Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-[#087F5B]"
                    />
                    <span className="w-12 text-right text-sm font-semibold text-[#111827]">
                      {Number(weights?.experience ?? 0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#6B7280]">
                    Education %
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Number(weights?.education ?? 0)}
                      onChange={(e) =>
                        rebalanceWeights("education", Number(e.target.value))
                      }
                      className="h-2 w-full cursor-pointer accent-[#087F5B]"
                    />
                    <span className="w-12 text-right text-sm font-semibold text-[#111827]">
                      {Number(weights?.education ?? 0)}%
                    </span>
                  </div>
                </div>
              </div>

              {weightsTotal !== 100 && (
                <p className="mt-2 text-xs font-semibold text-amber-700">
                  We recommend weights sum to 100.
                </p>
              )}
            </div>

            <div
              data-tour="job-requirements"
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#111827]">
                    Requirements
                  </p>
                  <button
                    type="button"
                    onClick={() => requirementsArray.append({ value: "" })}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {requirementsArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        className={fieldClass}
                        placeholder="e.g. 3+ years React experience"
                        {...register(`requirements.${index}.value`, {
                          required:
                            index === 0
                              ? "At least 1 requirement is required"
                              : false,
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => requirementsArray.remove(index)}
                        disabled={requirementsArray.fields.length === 1}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-[#111827] hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Remove requirement"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {errors.requirements?.[0]?.value?.message && (
                  <p className="mt-2 text-xs font-semibold text-red-600">
                    {errors.requirements?.[0]?.value?.message}
                  </p>
                )}
              </div>

              <div data-tour="job-benefits">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#111827]">
                    Benefits
                  </p>
                  <button
                    type="button"
                    onClick={() => benefitsArray.append({ value: "" })}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>

                <div className="space-y-2">
                  {benefitsArray.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        className={fieldClass}
                        placeholder="e.g. Health insurance"
                        {...register(`benefits.${index}.value`)}
                      />
                      <button
                        type="button"
                        onClick={() => benefitsArray.remove(index)}
                        disabled={benefitsArray.fields.length === 1}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-[#111827] hover:bg-gray-50 disabled:opacity-50"
                        aria-label="Remove benefit"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              data-tour="job-save"
              className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-[#6B7280]"></p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/jobs/${jobId}`)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-[#111827] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || updateJobMutation.isPending}
                  className="rounded-xl bg-[#087F5B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#066B4D] disabled:opacity-50"
                >
                  {isSubmitting || updateJobMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
      <JobOnboarding run={runTour} onComplete={handleOnboardingComplete} />
    </div>
  );
}
