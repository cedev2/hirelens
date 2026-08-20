"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { UserRound, UsersRound } from "lucide-react";

type Slice = {
  label: string;
  value: number;
  color: string;
  icon: "single" | "group";
};

export default function AdminCandidateCompositionChart({
  data,
  totalLabel,
}: {
  data: Slice[];
  totalLabel: string;
}) {
  const total = data.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-lg font-semibold text-[#25324B]">
          Candidate Composition
        </p>
        <p className="text-sm text-[#7C8493]">Distribution of applicants</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                }}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={2}
                stroke="transparent"
              >
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {data.map((slice) => {
            const pct =
              total === 0 ? 0 : Math.round((slice.value / total) * 100);
            return (
              <div
                key={slice.label}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#F8F8FD] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-9 w-9 place-items-center rounded-full"
                    style={{ backgroundColor: `${slice.color}1A` }}
                  >
                    <UserRound
                      className="h-5 w-5"
                      style={{ color: slice.color }}
                    />
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-[#25324B]">
                      {slice.label}
                    </p>
                    <p className="text-xs text-[#7C8493]">
                      {slice.value} candidates
                    </p>
                  </div>
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: slice.color }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-[#7C8493]">{totalLabel}</p>
      </div>
    </div>
  );
}
