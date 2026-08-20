"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  MapPin,
  Briefcase,
  Users,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api/client";
import SafeHtml from "@/app/components/SafeHtml";
import { BsCash } from "react-icons/bs";

type JobDetails = {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  benefits: string[];
  weights: { skills: number; experience: number; education: number };
  deadline: string;
  jobType: "full-time" | "part-time";
  locationType: "on-site" | "hybrid" | "remote";
  salary: { amount: number; currency: "USD" | "RWF" };
  stats: { applicants: number; views: number; postedAt: string };
  status: "Open" | "Closed" | "Draft";
  locationLabel: string;
};

function badgeClasses(status: JobDetails["status"]) {
  if (status === "Open") return "border-green-200 bg-green-100 text-green-700";
  if (status === "Closed") return "border-gray-200 bg-gray-100 text-gray-700";
  return "border-amber-200 bg-amber-100 text-amber-700";
}

type BackendJob = {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  weights?: { skills?: number; experience?: number; education?: number };
  deadline?: string | Date;
  jobType?: "full-time" | "part-time";
  locationType?: "on-site" | "hybrid" | "remote";
  salary?: { amount?: number; currency?: "USD" | "RWF" };
  status?: "open" | "closed" | "draft";
  createdAt?: string;
};

type BackendApplication = {
  _id?: string;
  id?: string;
  jobId?: string;
};

function formatDate(value: string | Date | undefined) {
  if (!value) return "HireLens";
  const dt = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(dt.getTime())) return "HireLens";
  return dt.toISOString().slice(0, 10);
}

function mapStatus(
  status: BackendJob["status"],
  deadline: BackendJob["deadline"],
) {
  if (status === "draft") return "Draft" as const;
  if (status === "closed") return "Closed" as const;
  if (status === "open") return "Open" as const;

  if (!deadline) return "Open" as const;
  const dt = typeof deadline === "string" ? new Date(deadline) : deadline;
  if (Number.isNaN(dt.getTime())) return "Open" as const;
  return dt.getTime() >= Date.now() ? ("Open" as const) : ("Closed" as const);
}

export default function AdminJobDetailsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? "";

  const jobQuery = useQuery({
    queryKey: ["admin", "job", jobId],
    enabled: Boolean(jobId),
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return (res.data?.job ?? null) as BackendJob | null;
    },
    staleTime: 30_000,
  });

  const applicationsQuery = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const res = await api.get("/applications");
      const applications = (res.data?.applications ??
        []) as BackendApplication[];
      return Array.isArray(applications) ? applications : [];
    },
    staleTime: 30_000,
  });

  const job = useMemo((): JobDetails | null => {
    const raw = jobQuery.data;
    if (!raw) return null;

    const id = String(raw?._id ?? raw?.id ?? jobId).trim();
    const deadline = raw?.deadline;

    const applications = applicationsQuery.data ?? [];
    const applicants = applications.filter((a) => a?.jobId === id).length;

    return {
      id,
      title: String(raw?.title ?? "Untitled job"),
      company: "HireLens",
      description: String(raw?.description ?? ""),
      requirements: Array.isArray(raw?.requirements) ? raw.requirements : [],
      benefits: Array.isArray(raw?.benefits) ? raw.benefits : [],
      weights: {
        skills: Number(raw?.weights?.skills ?? 0),
        experience: Number(raw?.weights?.experience ?? 0),
        education: Number(raw?.weights?.education ?? 0),
      },
      deadline: formatDate(deadline),
      jobType: (raw?.jobType ?? "full-time") as JobDetails["jobType"],
      locationType: (raw?.locationType ??
        "remote") as JobDetails["locationType"],
      salary: {
        amount: Number(raw?.salary?.amount ?? 0),
        currency: (raw?.salary?.currency ??
          "USD") as JobDetails["salary"]["currency"],
      },
      stats: { applicants, views: 0, postedAt: formatDate(raw?.createdAt) },
      status: mapStatus(raw?.status, deadline),
      locationLabel: String(raw?.locationType ?? "HireLens"),
    };
  }, [applicationsQuery.data, jobId, jobQuery.data]);

  const isLoading = jobQuery.isLoading || applicationsQuery.isLoading;
  const errorMessage =
    (jobQuery.error as any)?.message ||
    (applicationsQuery.error as any)?.message ||
    null;

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          Failed to load job. {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm font-semibold text-[#25324B]">
          Loading job...
        </div>
      )}

      {!isLoading && !job && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm font-semibold text-[#25324B]">
          Job not found.
        </div>
      )}

      {!isLoading && job && (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link
                  href="/admin/jobs"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#087F5B]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Jobs
                </Link>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <p className="text-2xl font-bold text-[#25324B]">
                    {job.title}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClasses(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-[#7C8493]">{job.company}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#25324B]">
                    <MapPin className="h-3.5 w-3.5 text-[#7C8493]" />
                    {job.locationType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#25324B]">
                    <Briefcase className="h-3.5 w-3.5 text-[#7C8493]" />
                    {job.jobType}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#25324B]">
                    <CalendarDays className="h-3.5 w-3.5 text-[#7C8493]" />
                    Deadline: {job.deadline}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/jobs/${jobId}/screening`}
                  className="rounded-xl border border-green-200 bg-green-50 px-5 py-2 text-sm font-semibold text-[#087F5B] hover:bg-green-100 transition-colors"
                >
                  Start AI Screening
                </Link>
                <Link
                  href={`/admin/jobs/${jobId}/edit`}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-[#25324B] hover:bg-gray-50"
                >
                  Edit job
                </Link>
                <Link
                  href={`/admin/jobs/${jobId}/applications`}
                  className="rounded-xl bg-[#087F5B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#066B4D]"
                >
                  View applications
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-[10px] border border-gray-100 bg-[#F8F8FD] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7C8493]">
                  <Users className="h-4 w-4" />
                  Applicants
                </div>
                <p className="mt-2 text-2xl font-bold text-[#25324B]">
                  {job.stats.applicants}
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-100 bg-[#F8F8FD] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7C8493]">
                  <Eye className="h-4 w-4" />
                  Views
                </div>
                <p className="mt-2 text-2xl font-bold text-[#25324B]">
                  {job.stats.views}
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-100 bg-[#F8F8FD] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7C8493]">
                  <BsCash className="h-4 w-4" />
                  Salary
                </div>
                <p className="mt-2 text-2xl font-bold text-[#25324B]">
                  {job.salary.amount.toLocaleString()} {job.salary.currency}
                </p>
              </div>
              <div className="rounded-[10px] border border-gray-100 bg-[#F8F8FD] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#7C8493]">
                  <ShieldCheck className="h-4 w-4" />
                  Weights
                </div>
                <p className="mt-2 text-sm font-semibold text-[#25324B]">
                  Skills {job.weights.skills * 100}% • Exp{" "}
                  {job.weights.experience * 100}% • Edu{" "}
                  {job.weights.education * 100}%
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-5">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-lg font-semibold text-[#25324B]">
                  Description
                </p>
                <SafeHtml
                  html={job.description}
                  className="mt-3 text-sm leading-6 text-[#25324B]"
                />
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-lg font-semibold text-[#25324B]">
                  Requirements
                </p>
                <div className="mt-4 space-y-2">
                  {job.requirements.map((r, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-100 bg-[#F8F8FD] px-4 py-3 text-sm text-[#25324B]"
                    >
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-lg font-semibold text-[#25324B]">Benefits</p>
                <div className="mt-4 space-y-2">
                  {job.benefits.length ? (
                    job.benefits.map((b, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-100 bg-[#F8F8FD] px-4 py-3 text-sm text-[#25324B]"
                      >
                        {b}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#7C8493]">
                      No benefits listed.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-lg font-semibold text-[#25324B]">Meta</p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C8493]">Job ID</span>
                    <span className="font-semibold text-[#25324B]">
                      {job.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C8493]">Posted</span>
                    <span className="font-semibold text-[#25324B]">
                      {job.stats.postedAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C8493]">Location label</span>
                    <span className="font-semibold text-[#25324B]">
                      {job.locationLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
