"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DataPoint = {
  label: string;
  posted: number;
  applications: number;
};

export default function AdminJobStatisticsChart({
  data,
  rangeLabel,
}: {
  data: DataPoint[];
  rangeLabel: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-[#25324B]">Job Statistics</p>
          <p className="text-sm text-[#7C8493]">Posted vs applications</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#C7D2FE]" />
              <span className="text-[#7C8493]">Jobs Posted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
              <span className="text-[#7C8493]">Job Applied</span>
            </div>
          </div>
          <span className="rounded-lg bg-[#E8F7F0] px-3 py-2 text-xs font-semibold text-[#087F5B] hidden">
            {rangeLabel}
          </span>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={18}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#EEF2FF"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
              }}
              labelStyle={{ color: "#111827", fontWeight: 600 }}
              itemStyle={{ color: "#111827" }}
            />
            <Bar dataKey="posted" fill="#C7D2FE" radius={[8, 8, 8, 8]} />
            <Bar dataKey="applications" fill="#4F46E5" radius={[8, 8, 8, 8]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
