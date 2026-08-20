import { Request, Response } from "express";
import Screening from "../models/screening.model";
import Jobs from "../models/jobs.model";
import Talent from "../models/talents.model";
import User from "../models/user.model";
import Application from "../models/application.model";
import { IScreening } from "../types/screening.types";
import {
  evaluateCandidates,
  evaluateCandidatesGroqOnly,
  CandidateData,
  JobData,
} from "../services/gemini.service";

const screeningController = {
  async getAll(req: Request, res: Response) {
    try {
      const fetchedScreenings = await Screening.find();
      return res.status(200).json({
        message: `${fetchedScreenings.length} screening(s) fetched`,
        fetchedScreenings,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch all listings",
        error: error.message,
      });
    }
  },

  async runAiScreeningFromHirelensGroq(req: Request, res: Response) {
    try {
      const startedAt = Date.now();
      console.log("[screening] runAiScreeningFromHirelensGroq: start");
      const {
        jobId,
        topN = 10,
        talents,
      }: {
        jobId?: string;
        topN?: number;
        talents?: any[];
      } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: "jobId is required" });
      }

      const job = await Jobs.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const list = Array.isArray(talents) ? talents : [];
      if (list.length === 0) {
        return res.status(400).json({ message: "talents array is required" });
      }

      const safeTopN = (() => {
        const n = Number(topN);
        const max = list.length;
        if (!Number.isFinite(n)) return Math.min(10, max);
        return Math.min(Math.max(Math.floor(n), 1), max);
      })();

      const jobData: JobData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        weights: job.weights,
      };

      const saved: Array<{
        talentId: string;
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        headline: string;
        location: string;
        raw: any;
      }> = [];

      for (const raw of list) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) continue;

        const firstName =
          String(raw?.firstName ?? "Unknown").trim() || "Unknown";
        const lastName = String(raw?.lastName ?? "").trim();
        const headline = String(raw?.headline ?? "Talent").trim() || "Talent";
        const location = String(raw?.location ?? "").trim();

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            firstName,
            lastName,
            role: "applicant",
          });
        }

        const skills = Array.isArray(raw?.skills) ? raw.skills : [];
        const languages = Array.isArray(raw?.languages) ? raw.languages : [];
        const experience = Array.isArray(raw?.experience) ? raw.experience : [];
        const education = Array.isArray(raw?.education) ? raw.education : [];
        const certifications = Array.isArray(raw?.certifications)
          ? raw.certifications
          : [];
        const projects = Array.isArray(raw?.projects) ? raw.projects : [];

        const normalizedSkills = skills
          .filter(Boolean)
          .map((s: any) => ({
            name: String(s?.name ?? "").trim(),
            level: String(s?.level ?? "Intermediate"),
            yearsOfExperience: Number(s?.yearsOfExperience ?? 0),
          }))
          .filter((s: any) => s.name);

        const normalizedLanguages = languages.filter(Boolean).map((l: any) => ({
          name: l?.name ? String(l.name) : undefined,
          proficiency: l?.proficiency ? String(l.proficiency) : undefined,
        }));

        const normalizedExperience = experience
          .filter(Boolean)
          .map((e: any) => ({
            company: e?.company ? String(e.company) : undefined,
            role: e?.role ? String(e.role) : undefined,
            startDate: e?.startDate ? new Date(e.startDate) : undefined,
            endDate: e?.endDate ? new Date(e.endDate) : undefined,
            description: e?.description ? String(e.description) : undefined,
            technologies: Array.isArray(e?.technologies)
              ? e.technologies.map((x: any) => String(x))
              : [],
            IsCurrent: Boolean(e?.IsCurrent),
          }));

        const normalizedEducation = education
          .filter(Boolean)
          .map((ed: any) => ({
            institution: ed?.institution ? String(ed.institution) : undefined,
            degree: ed?.degree ? String(ed.degree) : undefined,
            fieldOfStudy: ed?.fieldOfStudy
              ? String(ed.fieldOfStudy)
              : undefined,
            startYear: ed?.startYear ? new Date(ed.startYear) : undefined,
            endYear: ed?.endYear ? new Date(ed.endYear) : undefined,
          }));

        const normalizedCerts = certifications
          .filter(Boolean)
          .map((c: any) => ({
            name: c?.name ? String(c.name) : undefined,
            issuer: c?.issuer ? String(c.issuer) : undefined,
            issueDate: c?.issueDate ? new Date(c.issueDate) : undefined,
          }));

        const normalizedProjects = projects.filter(Boolean).map((p: any) => ({
          name: p?.name ? String(p.name) : undefined,
          description: p?.description ? String(p.description) : undefined,
          technologies: Array.isArray(p?.technologies)
            ? p.technologies.map((x: any) => String(x))
            : [],
          role: p?.role ? String(p.role) : undefined,
          link: p?.link ? String(p.link) : undefined,
          startDate: p?.startDate ? new Date(p.startDate) : undefined,
          endDate: p?.endDate ? new Date(p.endDate) : undefined,
        }));

        let talent = await Talent.findOne({ userId: user._id as any } as any);
        if (!talent) {
          talent = await Talent.create({
            userId: user._id as any,
            headline,
          } as any);
        }

        await Talent.findByIdAndUpdate(talent._id, {
          headline,
          bio: raw?.bio ? String(raw.bio) : undefined,
          location,
          skills: normalizedSkills,
          languages: normalizedLanguages,
          experience: normalizedExperience,
          education: normalizedEducation,
          certifications: normalizedCerts,
          projects: normalizedProjects,
          availability: raw?.availability,
          socialLinks: Array.isArray(raw?.socialLinks)
            ? raw.socialLinks.map((x: any) => String(x))
            : [],
        });

        if (String(user.talentProfileId ?? "") !== String(talent._id)) {
          await User.findByIdAndUpdate(user._id, {
            talentProfileId: talent._id.toString(),
          });
        }

        saved.push({
          talentId: talent._id.toString(),
          userId: user._id.toString(),
          email,
          firstName,
          lastName,
          headline,
          location,
          raw,
        });
      }

      if (saved.length === 0) {
        return res.status(400).json({
          message: "No valid talents to import (missing email)",
        });
      }

      const candidatesData: CandidateData[] = saved.map((s) => {
        const raw = s.raw ?? {};
        const skills = Array.isArray(raw?.skills) ? raw.skills : [];
        const experience = Array.isArray(raw?.experience) ? raw.experience : [];
        const education = Array.isArray(raw?.education) ? raw.education : [];
        const certifications = Array.isArray(raw?.certifications)
          ? raw.certifications
          : [];
        const projects = Array.isArray(raw?.projects) ? raw.projects : [];

        return {
          id: s.talentId,
          firstName: s.firstName,
          lastName: s.lastName,
          headline: s.headline,
          bio: raw?.bio ? String(raw.bio) : undefined,
          skills: skills
            .filter(Boolean)
            .map((sk: any) => ({
              name: String(sk?.name ?? ""),
              level: String(sk?.level ?? "Intermediate"),
              yearsOfExperience: Number(sk?.yearsOfExperience ?? 0),
            }))
            .filter((sk: any) => sk.name),
          experience: experience.filter(Boolean).map((e: any) => ({
            company: String(e?.company ?? ""),
            role: String(e?.role ?? ""),
            description: String(e?.description ?? ""),
            technologies: Array.isArray(e?.technologies)
              ? e.technologies.map((x: any) => String(x))
              : [],
            startDate: e?.startDate ? new Date(e.startDate) : new Date(),
            endDate: e?.endDate ? new Date(e.endDate) : undefined,
          })),
          education: education.filter(Boolean).map((ed: any) => ({
            institution: String(ed?.institution ?? ""),
            degree: String(ed?.degree ?? ""),
            fieldOfStudy: String(ed?.fieldOfStudy ?? ""),
          })),
          certifications: certifications
            .filter(Boolean)
            .map((c: any) => ({
              name: String(c?.name ?? ""),
              issuer: String(c?.issuer ?? ""),
            }))
            .filter((c: any) => c.name),
          projects: projects
            .filter(Boolean)
            .map((p: any) => ({
              name: String(p?.name ?? ""),
              description: String(p?.description ?? ""),
              technologies: Array.isArray(p?.technologies)
                ? p.technologies.map((x: any) => String(x))
                : [],
            }))
            .filter((p: any) => p.name),
        };
      });

      console.log(
        `[screening] runAiScreeningFromHirelensGroq: calling evaluateCandidatesGroqOnly candidates=${candidatesData.length} elapsedMs=${Date.now() - startedAt}`,
      );
      const aiResult = await evaluateCandidatesGroqOnly(
        jobData,
        candidatesData,
      );
      console.log(
        `[screening] runAiScreeningFromHirelensGroq: evaluateCandidatesGroqOnly done elapsedMs=${Date.now() - startedAt}`,
      );

      const sortedCandidates = (aiResult.candidates ?? [])
        .slice()
        .sort((a, b) => a.rank - b.rank);
      const trimmed = sortedCandidates.slice(0, safeTopN);

      const screening = await Screening.create({
        jobId: job._id.toString(),
        candidates: trimmed,
        comparisonSummary: aiResult.comparisonSummary,
      });

      const metaById = new Map(
        saved.map((s) => [
          s.talentId,
          {
            email: s.email,
            firstName: s.firstName,
            lastName: s.lastName,
            headline: s.headline,
            location: s.location,
            userId: s.userId,
          },
        ]),
      );

      return res.status(200).json({
        message: `AI screening complete. ${trimmed.length} Hirelens talents ranked`,
        screening,
        topN: safeTopN,
        importedCount: saved.length,
        rankedTalents: trimmed.map((c) => ({
          candidateId: c.candidateId,
          rank: c.rank,
          matchScore: c.matchScore,
          meta: metaById.get(c.candidateId) ?? null,
        })),
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "AI screening failed",
        error: error.message,
      });
    }
  },
  async getByJobId(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const fetchedScreening = await Screening.find({ jobId });

      return res.status(200).json({
        message: fetchedScreening.length
          ? `Screenings found for this Job: ${jobId}`
          : "No screening found for that job",
        fetchedScreening,
        fetchedScreenings: fetchedScreening,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch listing for that Job",
        error: error.message,
      });
    }
  },
  async getOne(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;

      const fetchedScreening = await Screening.findById(screeningId);

      if (!fetchedScreening)
        return res.status(404).json({ message: "Screening ID not found" });

      return res
        .status(200)
        .json({ message: "Screening ID Found", fetchedScreening });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to get one screening", error: error.message });
    }
  },

  async updateScreening(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;
      const payload: IScreening = req.body;

      const updatedScreening = await Screening.findByIdAndUpdate(
        screeningId,
        payload,
        { returnDocument: "after", runValidators: true },
      );

      if (!updatedScreening)
        return res.status(404).json({ message: "Job Screening not found" });

      return res
        .status(200)
        .json({ message: "Job screening updated", updatedScreening });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to update screening", error: error.message });
    }
  },

  async deleteScreening(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;

      const deletedScreening = await Screening.findByIdAndDelete(screeningId);

      if (!deletedScreening)
        return res.status(404).json({ message: "Job Screening not found" });

      return res
        .status(200)
        .json({ message: "Job screening updated", deletedScreening });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to delete screening", error: error.message });
    }
  },

  async runAiScreening(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const job = await Jobs.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      // Fetch applicants for this job
      const applications = await Application.find({ jobId });
      if (!applications.length) {
        return res
          .status(400)
          .json({ message: "No applicants found for this job" });
      }

      const talentIds = applications.map((app) => app.talentId);
      const talents = await Talent.find({ _id: { $in: talentIds } }).populate(
        "userId",
      );

      if (!talents.length) {
        return res.status(400).json({ message: "No candidate profiles found" });
      }

      const talentMap = new Map(
        talents.map((t: any) => [t._id.toString(), t]),
      );

      const jobData: JobData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        weights: job.weights,
      };

      // Use Application form data, fallback to Talent (CV-parsed) data for empty fields
      const candidatesData: CandidateData[] = applications.map((app) => {
        const talent = talentMap.get(app.talentId);
        return {
          id: app.talentId,
          firstName: (talent?.userId as any)?.firstName || "Unknown",
          lastName: (talent?.userId as any)?.lastName || "",
          headline: talent?.headline || "",
          bio: talent?.bio,
          location: app.location || talent?.location || "",
          cvUrl: app.cvUrl || "",
          skills:
            (app.skills && app.skills.length > 0 ? app.skills : null) ||
            talent?.skills ||
            [],
          experience:
            (app.experience && app.experience.length > 0
              ? (app.experience || []).map((e: any) => ({
                  company: e.company || "",
                  role: e.role || "",
                  description: e.description || "",
                  technologies: e.technologies || [],
                  startDate: e.startDate ? new Date(e.startDate) : new Date(),
                  endDate: e.endDate ? new Date(e.endDate) : undefined,
                }))
              : null) ||
            (talent?.experience || []).map((e: any) => ({
              company: e.company || "",
              role: e.role || "",
              description: e.description || "",
              technologies: e.technologies || [],
              startDate: e.startDate || new Date(),
              endDate: e.endDate || undefined,
            })) ||
            [],
          education:
            (app.education && app.education.length > 0
              ? (app.education || []).map((e: any) => ({
                  institution: e.institution || "",
                  degree: e.degree || "",
                  fieldOfStudy: e.fieldOfStudy || "",
                }))
              : null) ||
            (talent?.education || []).map((e: any) => ({
              institution: e.institution || "",
              degree: e.degree || "",
              fieldOfStudy: e.fieldOfStudy || "",
            })) ||
            [],
          certifications:
            (app.certifications && app.certifications.length > 0
              ? (app.certifications || []).map((c: any) => ({
                  name: c.name || "",
                  issuer: c.issuer || "",
                }))
              : null) ||
            (talent?.certifications || []).map((c: any) => ({
              name: c.name || "",
              issuer: c.issuer || "",
            })) ||
            [],
          projects: talent?.projects || [],
        };
      });

      const aiResult = await evaluateCandidates(jobData, candidatesData);

      const screening = await Screening.create({
        jobId: job._id.toString(),
        candidates: aiResult.candidates,
        comparisonSummary: aiResult.comparisonSummary,
      });

      // Link screening to applications and update status
      for (const app of applications) {
        const candidateResult = aiResult.candidates.find(
          (c) => c.candidateId === app.talentId,
        );
        await Application.findByIdAndUpdate(app._id, {
          screeningId: screening._id.toString(),
          status:
            candidateResult?.finalRecommendation === "Strong hire"
              ? "shortlisted"
              : "reviewing",
          notes: candidateResult?.reasoning,
        });
      }

      return res.status(200).json({
        message: `AI screening complete. ${aiResult.candidates.length} applicants ranked`,
        screening,
        applicantsScreened: applications.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "AI screening failed",
        error: error.message,
      });
    }
  },

  async runAiScreeningGroq(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const job = await Jobs.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const applications = await Application.find({ jobId });
      if (!applications.length) {
        return res
          .status(400)
          .json({ message: "No applicants found for this job" });
      }

      const talentIds = applications.map((app) => app.talentId);
      const talents = await Talent.find({ _id: { $in: talentIds } }).populate(
        "userId",
      );

      if (!talents.length) {
        return res.status(400).json({ message: "No candidate profiles found" });
      }

      const talentMap = new Map(
        talents.map((t: any) => [t._id.toString(), t]),
      );

      const jobData: JobData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        weights: job.weights,
      };

      // Use Application form data, fallback to Talent (CV-parsed) data for empty fields
      const candidatesData: CandidateData[] = applications.map((app) => {
        const talent = talentMap.get(app.talentId);
        return {
          id: app.talentId,
          firstName: (talent?.userId as any)?.firstName || "Unknown",
          lastName: (talent?.userId as any)?.lastName || "",
          headline: talent?.headline || "",
          bio: talent?.bio,
          location: app.location || talent?.location || "",
          cvUrl: app.cvUrl || "",
          skills:
            (app.skills && app.skills.length > 0 ? app.skills : null) ||
            talent?.skills ||
            [],
          experience:
            (app.experience && app.experience.length > 0
              ? (app.experience || []).map((e: any) => ({
                  company: e.company || "",
                  role: e.role || "",
                  description: e.description || "",
                  technologies: e.technologies || [],
                  startDate: e.startDate ? new Date(e.startDate) : new Date(),
                  endDate: e.endDate ? new Date(e.endDate) : undefined,
                }))
              : null) ||
            (talent?.experience || []).map((e: any) => ({
              company: e.company || "",
              role: e.role || "",
              description: e.description || "",
              technologies: e.technologies || [],
              startDate: e.startDate || new Date(),
              endDate: e.endDate || undefined,
            })) ||
            [],
          education:
            (app.education && app.education.length > 0
              ? (app.education || []).map((e: any) => ({
                  institution: e.institution || "",
                  degree: e.degree || "",
                  fieldOfStudy: e.fieldOfStudy || "",
                }))
              : null) ||
            (talent?.education || []).map((e: any) => ({
              institution: e.institution || "",
              degree: e.degree || "",
              fieldOfStudy: e.fieldOfStudy || "",
            })) ||
            [],
          certifications:
            (app.certifications && app.certifications.length > 0
              ? (app.certifications || []).map((c: any) => ({
                  name: c.name || "",
                  issuer: c.issuer || "",
                }))
              : null) ||
            (talent?.certifications || []).map((c: any) => ({
              name: c.name || "",
              issuer: c.issuer || "",
            })) ||
            [],
          projects: talent?.projects || [],
        };
      });

      const aiResult = await evaluateCandidatesGroqOnly(
        jobData,
        candidatesData,
      );

      const screening = await Screening.create({
        jobId: job._id.toString(),
        candidates: aiResult.candidates,
        comparisonSummary: aiResult.comparisonSummary,
      });

      for (const app of applications) {
        const candidateResult = aiResult.candidates.find(
          (c) => c.candidateId === app.talentId,
        );
        await Application.findByIdAndUpdate(app._id, {
          screeningId: screening._id.toString(),
          status:
            candidateResult?.finalRecommendation === "Strong hire"
              ? "shortlisted"
              : "reviewing",
          notes: candidateResult?.reasoning,
        });
      }

      return res.status(200).json({
        message: `AI screening complete. ${aiResult.candidates.length} applicants ranked`,
        screening,
        applicantsScreened: applications.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "AI screening failed",
        error: error.message,
      });
    }
  },

  async runAiScreeningFromHirelens(req: Request, res: Response) {
    try {
      const startedAt = Date.now();
      console.log("[screening] runAiScreeningFromHirelens: start");
      const {
        jobId,
        topN = 10,
        talents,
      }: {
        jobId?: string;
        topN?: number;
        talents?: any[];
      } = req.body;

      if (!jobId) {
        return res.status(400).json({ message: "jobId is required" });
      }

      const job = await Jobs.findById(jobId);
      if (!job) return res.status(404).json({ message: "Job not found" });

      const list = Array.isArray(talents) ? talents : [];
      if (list.length === 0) {
        return res.status(400).json({ message: "talents array is required" });
      }

      const safeTopN = (() => {
        const n = Number(topN);
        const max = list.length;
        if (!Number.isFinite(n)) return Math.min(10, max);
        return Math.min(Math.max(Math.floor(n), 1), max);
      })();

      const jobData: JobData = {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        weights: job.weights,
      };

      const saved: Array<{
        talentId: string;
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        headline: string;
        location: string;
        raw: any;
      }> = [];

      for (const raw of list) {
        const email = String(raw?.email ?? "")
          .trim()
          .toLowerCase();
        if (!email) continue;

        const firstName =
          String(raw?.firstName ?? "Unknown").trim() || "Unknown";
        const lastName = String(raw?.lastName ?? "").trim();
        const headline = String(raw?.headline ?? "Talent").trim() || "Talent";
        const location = String(raw?.location ?? "").trim();

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            email,
            firstName,
            lastName,
            role: "applicant",
          });
        }

        const skills = Array.isArray(raw?.skills) ? raw.skills : [];
        const languages = Array.isArray(raw?.languages) ? raw.languages : [];
        const experience = Array.isArray(raw?.experience) ? raw.experience : [];
        const education = Array.isArray(raw?.education) ? raw.education : [];
        const certifications = Array.isArray(raw?.certifications)
          ? raw.certifications
          : [];
        const projects = Array.isArray(raw?.projects) ? raw.projects : [];

        const normalizedSkills = skills
          .filter(Boolean)
          .map((s: any) => ({
            name: String(s?.name ?? "").trim(),
            level: String(s?.level ?? "Intermediate"),
            yearsOfExperience: Number(s?.yearsOfExperience ?? 0),
          }))
          .filter((s: any) => s.name);

        const normalizedLanguages = languages.filter(Boolean).map((l: any) => ({
          name: l?.name ? String(l.name) : undefined,
          proficiency: l?.proficiency ? String(l.proficiency) : undefined,
        }));

        const normalizedExperience = experience
          .filter(Boolean)
          .map((e: any) => ({
            company: e?.company ? String(e.company) : undefined,
            role: e?.role ? String(e.role) : undefined,
            startDate: e?.startDate ? new Date(e.startDate) : undefined,
            endDate: e?.endDate ? new Date(e.endDate) : undefined,
            description: e?.description ? String(e.description) : undefined,
            technologies: Array.isArray(e?.technologies)
              ? e.technologies.map((x: any) => String(x))
              : [],
            IsCurrent: Boolean(e?.IsCurrent),
          }));

        const normalizedEducation = education
          .filter(Boolean)
          .map((ed: any) => ({
            institution: ed?.institution ? String(ed.institution) : undefined,
            degree: ed?.degree ? String(ed.degree) : undefined,
            fieldOfStudy: ed?.fieldOfStudy
              ? String(ed.fieldOfStudy)
              : undefined,
            startYear: ed?.startYear ? new Date(ed.startYear) : undefined,
            endYear: ed?.endYear ? new Date(ed.endYear) : undefined,
          }));

        const normalizedCerts = certifications
          .filter(Boolean)
          .map((c: any) => ({
            name: c?.name ? String(c.name) : undefined,
            issuer: c?.issuer ? String(c.issuer) : undefined,
            issueDate: c?.issueDate ? new Date(c.issueDate) : undefined,
          }));

        const normalizedProjects = projects.filter(Boolean).map((p: any) => ({
          name: p?.name ? String(p.name) : undefined,
          description: p?.description ? String(p.description) : undefined,
          technologies: Array.isArray(p?.technologies)
            ? p.technologies.map((x: any) => String(x))
            : [],
          role: p?.role ? String(p.role) : undefined,
          link: p?.link ? String(p.link) : undefined,
          startDate: p?.startDate ? new Date(p.startDate) : undefined,
          endDate: p?.endDate ? new Date(p.endDate) : undefined,
        }));

        let talent = await Talent.findOne({ userId: user._id as any } as any);
        if (!talent) {
          talent = await Talent.create({
            userId: user._id as any,
            headline,
          } as any);
        }

        await Talent.findByIdAndUpdate(talent._id, {
          headline,
          bio: raw?.bio ? String(raw.bio) : undefined,
          location,
          skills: normalizedSkills,
          languages: normalizedLanguages,
          experience: normalizedExperience,
          education: normalizedEducation,
          certifications: normalizedCerts,
          projects: normalizedProjects,
          availability: raw?.availability,
          socialLinks: Array.isArray(raw?.socialLinks)
            ? raw.socialLinks.map((x: any) => String(x))
            : [],
        });

        if (String(user.talentProfileId ?? "") !== String(talent._id)) {
          await User.findByIdAndUpdate(user._id, {
            talentProfileId: talent._id.toString(),
          });
        }

        saved.push({
          talentId: talent._id.toString(),
          userId: user._id.toString(),
          email,
          firstName,
          lastName,
          headline,
          location,
          raw,
        });
      }

      if (saved.length === 0) {
        return res.status(400).json({
          message: "No valid talents to import (missing email)",
        });
      }

      const candidatesData: CandidateData[] = saved.map((s) => {
        const raw = s.raw ?? {};
        const skills = Array.isArray(raw?.skills) ? raw.skills : [];
        const experience = Array.isArray(raw?.experience) ? raw.experience : [];
        const education = Array.isArray(raw?.education) ? raw.education : [];
        const certifications = Array.isArray(raw?.certifications)
          ? raw.certifications
          : [];
        const projects = Array.isArray(raw?.projects) ? raw.projects : [];

        return {
          id: s.talentId,
          firstName: s.firstName,
          lastName: s.lastName,
          headline: s.headline,
          bio: raw?.bio ? String(raw.bio) : undefined,
          skills: skills
            .filter(Boolean)
            .map((sk: any) => ({
              name: String(sk?.name ?? ""),
              level: String(sk?.level ?? "Intermediate"),
              yearsOfExperience: Number(sk?.yearsOfExperience ?? 0),
            }))
            .filter((sk: any) => sk.name),
          experience: experience.filter(Boolean).map((e: any) => ({
            company: String(e?.company ?? ""),
            role: String(e?.role ?? ""),
            description: String(e?.description ?? ""),
            technologies: Array.isArray(e?.technologies)
              ? e.technologies.map((x: any) => String(x))
              : [],
            startDate: e?.startDate ? new Date(e.startDate) : new Date(),
            endDate: e?.endDate ? new Date(e.endDate) : undefined,
          })),
          education: education.filter(Boolean).map((ed: any) => ({
            institution: String(ed?.institution ?? ""),
            degree: String(ed?.degree ?? ""),
            fieldOfStudy: String(ed?.fieldOfStudy ?? ""),
          })),
          certifications: certifications
            .filter(Boolean)
            .map((c: any) => ({
              name: String(c?.name ?? ""),
              issuer: String(c?.issuer ?? ""),
            }))
            .filter((c: any) => c.name),
          projects: projects
            .filter(Boolean)
            .map((p: any) => ({
              name: String(p?.name ?? ""),
              description: String(p?.description ?? ""),
              technologies: Array.isArray(p?.technologies)
                ? p.technologies.map((x: any) => String(x))
                : [],
            }))
            .filter((p: any) => p.name),
        };
      });

      console.log(
        `[screening] runAiScreeningFromHirelens: calling evaluateCandidates candidates=${candidatesData.length} elapsedMs=${Date.now() - startedAt}`,
      );
      const aiResult = await evaluateCandidates(jobData, candidatesData);
      console.log(
        `[screening] runAiScreeningFromHirelens: evaluateCandidates done elapsedMs=${Date.now() - startedAt}`,
      );

      const sortedCandidates = (aiResult.candidates ?? [])
        .slice()
        .sort((a, b) => a.rank - b.rank);
      const trimmed = sortedCandidates.slice(0, safeTopN);

      const screening = await Screening.create({
        jobId: job._id.toString(),
        candidates: trimmed,
        comparisonSummary: aiResult.comparisonSummary,
      });

      const metaById = new Map(
        saved.map((s) => [
          s.talentId,
          {
            email: s.email,
            firstName: s.firstName,
            lastName: s.lastName,
            headline: s.headline,
            location: s.location,
            userId: s.userId,
          },
        ]),
      );

      return res.status(200).json({
        message: `AI screening complete. ${trimmed.length} Hirelens talents ranked`,
        screening,
        topN: safeTopN,
        importedCount: saved.length,
        rankedTalents: trimmed.map((c) => ({
          candidateId: c.candidateId,
          rank: c.rank,
          matchScore: c.matchScore,
          meta: metaById.get(c.candidateId) ?? null,
        })),
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "AI screening failed",
        error: error.message,
      });
    }
  },

  async sendInterviewEmails(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;
      const {
        candidates,
        subject,
        body,
        interviewType,
        date,
        time,
        duration,
        location,
      } = req.body;

      // Import email service and Jobs model
      const { sendMail } = await import("../services/email.service");
      const { default: Jobs } = await import("../models/jobs.model");
      const Screening = await import("../models/screening.model").then(
        (m) => m.default,
      );

      // Fetch screening to get jobId
      const screening = await Screening.findById(screeningId);
      let jobTitle = "Position";
      if (screening) {
        const job = await Jobs.findById(screening.jobId);
        if (job) {
          jobTitle = job.title;
        }
      }

      const results = { sent: 0, failed: 0, errors: [] as string[] };

      for (const candidate of candidates) {
        try {
          // Replace template variables
          const personalizedSubject = subject
            .replace(/{{candidateName}}/g, candidate.name)
            .replace(/{{jobTitle}}/g, jobTitle);

          const personalizedBody = body
            .replace(/{{candidateName}}/g, candidate.name)
            .replace(/{{jobTitle}}/g, jobTitle)
            .replace(/{{interviewDate}}/g, date)
            .replace(/{{interviewTime}}/g, time)
            .replace(/{{duration}}/g, duration)
            .replace(/{{location}}/g, location || "TBD");

          await sendMail({
            to: candidate.email,
            subject: personalizedSubject,
            html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #087F5B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Interview Invitation</h1>
    </div>
    <div class="content">
      <pre style="white-space: pre-wrap; font-family: inherit;">${personalizedBody}</pre>
    </div>
    <div class="footer">
      <p>Sent by Hirelens Hiring Team</p>
    </div>
  </div>
</body>
</html>`,
          });

          results.sent++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(
            `Failed to send to ${candidate.email}: ${error.message}`,
          );
        }
      }

      return res.status(200).json({
        message: `Interview invitation emails sent`,
        sent: results.sent,
        failed: results.failed,
        errors: results.errors.length > 0 ? results.errors : undefined,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to send interview emails",
        error: error.message,
      });
    }
  },

  async sendContractEmails(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;
      const { candidateId, email, subject, body, contractText } = req.body;

      // Import email service
      const { sendMail } = await import("../services/email.service");

      await sendMail({
        to: email,
        subject,
        html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #087F5B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .contract { background: white; padding: 20px; border: 1px solid #ddd; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Employment Contract</h1>
    </div>
    <div class="content">
      <pre style="white-space: pre-wrap; font-family: inherit;">${body}</pre>
      <div class="contract">
        <h3>Contract Terms:</h3>
        <pre style="white-space: pre-wrap; font-family: inherit;">${contractText}</pre>
      </div>
    </div>
    <div class="footer">
      <p>Sent by Hirelens Hiring Team</p>
    </div>
  </div>
</body>
</html>`,
      });

      return res.status(200).json({
        message: `Contract email sent to ${email}`,
        sent: 1,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to send contract email",
        error: error.message,
      });
    }
  },
};

export { screeningController };
