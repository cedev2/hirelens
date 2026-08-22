"use client";

import { useMemo, type ReactNode } from "react";
import { Briefcase, CheckCircle2, FileText, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

import DashboardRightSidebar from "@/app/components/dashboard/DashboardRightSidebar";
import DashboardStats from "@/app/components/dashboard/DashboardStats";
import JobRecommendations from "@/app/components/dashboard/JobRecommendations";
import "@aejkatappaja/phantom-ui";

type StatCard = {
  label: string;
  value: number;
  icon: ReactNode;
  className: string;
};

type BackendJob = {
  _id: string;
  title: string;
  description: string;
  locationType: string;
  jobType: string;
  deadline: string;
  createdAt: string;
  salary?: { amount: number; currency: string };
  requirements?: string[];
};

type BackendApplication = {
  _id: string;
  jobId: string;
  talentId: string;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const talentQuery = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
  });

  const talentId = talentQuery.data?._id;

  const jobsQuery = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const res = await api.get("/jobs");
      return (res.data?.jobs ?? []) as BackendJob[];
    },
    staleTime: 60_000,
  });

  const applicationsQuery = useQuery({
    queryKey: ["applications", talentId],
    queryFn: async () => {
      const res = await api.get(`/applications/talent/${talentId}`);
      return (res.data?.applications ?? []) as BackendApplication[];
    },
    enabled: !!talentId,
    staleTime: 30_000,
  });

  const jobs = jobsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];

  const stats = useMemo((): StatCard[] => {
    const totalJobs = jobs.length;
    const totalApplications = applications.length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const accepted = applications.filter((a) => a.status === "accepted").length;

    return [
      {
        label: "Total Jobs",
        value: totalJobs,
        icon: <Briefcase className="h-6 w-6 text-white/90" />,
        className: "bg-[#087F5B]",
      },
      {
        label: "Applications",
        value: totalApplications,
        icon: <FileText className="h-6 w-6 text-white/90" />,
        className: "bg-[#0B1324]",
      },
      {
        label: "Rejected",
        value: rejected,
        icon: <XCircle className="h-6 w-6 text-white/90" />,
        className: "bg-[#ff3333]",
      },
      {
        label: "Accepted",
        value: accepted,
        icon: <CheckCircle2 className="h-6 w-6 text-white/90" />,
        className: "bg-[#20C46A]",
      },
    ];
  }, [jobs, applications]);

  const recommendedJobs = useMemo(() => {
    return jobs.slice(0, 4).map((j) => {
      const deadline = new Date(j.deadline);
      const daysLeft = Math.max(
        0,
        Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      );

      const hasApplied = applications.some((app) => app.jobId === j._id);

      return {
        id: j._id,
        title: j.title,
        company: "HireLens",
        description: j.description,
        location: j.locationType === "remote" ? "Remote" : "Rwanda",
        type: (j.jobType.charAt(0).toUpperCase() + j.jobType.slice(1)) as any,
        daysLeft,
        mode: j.locationType,
        salary: j.salary
          ? `${j.salary.currency} ${j.salary.amount.toLocaleString()}`
          : "Competitive",
        postedAt: new Date(j.createdAt).toLocaleDateString(),
        tags: j.requirements || [],
        status: hasApplied ? "Applied" : "Open",
      };
    });
  }, [jobs, applications]);

  const allDeadlines = useMemo(() => {
    return jobs
      .filter((j) => new Date(j.deadline).getTime() > Date.now())
      .sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
      )
      .map((j) => ({
        name: j.title,
        company: "HireLens",
        time: j.deadline,
        avatar: "/images/logo/hirelens.jpg",
      }));
  }, [jobs]);

  const deadlines = useMemo(() => {
    return allDeadlines.slice(0, 3);
  }, [allDeadlines]);

  return (
    <phantom-ui loading={jobsQuery.isLoading} animation="shimmer">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-3">
        <div className="space-y-8 min-w-0">
          <DashboardStats stats={stats} />
          {/* @ts-ignore */}
          <JobRecommendations jobs={recommendedJobs} />
        </div>

        <DashboardRightSidebar
          deadlines={deadlines}
          allDeadlines={allDeadlines}
        />
      </div>
    </phantom-ui>
  );
}
