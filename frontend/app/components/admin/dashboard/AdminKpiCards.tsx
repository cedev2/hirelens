"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Paperclip,
  Plus,
  UserSquare2,
} from "lucide-react";

type Card = {
  label: string;
  value: number;
  href?: string;
  variant: "blue" | "navy" | "green" | "sky";
  icon: ReactNode;
  right?: ReactNode;
};

function variantClasses(variant: Card["variant"]) {
  if (variant === "blue") return "bg-[#087F5B]";
  if (variant === "navy") return "bg-[#0B1B3A]";
  if (variant === "green") return "bg-[#16A34A]";
  return "bg-[#60A5FA]";
}

export default function AdminKpiCards({
  totalJobs,
  openJobs,
  totalApplications,
  candidates,
}: {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  candidates: number;
}) {
  const cards: Card[] = [
    {
      label: "Total Jobs",
      value: totalJobs,
      href: "/admin/jobs",
      variant: "blue",
      icon: <Briefcase className="h-[90px] w-[90px] text-white/90" />,
      right: <ArrowUpRight className="h-5 w-5 text-white/90" />,
    },
    {
      label: "Open Jobs",
      value: openJobs,
      href: "/admin/jobs?status=open",
      variant: "green",
      icon: <FileText className="h-[90px] w-[90px] text-white/90" />,
      right: <ArrowUpRight className="h-5 w-5 text-white/90" />,
    },
    {
      label: "Applications",
      value: totalApplications,
      href: "/admin/applications",
      variant: "navy",
      icon: <Paperclip className="h-[90px] w-[90px] text-white/90" />,
      right: <ArrowUpRight className="h-5 w-5 text-white/90" />,
    },
    {
      label: "Talents",
      value: candidates,
      href: "/admin/candidates",
      variant: "sky",
      icon: <UserSquare2 className="h-[90px] w-[90px] text-white/90" />,
      right: <ArrowUpRight className="h-5 w-5 text-white/90" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const content = (
          <div
            className={`${variantClasses(card.variant)} relative overflow-hidden rounded-xl p-4 text-white shadow-sm flex justify-between items-center min-h-[100px]`}
          >
            <div className="flex items-start justify-between">
              <div className="absolute top-2 left-2 opacity-20">
                {card.icon}
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm font-medium text-white/80">{card.label}</p>
              {card.label === "Create New Job" ? (
                <p className="mt-1 text-2xl font-bold">&nbsp;</p>
              ) : (
                <p className="mt-1 text-5xl font-bold">{card.value}</p>
              )}
            </div>
            <div className="pointer-events-none absolute -right-[80px] -top-[110px] h-40 w-40 rounded-full bg-white/10" />
            {/* <div className="pointer-events-none absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/10" /> */}
          </div>
        );

        return card.href ? (
          <Link key={card.label} href={card.href} className="block">
            {content}
          </Link>
        ) : (
          <div key={card.label}>{content}</div>
        );
      })}
    </div>
  );
}
