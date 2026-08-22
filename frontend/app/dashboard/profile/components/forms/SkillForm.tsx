"use client";

import React from "react";
import { Skill } from "../SkillsSection";

interface SkillFormProps {
  initialData?: Skill;
  onSubmit: (data: Skill) => void;
  onDelete?: () => void;
}

export default function SkillForm({ initialData, onSubmit, onDelete }: SkillFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Skill = {
      name: formData.get("name") as string,
      level: formData.get("level") as Skill["level"],
      yearsOfExperience: parseInt(formData.get("yearsOfExperience") as string),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Skill Name</label>
        <input 
          name="name" 
          defaultValue={initialData?.name} 
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
          required 
          placeholder="e.g. React"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#111827]">Level</label>
          <select 
            name="level" 
            defaultValue={initialData?.level || "Intermediate"} 
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Expert">Expert</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#111827]">Years of Experience</label>
          <input 
            name="yearsOfExperience" 
            type="number" 
            defaultValue={initialData?.yearsOfExperience || 0} 
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
            required 
          />
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button type="submit" className="flex-1 py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm">
          Save Skill
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="px-6 py-4 bg-red-50 text-red-500 rounded-[10px] font-bold uppercase tracking-widest text-sm">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
