"use client";

import { useParams } from "next/navigation";
import AdminJobApplicationsPage from "@/app/components/admin/applications/AdminJobApplicationsPage";

export default function JobApplicationsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? "";

  return <AdminJobApplicationsPage jobId={jobId} />;
}
