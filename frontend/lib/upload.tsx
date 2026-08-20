"use client";

import React, { useRef, useState, useCallback } from "react";
import { Upload, Loader2 } from "lucide-react";
import { api } from "./api/client";

interface UploadButtonProps {
  endpoint: "cvUploader" | "profilePictureUploader";
  headers?: Record<string, string>;
  onClientUploadComplete?: (res: any[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
}

interface UploadDropzoneProps {
  endpoint: "cvUploader" | "profilePictureUploader";
  headers?: Record<string, string>;
  onClientUploadComplete?: (res: any[]) => void;
  onUploadError?: (error: Error) => void;
  className?: string;
  config?: { mode?: string };
}

function getUploadConfig(endpoint: string) {
  if (endpoint === "cvUploader") {
    return {
      url: "/upload/cv",
      accept: ".pdf,application/pdf",
      label: "Upload CV",
    };
  }
  return {
    url: "/upload/picture",
    accept: "image/*",
    label: "Upload Picture",
  };
}

export function UploadButton({
  endpoint,
  headers,
  onClientUploadComplete,
  onUploadError,
  className,
}: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = getUploadConfig(endpoint);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("accessToken");
        const res = await api.post(config.url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
        });

        const files = res.data.files || [];
        onClientUploadComplete?.(files.map((f: any) => ({ url: f.url, name: f.name, ufsUrl: f.url })));
      } catch (error: any) {
        onUploadError?.(error instanceof Error ? error : new Error(error?.message || "Upload failed"));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [config.url, headers, onClientUploadComplete, onUploadError],
  );

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#087F5B] text-white text-sm font-semibold rounded-xl hover:bg-[#066B4D] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {config.label}
          </>
        )}
      </button>
    </div>
  );
}

export function UploadDropzone({
  endpoint,
  headers,
  onClientUploadComplete,
  onUploadError,
  className,
}: UploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = getUploadConfig(endpoint);

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("accessToken");
        const res = await api.post(config.url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
          },
        });

        const files = res.data.files || [];
        onClientUploadComplete?.(files.map((f: any) => ({ url: f.url, name: f.name, ufsUrl: f.url })));
      } catch (error: any) {
        onUploadError?.(error instanceof Error ? error : new Error(error?.message || "Upload failed"));
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [config.url, headers, onClientUploadComplete, onUploadError],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-all ${
          isDragging
            ? "border-[#087F5B] bg-[#087F5B]/5"
            : "border-gray-200 hover:border-[#087F5B]"
        } ${className || ""}`}
      >
        {uploading ? (
          <>
            <Loader2 className="w-10 h-10 text-[#087F5B] animate-spin mb-3" />
            <p className="text-sm font-semibold text-[#087F5B]">Uploading...</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-[#087F5B] mb-3" />
            <p className="text-sm font-semibold text-[#087F5B] mb-1">
              Drop your file here or click to browse
            </p>
            <p className="text-xs text-gray-400">
              {endpoint === "cvUploader" ? "PDF up to 32MB" : "Image up to 8MB"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
