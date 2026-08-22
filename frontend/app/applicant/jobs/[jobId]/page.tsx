"use client";

import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  MapPin,
  Clock,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Send,
  Plus,
  Trash2,
  Upload,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { UploadButton } from "@/lib/upload";

type ApplicationFieldKey =
  | "cvUpload"
  | "coverLetter"
  | "skills"
  | "experience"
  | "education"
  | "certifications"
  | "phoneNumber"
  | "location";

type Job = {
  _id: string;
  title: string;
  description: string;
  requirements?: string[];
  jobType: string;
  locationType: string;
  salary?: { amount: number; currency: string };
  benefits?: string[];
  deadline?: string;
  applicationFields?: ApplicationFieldKey[];
};

type SkillEntry = { name: string; level: string; yearsOfExperience: number };
type ExperienceEntry = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string;
  isCurrent: boolean;
};
type EducationEntry = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
};
type CertEntry = { name: string; issuer: string; issueDate: string };

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#087F5B]";
const labelClass = "mb-1 block text-sm font-semibold text-[#111827]";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const user = useSelector((state: any) => state.auth?.user);
  const talentId = user?.talentProfileId;

  const isLoggedIn = !!user;
  useEffect(() => {
    if (!isLoggedIn) {
      toast("Please log in to apply for this job", { icon: "🔐" });
      router.replace(
        `/dashboard/auth/login?redirect=${encodeURIComponent(`/applicant/jobs/${jobId}`)}`
      );
    }
  }, [isLoggedIn, jobId, router]);

  const [coverLetter, setCoverLetter] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>([
    { name: "", level: "Intermediate", yearsOfExperience: 1 },
  ]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([
    { company: "", role: "", startDate: "", endDate: "", description: "", technologies: "", isCurrent: false },
  ]);
  const [education, setEducation] = useState<EducationEntry[]>([
    { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" },
  ]);
  const [certifications, setCertifications] = useState<CertEntry[]>([
    { name: "", issuer: "", issueDate: "" },
  ]);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await api.get(`/jobs/${jobId}`);
      return res.data?.job as Job;
    },
    enabled: !!jobId,
  });

  const { data: talentProfile } = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
    enabled: !!talentId,
  });

  const profileRef = React.useRef(false);
  React.useEffect(() => {
    if (!talentProfile || profileRef.current) return;
    profileRef.current = true;

    const toDateStr = (d: any) => {
      if (!d) return "";
      const dt = new Date(d);
      return isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
    };

    if (talentProfile.cvUrl) {
      setCvUrl(talentProfile.cvUrl);
      setCvFileName("Uploaded CV");
    }
    if (talentProfile.location) setLocation(talentProfile.location);

    if (talentProfile.skills?.length > 0) {
      setSkills(
        talentProfile.skills.map((s: any) => ({
          name: s.name || "",
          level: s.level || "Intermediate",
          yearsOfExperience: s.yearsOfExperience || 1,
        }))
      );
    }

    if (talentProfile.experience?.length > 0) {
      setExperience(
        talentProfile.experience.map((e: any) => ({
          company: e.company || "",
          role: e.role || "",
          startDate: toDateStr(e.startDate),
          endDate: toDateStr(e.endDate),
          description: e.description || "",
          technologies: Array.isArray(e.technologies) ? e.technologies.join(", ") : e.technologies || "",
          isCurrent: e.IsCurrent || !e.endDate,
        }))
      );
    }

    if (talentProfile.education?.length > 0) {
      setEducation(
        talentProfile.education.map((e: any) => ({
          institution: e.institution || "",
          degree: e.degree || "",
          fieldOfStudy: e.fieldOfStudy || "",
          startYear: toDateStr(e.startYear),
          endYear: toDateStr(e.endYear),
        }))
      );
    }

    if (talentProfile.certifications?.length > 0) {
      setCertifications(
        talentProfile.certifications.map((c: any) => ({
          name: c.name || "",
          issuer: c.issuer || "",
          issueDate: toDateStr(c.issueDate),
        }))
      );
    }
  }, [talentProfile]);

  const { data: existingApplications = [] } = useQuery({
    queryKey: ["applicant", "applications", talentId],
    queryFn: async () => {
      if (!talentId) return [];
      const res = await api.get(`/applications/talent/${talentId}`);
      return res.data?.applications ?? [];
    },
    enabled: !!talentId,
  });

  const hasApplied = existingApplications.some(
    (a: any) => a.jobId?._id === jobId || a.jobId === jobId,
  );

  const requiredFields: ApplicationFieldKey[] = job?.applicationFields || [
    "cvUpload", "coverLetter", "skills", "experience", "education", "certifications", "phoneNumber", "location",
  ];

  const isFieldRequired = (key: ApplicationFieldKey) => requiredFields.includes(key);

  const applyMutation = useMutation({
    mutationFn: async () => {
      const payload: any = { jobId, talentId };
      if (isFieldRequired("coverLetter")) payload.coverLetter = coverLetter;
      if (isFieldRequired("cvUpload")) payload.cvUrl = cvUrl;
      if (isFieldRequired("phoneNumber")) payload.phoneNumber = phoneNumber;
      if (isFieldRequired("location")) payload.location = location;
      if (isFieldRequired("skills")) {
        payload.skills = skills
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            level: s.level,
            yearsOfExperience: Number(s.yearsOfExperience),
          }));
      }
      if (isFieldRequired("experience")) {
        payload.experience = experience
          .filter((e) => e.company.trim() && e.role.trim())
          .map((e) => ({
            company: e.company.trim(),
            role: e.role.trim(),
            startDate: e.startDate ? new Date(e.startDate) : new Date(),
            endDate: e.isCurrent ? undefined : e.endDate ? new Date(e.endDate) : undefined,
            description: e.description,
            technologies: e.technologies
              ? e.technologies.split(",").map((t: string) => t.trim()).filter(Boolean)
              : [],
            isCurrent: e.isCurrent,
          }));
      }
      if (isFieldRequired("education")) {
        payload.education = education
          .filter((e) => e.institution.trim() && e.degree.trim())
          .map((e) => ({
            institution: e.institution.trim(),
            degree: e.degree.trim(),
            fieldOfStudy: e.fieldOfStudy.trim(),
            startYear: e.startYear ? new Date(e.startYear) : new Date(),
            endYear: e.endYear ? new Date(e.endYear) : new Date(),
          }));
      }
      if (isFieldRequired("certifications")) {
        payload.certifications = certifications
          .filter((c) => c.name.trim())
          .map((c) => ({
            name: c.name.trim(),
            issuer: c.issuer.trim(),
            issueDate: c.issueDate ? new Date(c.issueDate) : new Date(),
          }));
      }
      const res = await api.post("/applications", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Application submitted!");
      router.push("/applicant/applications");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to apply";
      toast.error(msg);
    },
  });

  const handleApply = () => {
    if (isFieldRequired("cvUpload") && !cvUrl) {
      toast.error("Please upload your CV/Resume");
      return;
    }
    if (isFieldRequired("phoneNumber") && !phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (isFieldRequired("location") && !location.trim()) {
      toast.error("Please enter your location");
      return;
    }
    if (isFieldRequired("skills") && skills.every((s) => !s.name.trim())) {
      toast.error("Please add at least one skill");
      return;
    }
    if (isFieldRequired("experience") && experience.every((e) => !e.company.trim())) {
      toast.error("Please add at least one work experience");
      return;
    }
    if (isFieldRequired("education") && education.every((e) => !e.institution.trim())) {
      toast.error("Please add at least one education entry");
      return;
    }
    applyMutation.mutate();
  };

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        Redirecting to login...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        Loading job details...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Job not found.</p>
        <Link
          href="/applicant/jobs"
          className="text-sm text-[#087F5B] hover:underline mt-2 inline-block"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/applicant/jobs"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#087F5B] mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
        <h1 className="text-3xl font-bold text-[#111827] mb-4">{job.title}</h1>

        <div className="flex items-center gap-5 mb-6 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {job.jobType}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {job.locationType}
          </span>
          {job.salary && (
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              {job.salary.amount?.toLocaleString()} {job.salary.currency}
            </span>
          )}
          {job.deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#111827] mb-3">
            Description
          </h2>
          <div
            className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {job.requirements && job.requirements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#111827] mb-3">
              Requirements
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((req, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 text-sm font-medium rounded-full bg-[#E8F7F0] text-[#087F5B]"
                >
                  {req}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.benefits && job.benefits.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[#111827] mb-3">
              Benefits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {job.benefits.map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle className="h-4 w-4 text-[#087F5B] shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Section */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <h2 className="text-lg font-semibold text-[#111827] mb-2">
          Apply for this position
        </h2>
        <p className="text-xs text-[#6B7280] mb-6">
          Fields marked are required by this job
        </p>

        {hasApplied ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-[#087F5B] mx-auto mb-3" />
            <p className="text-gray-600 font-medium">
              You&apos;ve already applied to this job.
            </p>
            <Link
              href="/applicant/applications"
              className="text-sm text-[#087F5B] hover:underline mt-2 inline-block"
            >
              Track your application
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* CV Upload */}
            {isFieldRequired("cvUpload") && (
              <div>
                <label className={labelClass}>
                  CV / Resume <span className="text-red-500">*</span>
                </label>
                {cvUrl ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-green-200 bg-green-50">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-700 font-medium flex-1 truncate">
                      {cvFileName || "CV uploaded"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCvUrl("");
                        setCvFileName("");
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UploadButton
                      endpoint="cvUploader"
                      headers={{
                        Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("accessToken") : ""}`,
                      }}
                      onClientUploadComplete={(res) => {
                        if (res && res[0]) {
                          setCvUrl(res[0].url);
                          setCvFileName(res[0].name);
                          toast.success("CV uploaded successfully");
                        }
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`);
                      }}
                      className="ut-button:bg-[#087F5B] ut-button:text-white ut-button:rounded-xl ut-button:px-5 ut-button:py-2.5 ut-button:text-sm ut-button:font-semibold ut-button:hover:bg-[#066B4D] ut-button:transition-all ut-button:shadow-lg ut-button:border-0"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Phone Number */}
            {isFieldRequired("phoneNumber") && (
              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  className={fieldClass}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +250 788 123 456"
                />
              </div>
            )}

            {/* Location */}
            {isFieldRequired("location") && (
              <div>
                <label className={labelClass}>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={fieldClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kigali, Rwanda"
                />
              </div>
            )}

            {/* Skills */}
            {isFieldRequired("skills") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSkills([
                        ...skills,
                        { name: "", level: "Intermediate", yearsOfExperience: 1 },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F5B] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Skill
                  </button>
                </div>
                <div className="space-y-2">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className={fieldClass}
                        placeholder="Skill name"
                        value={skill.name}
                        onChange={(e) => {
                          const next = [...skills];
                          next[idx].name = e.target.value;
                          setSkills(next);
                        }}
                      />
                      <select
                        className={`${fieldClass} w-36`}
                        value={skill.level}
                        onChange={(e) => {
                          const next = [...skills];
                          next[idx].level = e.target.value;
                          setSkills(next);
                        }}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Expert</option>
                      </select>
                      <input
                        type="number"
                        className={`${fieldClass} w-24`}
                        min={0}
                        placeholder="Years"
                        value={skill.yearsOfExperience}
                        onChange={(e) => {
                          const next = [...skills];
                          next[idx].yearsOfExperience = Number(e.target.value);
                          setSkills(next);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                        disabled={skills.length === 1}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-[#111827] hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Work Experience */}
            {isFieldRequired("experience") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Work Experience <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setExperience([
                        ...experience,
                        { company: "", role: "", startDate: "", endDate: "", description: "", technologies: "", isCurrent: false },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F5B] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Experience
                  </button>
                </div>
                <div className="space-y-4">
                  {experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#6B7280]">
                          Experience #{idx + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                          disabled={experience.length === 1}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          className={fieldClass}
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => {
                            const next = [...experience];
                            next[idx].company = e.target.value;
                            setExperience(next);
                          }}
                        />
                        <input
                          className={fieldClass}
                          placeholder="Role / Title"
                          value={exp.role}
                          onChange={(e) => {
                            const next = [...experience];
                            next[idx].role = e.target.value;
                            setExperience(next);
                          }}
                        />
                        <input
                          type="date"
                          className={fieldClass}
                          value={exp.startDate}
                          onChange={(e) => {
                            const next = [...experience];
                            next[idx].startDate = e.target.value;
                            setExperience(next);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          {!exp.isCurrent && (
                            <input
                              type="date"
                              className={fieldClass}
                              value={exp.endDate}
                              onChange={(e) => {
                                const next = [...experience];
                                next[idx].endDate = e.target.value;
                                setExperience(next);
                              }}
                            />
                          )}
                          <label className="flex items-center gap-1.5 text-xs text-[#6B7280] whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => {
                                const next = [...experience];
                                next[idx].isCurrent = e.target.checked;
                                setExperience(next);
                              }}
                              className="h-3.5 w-3.5 rounded border-gray-300 text-[#087F5B] focus:ring-[#087F5B]"
                            />
                            Current
                          </label>
                        </div>
                      </div>
                      <input
                        className={fieldClass}
                        placeholder="Technologies (comma separated)"
                        value={exp.technologies}
                        onChange={(e) => {
                          const next = [...experience];
                          next[idx].technologies = e.target.value;
                          setExperience(next);
                        }}
                      />
                      <textarea
                        className={`${fieldClass} resize-none`}
                        rows={2}
                        placeholder="Description of responsibilities"
                        value={exp.description}
                        onChange={(e) => {
                          const next = [...experience];
                          next[idx].description = e.target.value;
                          setExperience(next);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {isFieldRequired("education") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>
                    Education <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEducation([
                        ...education,
                        { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F5B] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Education
                  </button>
                </div>
                <div className="space-y-4">
                  {education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-100 bg-[#F9FAFB] p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#6B7280]">
                          Education #{idx + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                          disabled={education.length === 1}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <input
                          className={fieldClass}
                          placeholder="Institution"
                          value={edu.institution}
                          onChange={(e) => {
                            const next = [...education];
                            next[idx].institution = e.target.value;
                            setEducation(next);
                          }}
                        />
                        <input
                          className={fieldClass}
                          placeholder="Degree (e.g. Bachelor of Science)"
                          value={edu.degree}
                          onChange={(e) => {
                            const next = [...education];
                            next[idx].degree = e.target.value;
                            setEducation(next);
                          }}
                        />
                        <input
                          className={fieldClass}
                          placeholder="Field of Study"
                          value={edu.fieldOfStudy}
                          onChange={(e) => {
                            const next = [...education];
                            next[idx].fieldOfStudy = e.target.value;
                            setEducation(next);
                          }}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="date"
                            className={fieldClass}
                            value={edu.startYear}
                            onChange={(e) => {
                              const next = [...education];
                              next[idx].startYear = e.target.value;
                              setEducation(next);
                            }}
                          />
                          <input
                            type="date"
                            className={fieldClass}
                            value={edu.endYear}
                            onChange={(e) => {
                              const next = [...education];
                              next[idx].endYear = e.target.value;
                              setEducation(next);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {isFieldRequired("certifications") && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Certifications</label>
                  <button
                    type="button"
                    onClick={() =>
                      setCertifications([
                        ...certifications,
                        { name: "", issuer: "", issueDate: "" },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#087F5B] hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Certification
                  </button>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className={fieldClass}
                        placeholder="Certification name"
                        value={cert.name}
                        onChange={(e) => {
                          const next = [...certifications];
                          next[idx].name = e.target.value;
                          setCertifications(next);
                        }}
                      />
                      <input
                        className={fieldClass}
                        placeholder="Issuer"
                        value={cert.issuer}
                        onChange={(e) => {
                          const next = [...certifications];
                          next[idx].issuer = e.target.value;
                          setCertifications(next);
                        }}
                      />
                      <input
                        type="date"
                        className={`${fieldClass} w-40`}
                        value={cert.issueDate}
                        onChange={(e) => {
                          const next = [...certifications];
                          next[idx].issueDate = e.target.value;
                          setCertifications(next);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCertifications(certifications.filter((_, i) => i !== idx))
                        }
                        disabled={certifications.length === 1}
                        className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-white text-[#111827] hover:bg-gray-50 disabled:opacity-50 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {isFieldRequired("coverLetter") && (
              <div>
                <label className={labelClass}>Cover Letter</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                  placeholder="Tell the employer why you're a great fit for this role..."
                  className={`${fieldClass} resize-none`}
                />
              </div>
            )}

            <button
              onClick={handleApply}
              disabled={applyMutation.isPending}
              className="flex items-center gap-2 px-6 py-3 bg-[#087F5B] text-white text-sm font-medium rounded-lg hover:bg-[#066B4D] transition-colors disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {applyMutation.isPending ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
