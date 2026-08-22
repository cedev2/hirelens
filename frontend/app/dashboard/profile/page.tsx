"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Edit3,
  Globe,
  Mail,
  CheckCircle,
  Camera,
  Plus,
  User,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import ExperienceSection, { Experience } from "./components/ExperienceSection";
import SkillsSection, { Skill } from "./components/SkillsSection";
import LanguagesSection, { Language } from "./components/LanguagesSection";
import CertificatesSection, {
  Certificate,
} from "./components/CertificatesSection";
import ProfileStatus from "./components/ProfileStatus";
import Modal from "./components/Modal";
import ExperienceForm from "./components/forms/ExperienceForm";
import SkillForm from "./components/forms/SkillForm";
import LanguageForm from "./components/forms/LanguageForm";
import CertificateForm from "./components/forms/CertificateForm";
import BioForm from "./components/forms/BioForm";
import UserDetailsForm from "./components/forms/UserDetailsForm";
import SocialsForm from "./components/forms/SocialsForm";
import { ImGithub, ImLinkedin2 } from "react-icons/im";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/lib/store/authSlice";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [activeModal, setActiveModal] = useState<{
    type:
      | "experience"
      | "skills"
      | "languages"
      | "certificates"
      | "bio"
      | "details"
      | "socials"
      | null;
    index?: number;
  }>({ type: null });

  const talentQuery = useQuery({
    queryKey: ["talent", "me"],
    queryFn: async () => {
      const res = await api.get("/talents/me");
      return res.data?.talent;
    },
  });

  const talent = talentQuery.data;

  // Local state for UI updates before mutation completes (optional, but good for UX)
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    picture: null as string | null,
  });

  const [talentData, setTalentData] = useState({
    headline: "",
    bio: "",
    location: "",
    skills: [] as Skill[],
    experience: [] as Experience[],
    availability: {
      status: "Available" as const,
      type: "Full-time" as const,
    },
    socialLinks: [] as string[],
    languages: [] as Language[],
    certifications: [] as Certificate[],
  });

  useEffect(() => {
    if (talent) {
      setUserData({
        firstName: talent.userId?.firstName || "",
        lastName: talent.userId?.lastName || "",
        email: talent.userId?.email || "",
        picture: talent.userId?.picture || null,
      });
      setTalentData({
        headline: talent.headline || "",
        bio: talent.bio || "",
        location: talent.location || "",
        skills: talent.skills || [],
        experience: talent.experience || [],
        availability: talent.availability || {
          status: "Available",
          type: "Full-time",
        },
        socialLinks: talent.socialLinks || [],
        languages: talent.languages || [],
        certifications: talent.certifications || [],
      });
    }
  }, [talent]);

  const updateTalentMutation = useMutation({
    mutationFn: async (payload: any) => {
      console.log(payload);
      const res = await api.put(`/talents/${talent._id}`, payload);
      return res.data;
    },
    onMutate: async (newPayload) => {
      // Optimistic update for Redux state if user details are present
      if (newPayload.userId) {
        dispatch(
          updateProfile({
            firstName: newPayload.userId.firstName,
            lastName: newPayload.userId.lastName,
            picture: newPayload.userId.picture,
          }),
        );
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["talent", "me"] });
      toast.success("Profile updated successfully");

      // Update Redux state with definitive data from response
      const talentResponse = data?.updatedTalent;
      const userFromResponse = talentResponse?.userId;

      if (userFromResponse) {
        dispatch(
          updateProfile({
            firstName: userFromResponse.firstName,
            lastName: userFromResponse.lastName,
            picture: userFromResponse.picture,
          }),
        );
        window.location.reload();
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update profile");
      // Revert Redux state if needed (optional, could just invalidate and refetch)
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });

  // Modal Handlers
  const openModal = (type: typeof activeModal.type, index?: number) => {
    setActiveModal({ type, index });
  };

  const closeModal = () => {
    setActiveModal({ type: null });
  };

  const handleUpdateExperience = (updatedExp: Experience) => {
    const newExperience = [...talentData.experience];
    if (activeModal.index !== undefined) {
      newExperience[activeModal.index] = updatedExp;
    } else {
      newExperience.push(updatedExp);
    }
    updateTalentMutation.mutate({ experience: newExperience });
    closeModal();
  };

  const handleUpdateSkill = (updatedSkill: Skill) => {
    const newSkills = [...talentData.skills];
    if (activeModal.index !== undefined) {
      newSkills[activeModal.index] = updatedSkill;
    } else {
      newSkills.push(updatedSkill);
    }
    updateTalentMutation.mutate({ skills: newSkills });
    closeModal();
  };

  const handleUpdateLanguage = (updatedLang: Language) => {
    const newLanguages = [...talentData.languages];
    if (activeModal.index !== undefined) {
      newLanguages[activeModal.index] = updatedLang;
    } else {
      newLanguages.push(updatedLang);
    }
    updateTalentMutation.mutate({ languages: newLanguages });
    closeModal();
  };

  const handleUpdateCertificate = (updatedCert: Certificate) => {
    const newCerts = [...talentData.certifications];
    if (activeModal.index !== undefined) {
      newCerts[activeModal.index] = updatedCert;
    } else {
      newCerts.push(updatedCert);
    }
    updateTalentMutation.mutate({ certifications: newCerts });
    closeModal();
  };

  const handleUpdateBio = (newBio: string) => {
    updateTalentMutation.mutate({ bio: newBio });
    closeModal();
  };

  const handleUpdateDetails = (data: any) => {
    updateTalentMutation.mutate({
      headline: data.headline,
      location: data.location,
      socialLinks: data.socialLinks,
      userId: {
        firstName: data.firstName,
        lastName: data.lastName,
        picture: data.picture,
      },
    });
    closeModal();
  };

  const handleUpdateSocials = (data: any) => {
    updateTalentMutation.mutate({ socialLinks: data.socialLinks });
    closeModal();
  };

  const removeItem = (type: typeof activeModal.type, index: number) => {
    if (type === "experience") {
      const newExp = talentData.experience.filter((_, i) => i !== index);
      updateTalentMutation.mutate({ experience: newExp });
    } else if (type === "skills") {
      const newSkills = talentData.skills.filter((_, i) => i !== index);
      updateTalentMutation.mutate({ skills: newSkills });
    } else if (type === "languages") {
      const newLangs = talentData.languages.filter((_, i) => i !== index);
      updateTalentMutation.mutate({ languages: newLangs });
    } else if (type === "certificates") {
      const newCerts = talentData.certifications.filter((_, i) => i !== index);
      updateTalentMutation.mutate({ certifications: newCerts });
    }
    closeModal();
  };

  const completionPercentage = (() => {
    if (!talent) return 0;
    const fields = [
      talent.headline,
      talent.location,
      talent.bio,
      talent.skills?.length > 0,
      talent.experience?.length > 0,
      talent.languages?.length > 0,
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  })();

  const profileProgress = {
    percentage: completionPercentage,
    items: [
      {
        label: "Headline",
        isCompleted: !!talent?.headline,
        isRequired: true,
        targetId: "profile-details",
      },
      {
        label: "Location",
        isCompleted: !!talent?.location,
        isRequired: true,
        targetId: "profile-details",
      },
      {
        label: "Personal Bio",
        isCompleted: !!talent?.bio,
        isRequired: true,
        targetId: "bio",
      },
      {
        label: "Skills",
        isCompleted: talent?.skills?.length > 0,
        isRequired: true,
        targetId: "skills",
      },
      {
        label: "Experience",
        isCompleted: talent?.experience?.length > 0,
        isRequired: true,
        targetId: "experience",
      },
      {
        label: "Languages",
        isCompleted: talent?.languages?.length > 0,
        isRequired: false,
        targetId: "languages",
      },
    ],
    hasCv: !!talent?.rawCv,
    cvUrl: talent?.rawCv?.ufsUrl || talent?.resumeUrl,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <phantom-ui loading={talentQuery.isLoading}>
        <div className="mx-auto space-y-3">
          {/* HEADER SECTION - Beautiful & Clean */}
          <div
            id="profile-details"
            className="bg-white rounded-[10px] p-6 sm:p-7 border border-gray-100 overflow-hidden relative"
          >
            <div className="flex  flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-32 h-32 sm:w-32 sm:h-32 rounded-full bg-linear-to-tr from-[#087F5B] to-[#12A66A] p-1 ">
                    {userData.picture ? (
                      <div className="w-full h-full rounded-full bg-white overflow-hidden border-4 border-white">
                        <img
                          src={userData.picture}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center border-4 border-white">
                        <span className="text-4xl sm:text-5xl font-bold text-[#087F5B]">
                          {userData.firstName[0]}
                          {userData.lastName[0]}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center sm:text-left pt-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <h1 className="text-3xl sm:text-3xl font-extrabold text-[#111827]">
                      {userData.firstName} {userData.lastName}
                    </h1>
                  </div>
                  <p className="text-lg font-semibold text-[#6B7280] mb-4 max-w-xl">
                    {talentData.headline}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#444]">
                      <div className="">
                        <MapPin className="w-4 h-4 text-[#087F5B]" />
                      </div>
                      {talentData.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#444]">
                      <div className=" ">
                        <Mail className="w-4 h-4 text-[#087F5B]" />
                      </div>
                      {userData.email}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => openModal("details")}
                  className="w-full px-8 py-4 bg-[#087F5B] text-white rounded-[10px] hover:bg-[#066B4D] shadow-[0_4px_15px_rgba(8,127,91,0.3)] transition-all flex items-center justify-center font-bold text-sm tracking-widest uppercase"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
                <div className="flex justify-center gap-2">
                  {talentData.socialLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-[#087F5B] hover:bg-[#E8F7F0] transition-all"
                    >
                      {link.includes("github") ? (
                        <ImGithub className="w-5 h-5" />
                      ) : (
                        <ImLinkedin2 className="w-5 h-5" />
                      )}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-3">
              {/* Bio Section */}
              <Card
                id="bio"
                className="p-8 bg-white rounded-[10px] border border-gray-100 shadow-none cursor-pointer group hover:border-[#087F5B] transition-all"
                onClick={() => openModal("bio")}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#111827] flex items-center gap-3">
                    <User className="w-5 h-5 text-[#087F5B]" />
                    Personal Bio
                  </h2>
                  <Edit3 className="w-4 h-4 text-gray-300 group-hover:text-[#087F5B] transition-colors" />
                </div>
                <p className="text-sm leading-relaxed text-[#6B7280] font-medium">
                  {talentData.bio}
                </p>
              </Card>

              <div id="experience">
                <ExperienceSection
                  experience={talentData.experience as Experience[]}
                  onAdd={() => openModal("experience")}
                  onEdit={(index) => openModal("experience", index)}
                />
              </div>

              <div id="skills">
                <SkillsSection
                  skills={talentData.skills as Skill[]}
                  onAdd={() => openModal("skills")}
                  onEdit={(index) => openModal("skills", index)}
                />
              </div>

              <div id="languages">
                <LanguagesSection
                  languages={talentData.languages as Language[]}
                  onAdd={() => openModal("languages")}
                  onEdit={(index) => openModal("languages", index)}
                  onRemove={(index) => removeItem("languages", index)}
                />
              </div>

              <div id="certificates">
                <CertificatesSection
                  certificates={talentData.certifications as Certificate[]}
                  onAdd={() => openModal("certificates")}
                  onEdit={(index) => openModal("certificates", index)}
                />
              </div>
            </div>

            {/* Sidebar - Profile Status (The MIFOTRA-style card) */}
            <div className="lg:col-span-1 space-y-8 sticky top-[100px]">
              <ProfileStatus progress={profileProgress} />
            </div>
          </div>

          {/* MODALS */}
          <Modal
            isOpen={activeModal.type === "experience"}
            onClose={closeModal}
            title={
              activeModal.index !== undefined
                ? "Edit Experience"
                : "Add Experience"
            }
          >
            <ExperienceForm
              initialData={
                activeModal.index !== undefined
                  ? talentData.experience[activeModal.index]
                  : undefined
              }
              onSubmit={handleUpdateExperience}
              onDelete={
                activeModal.index !== undefined
                  ? () => removeItem("experience", activeModal.index!)
                  : undefined
              }
            />
          </Modal>

          <Modal
            isOpen={activeModal.type === "skills"}
            onClose={closeModal}
            title={activeModal.index !== undefined ? "Edit Skill" : "Add Skill"}
          >
            <SkillForm
              initialData={
                activeModal.index !== undefined
                  ? talentData.skills[activeModal.index]
                  : undefined
              }
              onSubmit={handleUpdateSkill}
              onDelete={
                activeModal.index !== undefined
                  ? () => removeItem("skills", activeModal.index!)
                  : undefined
              }
            />
          </Modal>

          <Modal
            isOpen={activeModal.type === "languages"}
            onClose={closeModal}
            title={
              activeModal.index !== undefined ? "Edit Language" : "Add Language"
            }
          >
            <LanguageForm
              initialData={
                activeModal.index !== undefined
                  ? talentData.languages[activeModal.index]
                  : undefined
              }
              onSubmit={handleUpdateLanguage}
              onDelete={
                activeModal.index !== undefined
                  ? () => removeItem("languages", activeModal.index!)
                  : undefined
              }
            />
          </Modal>

          <Modal
            isOpen={activeModal.type === "certificates"}
            onClose={closeModal}
            title={
              activeModal.index !== undefined
                ? "Edit Certificate"
                : "Add Certificate"
            }
          >
            <CertificateForm
              initialData={
                activeModal.index !== undefined
                  ? talentData.certifications[activeModal.index]
                  : undefined
              }
              onSubmit={handleUpdateCertificate}
              onCancel={closeModal}
            />
          </Modal>

          <Modal
            isOpen={activeModal.type === "bio"}
            onClose={closeModal}
            title="Edit Personal Bio"
          >
            <BioForm initialData={talentData.bio} onSubmit={handleUpdateBio} />
          </Modal>

          <Modal
            isOpen={activeModal.type === "details"}
            onClose={closeModal}
            title="Edit Profile Details"
          >
            <UserDetailsForm
              initialData={{
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                headline: talentData.headline,
                location: talentData.location,
                socialLinks: talentData.socialLinks,
                picture: userData.picture,
              }}
              onSubmit={handleUpdateDetails}
            />
          </Modal>

          <Modal
            isOpen={activeModal.type === "socials"}
            onClose={closeModal}
            title="Edit Social Links"
          >
            <SocialsForm
              initialData={{
                socialLinks: talentData.socialLinks,
              }}
              onSubmit={handleUpdateSocials}
            />
          </Modal>
        </div>
      </phantom-ui>
    </div>
  );
}
