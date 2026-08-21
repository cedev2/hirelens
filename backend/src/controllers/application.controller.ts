import { Request, Response } from "express";
import Application from "../models/application.model";
import Jobs from "../models/jobs.model";
import Talent from "../models/talents.model";
import User from "../models/user.model";
import { IApplication } from "../types/application.types";
import { sendApplicationConfirmation } from "../services/email.service";

const applicationController = {
  async getAll(req: Request, res: Response) {
    try {
      const applications = await Application.find();
      return res.status(200).json({
        message: `${applications.length} application(s) fetched`,
        applications,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch applications",
        error: error.message,
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const application = await Application.findById(id);

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      return res
        .status(200)
        .json({ message: "Application found", application });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch application",
        error: error.message,
      });
    }
  },

  async getByJobId(req: Request, res: Response) {
    try {
      const { jobId } = req.params;
      const applications = await Application.find({ jobId }).populate("jobId");

      return res.status(200).json({
        message: `${applications.length} application(s) for job`,
        applications,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch job applications",
        error: error.message,
      });
    }
  },

  async getByTalentId(req: Request, res: Response) {
    try {
      const { talentId } = req.params;
      const applications = await Application.find({ talentId }).populate(
        "jobId",
      );

      return res.status(200).json({
        message: `${applications.length} application(s) by talent`,
        applications,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to fetch talent applications",
        error: error.message,
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const {
        jobId,
        talentId,
        coverLetter,
        cvUrl,
        resumeUrl,
        phoneNumber,
        location,
        skills,
        experience,
        education,
        certifications,
      }: IApplication = req.body;

      if (!jobId || !talentId) {
        return res.status(400).json({
          message: "jobId and talentId are required",
        });
      }

      const existing = await Application.findOne({ jobId, talentId });
      if (existing) {
        return res.status(409).json({
          message: "Talent already applied to this job",
        });
      }

      const application = await Application.create({
        jobId,
        talentId,
        coverLetter,
        cvUrl,
        resumeUrl,
        phoneNumber,
        location,
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        certifications: certifications || [],
        status: "pending",
      });

      // Send confirmation email (async, don't block response)
      (async () => {
        try {
          const job = await Jobs.findById(jobId);
          const talent = await Talent.findById(talentId).populate("userId");

          if (job && talent && (talent.userId as any)?.email) {
            const user = talent.userId as any;
            await sendApplicationConfirmation(user.email, {
              candidateName: `${user.firstName} ${user.lastName || ""}`.trim(),
              jobTitle: job.title,
              timestamp: (application as any).createdAt || new Date(),
            });
          }
        } catch (emailError) {
          console.error("Background email task failed:", emailError);
        }
      })();

      return res.status(201).json({
        message: "Application submitted successfully",
        application,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to create application",
        error: error.message,
      });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const update: Record<string, any> = {};
      if (status) update.status = status;
      if (notes !== undefined) update.notes = notes;

      const application = await Application.findByIdAndUpdate(
        id,
        update,
        { returnDocument: "after" },
      );

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      return res.status(200).json({
        message: `Application status updated to ${status}`,
        application,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to update application",
        error: error.message,
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deleted = await Application.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }

      return res.status(200).json({
        message: "Application deleted",
        application: deleted,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to delete application",
        error: error.message,
      });
    }
  },
};

export { applicationController };
