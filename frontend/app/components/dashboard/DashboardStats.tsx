import type { ReactNode } from "react";

type StatCard = {
  label: string;
  value: number;
  icon: ReactNode;
  className: string;
};

export default function DashboardStats({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`relative overflow-hidden rounded-[10px] p-5 text-white shadow-sm ${s.className}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-[10px] bg-white/15 grid place-items-center">
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-white/80">{s.label}</p>
                <p className="text-2xl font-semibold">{s.value}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
