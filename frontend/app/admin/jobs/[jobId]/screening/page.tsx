"use client";

import { useParams } from "next/navigation";
import AdminJobScreeningPage from "@/app/components/admin/jobs/AdminJobScreeningPage";

export default function AdminJobScreeningRoutePage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId ?? "";

  return <AdminJobScreeningPage jobId={jobId} />;
}
