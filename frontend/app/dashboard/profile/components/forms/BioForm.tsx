"use client";

import React from "react";

interface BioFormProps {
  initialData: string;
  onSubmit: (bio: string) => void;
}

export default function BioForm({ initialData, onSubmit }: BioFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSubmit(formData.get("bio") as string);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Bio</label>
        <textarea 
          name="bio" 
          defaultValue={initialData} 
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B] h-48" 
          required 
          placeholder="Write a brief introduction about yourself..."
        />
      </div>
      <button type="submit" className="w-full py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm">
        Save Bio
      </button>
    </form>
  );
}
