import type { ReactNode } from "react";

type StatCard = {
  label: string;
  value: number;
  icon: ReactNode;
  className: string;
};

export default function DashboardStats({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`relative overflow-hidden rounded-[10px] p-3 sm:p-5 text-white shadow-sm ${s.className}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-[10px] bg-white/15 grid place-items-center">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-white/80 truncate">
                  {s.label}
                </p>
                <p className="text-xl sm:text-2xl font-semibold">{s.value}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
