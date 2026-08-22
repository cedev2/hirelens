"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

type Experience = {
  company?: string;
  role?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  technologies?: string[];
  IsCurrent?: boolean;
  _id?: string;
};

type Talent = {
  _id: string;
  userId?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
  location?: {
    city?: string;
    country?: string;
  };
  experience?: Experience[] | string;
  skills?: string[];
  jobType?: string;
  status?: "available" | "hired" | "interviewing" | "unavailable";
};

function statusClasses(status?: string) {
  if (status === "hired" || status === "Shortlisted")
    return "bg-green-100 text-green-700";
  if (status === "unavailable" || status === "Rejected")
    return "bg-red-100 text-red-700";
  if (status === "interviewing") return "bg-green-100 text-green-700";
  return "bg-yellow-100 text-yellow-700";
}

function formatStatus(status?: string) {
  if (!status) return "Available";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminRecentApplicationsTable() {
  const { data: talents, isLoading } = useQuery<Talent[]>({
    queryKey: ["admin-talents"],
    queryFn: async () => {
      const res = await api.get("/talents");
      return res.data?.talents.slice(0, 4) || [];
    },
  });

  const rows = talents || [];

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#087F5B] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[#111827]">Talents</p>
          <p className="text-sm text-[#6B7280]">Recent talents</p>
        </div>
        {/* <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#111827] hover:bg-gray-50">
          Filter &amp; Sort
        </button> */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="text-left text-xs font-semibold text-[#6B7280]">
              <th className="pb-3 w-[40%]">Talent Name</th>
              <th className="pb-3">Experience</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                  Loading talents...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[#6B7280]">
                  No talents found
                </td>
              </tr>
            ) : (
              rows.map((talent) => {
                const fullName = talent.userId
                  ? `${talent.userId.firstName || ""} ${talent.userId.lastName || ""}`.trim()
                  : "Unknown";
                const avatarUrl =
                  talent.userId?.picture || "/images/companies/dummy.jpg";

                return (
                  <tr key={talent._id} className="border-t border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={avatarUrl}
                            alt={fullName}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">
                            {fullName || "Unknown Talent"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-[#111827]">
                      {Array.isArray(talent.experience) &&
                      talent.experience.length > 0
                        ? `${talent.experience.length} yrs exp`
                        : typeof talent.experience === "string"
                          ? talent.experience
                          : "Not specified"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`rounded-md px-3 py-1 text-xs font-semibold ${statusClasses(talent.status)}`}
                      >
                        {formatStatus(talent.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
