"use client";

import React from "react";
import { Experience } from "../ExperienceSection";

interface ExperienceFormProps {
  initialData?: Experience;
  onSubmit: (data: Experience) => void;
  onDelete?: () => void;
}

export default function ExperienceForm({
  initialData,
  onSubmit,
  onDelete,
}: ExperienceFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Experience = {
      company: formData.get("company") as string,
      role: formData.get("role") as string,
      startDate: formData.get("startDate") as string,
      endDate: (formData.get("endDate") as string) || undefined,
      description: formData.get("description") as string,
      technologies: (formData.get("technologies") as string)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      IsCurrent: formData.get("IsCurrent") === "on",
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">Job Role</label>
          <input
            name="role"
            defaultValue={initialData?.role}
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            required
            placeholder="e.g. Senior Frontend Engineer"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">Company</label>
          <input
            name="company"
            defaultValue={initialData?.company}
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            required
            placeholder="e.g. HireLens"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">Start Date</label>
          <input
            name="startDate"
            type="date"
            defaultValue={
              initialData?.startDate ? String(initialData.startDate) : ""
            }
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">End Date</label>
          <input
            name="endDate"
            type="date"
            defaultValue={
              initialData?.endDate ? String(initialData.endDate) : ""
            }
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            disabled={initialData?.IsCurrent}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#25324B]">Description</label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B] h-32"
          required
          placeholder="Describe your responsibilities and achievements..."
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#25324B]">
          Technologies (comma separated)
        </label>
        <input
          name="technologies"
          defaultValue={initialData?.technologies.join(", ")}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          placeholder="React, Node.js, etc"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          name="IsCurrent"
          type="checkbox"
          defaultChecked={initialData?.IsCurrent}
          className="w-4 h-4 rounded text-[#087F5B]"
        />
        <label className="text-sm font-bold text-[#25324B]">
          Currently working here
        </label>
      </div>
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          className="flex-1 py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm"
        >
          Save Experience
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="px-6 py-4 bg-red-50 text-red-500 rounded-[10px] font-bold uppercase tracking-widest text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
