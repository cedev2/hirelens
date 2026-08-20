import Image from "next/image";
import { Timer } from "lucide-react";

type Deadline = {
  name: string;
  company: string;
  time: string;
  avatar: string;
};

export default function UpcomingDeadlines({
  deadlines,
}: {
  deadlines: Deadline[];
}) {
  return (
    <div className="rounded-[10px] bg-white border border-gray-100 p-6">
      <p className="text-lg font-semibold text-[#25324B]">Upcoming Deadlines</p>

      <div className="mt-4 space-y-3">
        {deadlines.map((d) => (
          <div
            key={d.name}
            className="flex items-center justify-between rounded-[10px] bg-[#F8F8FD] px-2 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10">
                <Image
                  src={d.avatar}
                  alt=""
                  width={50}
                  height={50}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-[#25324B] line-clamp-1">
                  {d.name}
                </p>
                <p className="text-xs text-[#7C8493]">{d.company}</p>
              </div>
            </div>
            <div className="text-xs text-[#087F5B] font-medium inline-flex items-center gap-1">
              <Timer className="h-4 w-4" />
              {new Date(d.time).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
