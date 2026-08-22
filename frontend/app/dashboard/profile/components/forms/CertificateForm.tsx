"use client";

import React, { useState } from "react";

interface CertificateFormProps {
  initialData?: {
    name: string;
    issuer: string;
    issueDate: string;
  };
  onSubmit: (data: { name: string; issuer: string; issueDate: string }) => void;
  onCancel: () => void;
}

export default function CertificateForm({
  initialData,
  onSubmit,
  onCancel,
}: CertificateFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [issuer, setIssuer] = useState(initialData?.issuer || "");
  const [issueDate, setIssueDate] = useState(initialData?.issueDate?.split("T")[0] || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, issuer, issueDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Certificate Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          placeholder="AWS Solutions Architect"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Issuing Organization</label>
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          placeholder="Amazon Web Services"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#111827]">Issue Date</label>
        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          required
        />
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 bg-gray-100 text-[#111827] rounded-[10px] font-bold text-sm hover:bg-gray-200 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-4 bg-[#087F5B] text-white rounded-[10px] font-bold text-sm hover:bg-[#066B4D] transition-all"
        >
          Save Certificate
        </button>
      </div>
    </form>
  );
}
