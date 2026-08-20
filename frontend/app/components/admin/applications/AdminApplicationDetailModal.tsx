"use client";

import {
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  FileText,
  Mail,
  ExternalLink,
  Phone,
  Award,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Star,
} from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { AdminApplicationRow } from "@/app/components/admin/applications/AdminApplicationsTable";
import { api } from "@/lib/api/client";

type BackendTalent = {
  _id: string;
  headline: string;
  bio?: string;
  location: string;
  skills: { name: string; level: string; yearsOfExperience: number }[];
  languages?: { name: string; proficiency: string }[];
  experience: {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description: string;
    technologies: string[];
    IsCurrent: boolean;
  }[];
  education: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startYear: string;
    endYear: string;
  }[];
  projects: {
    name: string;
    description: string;
    link?: string;
  }[];
  availability: {
    status: string;
    type: string;
  };
  socialLinks: string[];
  firstName: string;
  lastName: string;
  phone?: string;
  userId: {
    email: string;
  };
};

export default function AdminApplicationDetailModal({
  application,
  allApplications,
  onClose,
  onNavigate,
  onStatusChange,
}: {
  application: AdminApplicationRow | null;
  allApplications?: AdminApplicationRow[];
  onClose: () => void;
  onNavigate?: (app: AdminApplicationRow) => void;
  onStatusChange?: (appId: string, status: string) => void;
}) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: async ({ appId, status }: { appId: string; status: string }) => {
      await api.put(`/applications/${appId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "job"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });
  const talentQuery = useQuery({
    queryKey: ["admin", "talent", application?.talentId],
    enabled: !!application?.talentId,
    queryFn: async () => {
      const res = await api.get(`/talents/${application!.talentId}`);
      return res.data?.fetchedTalent as BackendTalent;
    },
  });

  if (!application) return null;

  const talent = talentQuery.data;
  const isLoading = talentQuery.isLoading;

  const currentIndex = allApplications?.findIndex((a) => a.id === application.id) ?? -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && allApplications ? currentIndex < allApplications.length - 1 : false;

  const handleStatus = (status: string) => {
    statusMutation.mutate({ appId: application.id, status });
    onStatusChange?.(application.id, status);
  };
  const hasResume =
    !!application.resumeUrl && application.resumeUrl.trim() !== "#";
  const hasCoverLetter = !!application.coverLetter?.trim();
  const hasCv = !!application.cvUrl?.trim();
  const hasPhoneNumber = !!application.phoneNumber?.trim();
  const hasAppLocation = !!application.location?.trim();
  const hasSkills = !!application.skills && application.skills.length > 0;
  const hasExperience =
    !!application.experience && application.experience.length > 0;
  const hasEducation =
    !!application.education && application.education.length > 0;
  const hasCertifications =
    !!application.certifications && application.certifications.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex h-full items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="relative h-full max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[10px] bg-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-bold text-sm uppercase">
              {application.talentName.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#25324B]">
                {application.talentName}
              </h2>
              <p className="text-xs text-[#7C8493]">
                {application.talentHeadline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasPrev && onNavigate && allApplications && (
              <button
                onClick={() => onNavigate(allApplications[currentIndex - 1])}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
                title="Previous applicant"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {hasNext && onNavigate && allApplications && (
              <button
                onClick={() => onNavigate(allApplications[currentIndex + 1])}
                className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-colors"
                title="Next applicant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {allApplications && allApplications.length > 0 && (
              <span className="text-xs font-semibold text-gray-400">
                {currentIndex + 1}/{allApplications.length}
              </span>
            )}
            <div className="h-6 w-px bg-gray-200" />
            {application.status === "pending" && (
              <>
                <button
                  onClick={() => handleStatus("shortlisted")}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatus("rejected")}
                  disabled={statusMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </button>
              </>
            )}
            {application.status === "shortlisted" && (
              <button
                onClick={() => handleStatus("hired")}
                disabled={statusMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Star className="h-3.5 w-3.5" />
                Hire
              </button>
            )}
            {hasResume && (
              <a
                href={application.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#25324B] hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Resume
              </a>
            )}
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="h-[calc(90vh-76px)] overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
              <p className="text-sm text-[#7C8493]">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ===== APPLICATION FORM DATA (What they submitted for this job) ===== */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-[#087F5B]" />
                  <h3 className="text-sm font-bold text-[#087F5B] uppercase tracking-widest">
                    Application Form Data
                  </h3>
                </div>

                {/* Contact Info from Application */}
                {(hasPhoneNumber || hasAppLocation || hasCv) && (
                  <div className="rounded-xl border border-green-100 bg-green-50/30 p-5 mb-6">
                    <h4 className="text-xs font-bold text-[#7C8493] uppercase tracking-widest mb-3">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hasPhoneNumber && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Phone
                            </p>
                            <p className="font-semibold text-[#25324B]">
                              {application.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                      {hasAppLocation && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              Location
                            </p>
                            <p className="font-semibold text-[#25324B]">
                              {application.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {hasCv && (
                        <div className="flex items-center gap-3 text-sm">
                          <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              CV/Resume
                            </p>
                            <a
                              href={application.cvUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-[#087F5B] hover:underline"
                            >
                              View uploaded CV
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills from Application */}
                {hasSkills && (
                  <section className="mb-6">
                    <h4 className="text-base font-bold text-[#25324B] mb-3">
                      Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {application.skills!.map((skill, idx) => (
                        <div
                          key={`${skill.name}-${idx}`}
                          className="rounded-xl border border-green-100 bg-green-50/50 px-3 py-1.5 text-xs font-semibold text-green-700"
                        >
                          {skill.name}
                          <span className="ml-1 text-[10px] text-green-700 font-normal">
                            &bull; {skill.level}
                          </span>
                          <span className="ml-1 text-[10px] text-green-600 font-normal">
                            ({skill.yearsOfExperience}yr)
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Experience from Application */}
                {hasExperience && (
                  <section className="mb-6">
                    <h4 className="text-base font-bold text-[#25324B] mb-4">
                      Work Experience
                    </h4>
                    <div className="space-y-6">
                      {application.experience!.map((exp, idx) => (
                        <div key={idx} className="relative flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                              <Briefcase className="h-5 w-5 text-green-600" />
                            </div>
                            {idx !== application.experience!.length - 1 && (
                              <div className="h-full w-px bg-gray-100 mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <h5 className="text-sm font-bold text-[#25324B]">
                              {exp.role}
                            </h5>
                            <p className="text-xs text-[#7C8493] mb-2">
                              {exp.company} &bull;{" "}
                              {new Date(exp.startDate).getFullYear()} -{" "}
                              {exp.isCurrent
                                ? "Present"
                                : exp.endDate
                                  ? new Date(exp.endDate).getFullYear()
                                  : "N/A"}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-[#7C8493] leading-relaxed">
                                {exp.description}
                              </p>
                            )}
                            {exp.technologies?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {exp.technologies.map((tech, techIdx) => (
                                  <span
                                    key={`${tech}-${techIdx}`}
                                    className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education from Application */}
                {hasEducation && (
                  <section className="mb-6">
                    <h4 className="text-base font-bold text-[#25324B] mb-4">
                      Education
                    </h4>
                    <div className="space-y-4">
                      {application.education!.map((edu, idx) => (
                        <div
                          key={idx}
                          className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                        >
                          <GraduationCap className="h-6 w-6 text-green-600 shrink-0" />
                          <div>
                            <h5 className="text-sm font-bold text-[#25324B]">
                              {edu.degree} in {edu.fieldOfStudy}
                            </h5>
                            <p className="text-xs text-[#7C8493]">
                              {edu.institution} &bull;{" "}
                              {new Date(edu.startYear).getFullYear()} -{" "}
                              {new Date(edu.endYear).getFullYear()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Certifications from Application */}
                {hasCertifications && (
                  <section className="mb-6">
                    <h4 className="text-base font-bold text-[#25324B] mb-4">
                      Certifications
                    </h4>
                    <div className="space-y-3">
                      {application.certifications!.map((cert, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                        >
                          <Award className="h-5 w-5 text-green-600 shrink-0" />
                          <div>
                            <h5 className="text-sm font-bold text-[#25324B]">
                              {cert.name}
                            </h5>
                            <p className="text-xs text-[#7C8493]">
                              {cert.issuer} &bull;{" "}
                              {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Cover Letter from Application */}
                {hasCoverLetter && (
                  <section className="mb-6">
                    <h4 className="text-base font-bold text-[#25324B] mb-4">
                      Cover Letter
                    </h4>
                    <div className="rounded-[10px] bg-gray-50 p-6">
                      <p className="text-sm text-[#7C8493] leading-relaxed whitespace-pre-wrap italic">
                        {application.coverLetter}
                      </p>
                    </div>
                  </section>
                )}
              </div>

              {/* ===== TALENT PROFILE DATA (Supplementary) ===== */}
              {talent && (
                <div className="border-t border-gray-100 pt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <h3 className="text-sm font-bold text-[#7C8493] uppercase tracking-widest">
                      Talent Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-8">
                      <section>
                        <h4 className="text-base font-bold text-[#25324B] mb-3">
                          About Me
                        </h4>
                        <p className="text-sm leading-6 text-[#7C8493]">
                          {talent.bio || "No bio provided."}
                        </p>
                      </section>

                      {talent.experience?.length > 0 && (
                        <section>
                          <h4 className="text-base font-bold text-[#25324B] mb-4">
                            Profile Experience
                          </h4>
                          <div className="space-y-6">
                            {talent.experience.map((exp, idx) => (
                              <div key={idx} className="relative flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                  </div>
                                  {idx !== talent.experience.length - 1 && (
                                    <div className="h-full w-px bg-gray-100 mt-2" />
                                  )}
                                </div>
                                <div className="pb-6">
                                  <h5 className="text-sm font-bold text-[#25324B]">
                                    {exp.role}
                                  </h5>
                                  <p className="text-xs text-[#7C8493] mb-2">
                                    {exp.company} &bull;{" "}
                                    {new Date(exp.startDate).getFullYear()} -{" "}
                                    {exp.endDate
                                      ? new Date(exp.endDate).getFullYear()
                                      : "Present"}
                                  </p>
                                  <p className="text-sm text-[#7C8493] leading-relaxed">
                                    {exp.description}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {exp.technologies?.map((tech, techIdx) => (
                                      <span
                                        key={`${tech}-${techIdx}`}
                                        className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-600"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {talent.education?.length > 0 && (
                        <section>
                          <h4 className="text-base font-bold text-[#25324B] mb-4">
                            Profile Education
                          </h4>
                          <div className="space-y-4">
                            {talent.education.map((edu, idx) => (
                              <div
                                key={idx}
                                className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50"
                              >
                                <GraduationCap className="h-6 w-6 text-gray-400 shrink-0" />
                                <div>
                                  <h5 className="text-sm font-bold text-[#25324B]">
                                    {edu.degree} in {edu.fieldOfStudy}
                                  </h5>
                                  <p className="text-xs text-[#7C8493]">
                                    {edu.institution} &bull;{" "}
                                    {new Date(edu.startYear).getFullYear()} -{" "}
                                    {new Date(edu.endYear).getFullYear()}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {talent.projects?.length > 0 && (
                        <section>
                          <h4 className="text-base font-bold text-[#25324B] mb-4">
                            Projects
                          </h4>
                          <div className="space-y-4">
                            {talent.projects.map((project, idx) => (
                              <div
                                key={idx}
                                className="rounded-[10px] border border-gray-100 bg-white p-5"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h5 className="text-sm font-bold text-[#25324B]">
                                      {project.name}
                                    </h5>
                                    <p className="mt-1 text-sm text-[#7C8493] leading-relaxed">
                                      {project.description}
                                    </p>
                                  </div>
                                  {project.link && (
                                    <a
                                      href={project.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#25324B] hover:bg-gray-50"
                                    >
                                      <ExternalLink className="h-4 w-4 text-gray-500" />
                                      Visit
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>

                    <div className="space-y-8">
                      <section className="rounded-[10px] border border-gray-100 bg-gray-50/30 p-5">
                        <h4 className="text-base font-bold text-[#25324B] mb-4">
                          Contact & Social
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-gray-600">
                              {talent.location}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-gray-600">
                              {talent.userId.email}
                            </span>
                          </div>
                          {talent.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                              <span className="text-gray-600">
                                {talent.phone}
                              </span>
                            </div>
                          )}
                          <div className="pt-2 flex gap-3">
                            {talent.socialLinks?.map((link, idx) => (
                              <a
                                key={idx}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center hover:bg-green-50 hover:border-green-100 transition-colors"
                              >
                                {link.includes("linkedin") ? (
                                  <FaLinkedin className="h-4 w-4 text-[#0A66C2]" />
                                ) : link.includes("github") ? (
                                  <FaGithub className="h-4 w-4 text-[#181717]" />
                                ) : (
                                  <ExternalLink className="h-4 w-4 text-green-400" />
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      </section>

                      {talent.skills?.length > 0 && (
                        <section>
                          <h4 className="text-base font-bold text-[#25324B] mb-4">
                            Profile Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {talent.skills.map((skill, skillIdx) => (
                              <div
                                key={`${skill.name}-${skillIdx}`}
                                className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600"
                              >
                                {skill.name}
                                <span className="ml-1 text-[10px] text-gray-500 font-normal">
                                  &bull; {skill.level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {talent.languages && talent.languages.length > 0 && (
                        <section>
                          <h4 className="text-base font-bold text-[#25324B] mb-4">
                            Languages
                          </h4>
                          <div className="space-y-3">
                            {talent.languages.map((lang) => (
                              <div
                                key={lang.name}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm text-[#25324B]">
                                  {lang.name}
                                </span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600 border border-gray-200">
                                  {lang.proficiency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {talent.availability && (
                        <section className="rounded-[10px] bg-gray-50 p-5 border border-gray-100">
                          <div className="flex items-center gap-2 text-gray-500 mb-2">
                            <Award className="h-5 w-5" />
                            <span className="text-sm font-bold uppercase tracking-wider">
                              Availability
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#25324B]">
                            {talent.availability.type}
                          </p>
                          <p className="text-xs text-[#7C8493] mt-1">
                            {talent.availability.status}
                          </p>
                        </section>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
