"use client";

import React from "react";

interface SocialsFormProps {
  initialData: {
    socialLinks: string[];
  };
  onSubmit: (data: { socialLinks: string[] }) => void;
}

export default function SocialsForm({ initialData, onSubmit }: SocialsFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      socialLinks: [
        formData.get("linkedin") as string,
        formData.get("github") as string,
      ].filter(Boolean),
    };
    onSubmit(data);
  };

  const linkedin = initialData.socialLinks.find(l => l.includes("linkedin")) || "";
  const github = initialData.socialLinks.find(l => l.includes("github")) || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">LinkedIn Profile URL</label>
          <input 
            name="linkedin" 
            defaultValue={linkedin} 
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">GitHub Profile URL</label>
          <input 
            name="github" 
            defaultValue={github} 
            className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]" 
            placeholder="https://github.com/username"
          />
        </div>
      </div>
      <button type="submit" className="w-full py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm">
        Save Social Links
      </button>
    </form>
  );
}
