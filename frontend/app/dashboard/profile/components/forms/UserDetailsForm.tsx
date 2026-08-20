"use client";

import React, { useState, useRef } from "react";
import { UploadButton } from "@/lib/upload";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface UserDetailsFormProps {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    headline: string;
    location: string;
    socialLinks: string[];
    picture?: string | null;
  };
  onSubmit: (data: any) => void;
}

export default function UserDetailsForm({
  initialData,
  onSubmit,
}: UserDetailsFormProps) {
  const [pictureUrl, setPictureUrl] = useState(initialData.picture || "");
  const queryClient = useQueryClient();
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      headline: formData.get("headline") as string,
      location: formData.get("location") as string,
      socialLinks: [
        formData.get("linkedin") as string,
        formData.get("github") as string,
      ].filter(Boolean),
      picture: pictureUrl,
    };
    onSubmit(data);
  };

  const linkedin =
    initialData.socialLinks.find((l) => l.includes("linkedin")) || "";
  const github =
    initialData.socialLinks.find((l) => l.includes("github")) || "";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture Upload */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-[#087F5B] to-[#12A66A] p-1">
            {pictureUrl ? (
              <div className="w-full h-full rounded-full bg-white overflow-hidden">
                <img
                  src={pictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>
        <div className="mt-3">
          <UploadButton
            endpoint="profilePictureUploader"
            headers={{
              Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
            }}
            onClientUploadComplete={(res) => {
              if (res && res[0]?.ufsUrl) {
                setPictureUrl(res[0].ufsUrl);
                queryClient.invalidateQueries({ queryKey: ["user", "me"] });
                queryClient.invalidateQueries({ queryKey: ["talent", "me"] });
                toast.success("Profile picture uploaded!");

                // Scroll to save button after a short delay to ensure UI updated
                setTimeout(() => {
                  submitButtonRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }, 300);
              }
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`);
            }}
            className="ut-button:bg-[#087F5B] ut-button:text-white ut-button:rounded-full ut-button:px-4 ut-button:py-2 ut-button:text-sm ut-button:font-bold ut-button:hover:bg-[#066B4D] ut-button:transition-all ut-button:shadow-lg"
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Click to upload a new picture
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">First Name</label>
          <input
            name="firstName"
            defaultValue={initialData.firstName}
            className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">Last Name</label>
          <input
            name="lastName"
            defaultValue={initialData.lastName}
            className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#25324B]">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={initialData.email}
          className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#25324B]">Headline</label>
        <input
          name="headline"
          defaultValue={initialData.headline}
          className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-[#25324B]">Location</label>
        <input
          name="location"
          defaultValue={initialData.location}
          className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">
            LinkedIn URL
          </label>
          <input
            name="linkedin"
            defaultValue={linkedin}
            className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#25324B]">GitHub URL</label>
          <input
            name="github"
            defaultValue={github}
            className="w-full p-4 bg-gray-50 outline-none rounded-xl border-none focus:ring-2 focus:ring-[#087F5B]"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
      <button
        ref={submitButtonRef}
        type="submit"
        className="w-full py-4 bg-[#087F5B] text-white rounded-[10px] font-bold uppercase tracking-widest text-sm hover:bg-[#066B4D] transition-all shadow-lg shadow-green-100"
      >
        Save Profile Details
      </button>
    </form>
  );
}
