"use client";

import React from "react";
import { Language } from "../LanguagesSection";

interface LanguageFormProps {
  initialData?: Language;
  onSubmit: (data: Language) => void;
  onDelete?: () => void;
}

export default function LanguageForm({ initialData, onSubmit, onDelete }: LanguageFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Language = {
      name: formData.get("name") as string,
      proficiency: formData.get("proficiency") as Language["proficiency"],
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Language</label>
        <input 
          name="name" 
          defaultValue={initialData?.name} 
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
          required 
          placeholder="e.g. English"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Proficiency</label>
        <select 
          name="proficiency" 
          defaultValue={initialData?.proficiency || "Conversational"} 
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
          required
        >
          <option value="Basic">Basic</option>
          <option value="Conversational">Conversational</option>
          <option value="Fluent">Fluent</option>
          <option value="Native">Native</option>
        </select>
      </div>
      <div className="flex gap-4 pt-4">
        <button type="submit" className="flex-1 py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm">
          Save Language
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
