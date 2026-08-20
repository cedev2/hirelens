"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardCalendarProps {
  deadlines?: {
    name: string;
    company: string;
    time: string;
    avatar: string;
  }[];
}

export default function DashboardCalendar({
  deadlines = [],
}: DashboardCalendarProps) {
  const [value, onChange] = useState<any>(new Date());

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const hasDeadline = deadlines.some((d) => {
      const deadlineDate = new Date(d.time);
      return (
        deadlineDate.getDate() === date.getDate() &&
        deadlineDate.getMonth() === date.getMonth() &&
        deadlineDate.getFullYear() === date.getFullYear()
      );
    });

    if (hasDeadline) {
      return (
        <div className="flex justify-center mt-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[10px] bg-white border border-gray-100 p-6 calendar-container">
      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
        }
        .calendar-container .react-calendar__navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .calendar-container .react-calendar__navigation button {
          min-width: 36px;
          height: 36px;
          background: none;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
          display: grid;
          place-items: center;
        }
        .calendar-container .react-calendar__navigation button:enabled:hover {
          background-color: #f8fafc;
        }
        .calendar-container .react-calendar__navigation__label {
          font-weight: 600;
          color: #25324b;
          font-size: 1rem;
        }
        .calendar-container .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
          font-weight: 600;
          font-size: 0.75rem;
          color: #7c8493;
          margin-bottom: 0.5rem;
        }
        .calendar-container .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
          background: #f8f8fd;
          border-radius: 8px;
          margin: 0 2px;
        }
        .calendar-container
          .react-calendar__month-view__weekdays__weekday
          abbr {
          text-decoration: none;
        }
        .calendar-container .react-calendar__tile {
          padding: 0.75rem 0.5rem;
          text-align: center;
          font-size: 0.875rem;
          color: #25324b;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .calendar-container .react-calendar__tile--now {
          background: #E8F7F0 !important;
          color: #087F5B !important;
          font-weight: 600;
        }
        .calendar-container .react-calendar__tile--active {
          background: #087F5B !important;
          color: white !important;
          font-weight: 600;
        }
        .calendar-container .react-calendar__tile:enabled:hover {
          background-color: #f8fafc;
        }
        .calendar-container
          .react-calendar__month-view__days__day--neighboringMonth {
          color: #cbd5e1;
        }
        .calendar-container .react-calendar__navigation__next2-button,
        .calendar-container .react-calendar__navigation__prev2-button {
          display: none;
        }
      `}</style>
      <Calendar
        onChange={onChange}
        value={value}
        tileContent={tileContent}
        prevLabel={<ChevronLeft className="h-4 w-4 text-gray-600" />}
        nextLabel={<ChevronRight className="h-4 w-4 text-gray-600" />}
        formatShortWeekday={(locale, date) =>
          ["S", "M", "T", "W", "T", "F", "S"][date.getDay()]
        }
      />
    </div>
  );
}
