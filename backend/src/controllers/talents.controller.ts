import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ITalent } from "../types/talents.types";
import Talent from "../models/talents.model";
import User from "../models/user.model";
import pdfParse from "pdf-parse";
import { GoogleGenAI } from "@google/genai";
import ENV from "../config/env";

interface IQuery {
  firstName: any;
  lastName: any;
}

const genAI = new GoogleGenAI({ apiKey: ENV.gemini_api_key });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "resume-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const resumeUpload = upload.single("resume");

const REQUIRED_FIELDS = [
  "headline",
  "location",
  "skills",
  "experience",
  "availability",
] as const;

function buildResumeParsingPrompt(resumeText: string, user: any): string {
  return `You are an expert resume parser. Extract structured information from the resume text.

## USER INFO (use as hints if text is unclear)
- Name: ${user.firstName} ${user.lastName || ""}
- Email: ${user.email}

## RESUME TEXT TO PARSE
\`\`\`
${resumeText.slice(0, 8000)}
\`\`\`

## TASK
Return ONLY valid JSON with this exact structure:
{
  "headline": "string - professional title/headline",
  "summary": "string - professional summary/objective",
  "location": "string - city and country",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "string",
      "role": "string - job title",
      "description": "string - key responsibilities",
      "startDate": "string - e.g. '2020-01' or 'Jan 2020'",
      "endDate": "string - e.g. '2023-12' or 'Present'",
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "institution": "string - university name",
      "degree": "string - e.g. 'Bachelor of Science'",
      "field": "string - e.g. 'Computer Science'"
    }
  ],
  "certifications": ["Certification Name - Issuer"]
}

## RULES
1. Extract ALL technical skills, tools, and languages
2. For experience: include ALL jobs with descriptions
3. Dates: use YYYY-MM format when possible
4. If a field is not found, use empty string/array
5. Return ONLY valid JSON, no markdown or explanations`;
}

const talentController = {
  async getMe(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId)
        return res.status(401).json({ message: "Not authenticated" });

      let talent = await Talent.findOne({ userId }).populate(
        "userId",
        "firstName lastName email picture phone",
      );

      if (!talent) {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newTalent = await Talent.create({
          userId: userId,
          headline: "Talent",
          location: "",
          skills: [],
          experience: [],
          availability: { status: "Available", type: "Full-time" },
          socialLinks: [],
        });

        talent = await Talent.findById(newTalent._id).populate(
          "userId",
          "firstName lastName email picture phone",
        );

        await User.findByIdAndUpdate(userId, {
          talentProfileId: newTalent._id.toString(),
        });
      }

      return res.status(200).json({ message: "Talent profile found", talent });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          message: "Failed to fetch talent profile",
          error: error.message,
        });
    }
  },

  async parseResume(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId)
        return res.status(401).json({ message: "Not authenticated" });

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Resume file is required" });
      }

      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      let talent = await Talent.findOne({ userId });

      if (!talent) {
        talent = new Talent({
          userId: userId,
          headline: "",
          location: "",
          skills: [],
          experience: [],
          availability: { status: "Available", type: "Full-time" },
          socialLinks: [],
        });
      }

      const pdfBuffer = fs.readFileSync(file.path);
      const parsed = await pdfParse(pdfBuffer);
      const resumeText = parsed.text;

      const prompt = buildResumeParsingPrompt(resumeText, user);

      const response = await genAI.models.generateContent({
        model: ENV.gemini_model,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const text = response.text;
      fs.unlinkSync(file.path);

      if (!text) {
        return res
          .status(500)
          .json({ message: "Failed to parse resume with AI" });
      }

      const parsedData = JSON.parse(text);

      talent.headline = parsedData.headline || talent.headline || "";
      talent.bio = parsedData.summary || talent.bio || "";
      talent.location = parsedData.location || talent.location || "";
      talent.skills = (parsedData.skills || []).map((s: string) => ({
        name: s,
        level: "Intermediate" as const,
        yearsOfExperience: 1,
      }));
      talent.experience = (parsedData.experience || []).map((e: any) => ({
        company: e.company || "",
        role: e.role || "",
        startDate: e.startDate ? new Date(e.startDate) : new Date(),
        endDate:
          e.endDate && e.endDate !== "Present"
            ? new Date(e.endDate)
            : undefined,
        description: e.description || "",
        technologies: e.technologies || [],
        IsCurrent: e.endDate === "Present" || !e.endDate,
      }));
      talent.education = (parsedData.education || []).map((e: any) => ({
        institution: e.institution || "",
        degree: e.degree || "",
        fieldOfStudy: e.field || "",
        startYear: new Date(),
        endYear: new Date(),
      }));
      talent.certifications = (parsedData.certifications || []).map(
        (c: string) => ({
          name: c,
          issuer: "",
          issueDate: new Date(),
        }),
      );
      talent.rawCv = { text: resumeText, parsedAt: new Date() };

      await talent.save();

      await User.findByIdAndUpdate(userId, {
        talentProfileId: talent._id.toString(),
      });

      return res.status(200).json({
        message: "Resume parsed and profile updated",
        talent,
      });
    } catch (error: any) {
      const reqFile = (req as any).file;
      if (reqFile?.path && fs.existsSync(reqFile.path)) {
        fs.unlinkSync(reqFile.path);
      }
      return res.status(500).json({
        message: "Failed to parse resume",
        error: error.message,
      });
    }
  },

  async checkProfileCompletion(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      if (!userId)
        return res.status(401).json({ message: "Not authenticated" });

      const talent = await Talent.findOne({ userId });

      if (!talent) {
        return res.status(200).json({
          isComplete: false,
          missingFields: [...REQUIRED_FIELDS],
          hasProfile: false,
        });
      }

      const missingFields: string[] = [];

      if (!talent.headline?.trim()) missingFields.push("headline");
      if (!talent.location?.trim()) missingFields.push("location");
      if (!talent.skills || talent.skills.length === 0)
        missingFields.push("skills");
      if (!talent.experience || talent.experience.length === 0)
        missingFields.push("experience");
      if (!talent.availability?.status) missingFields.push("availability");

      const isComplete = missingFields.length === 0;

      return res.status(200).json({
        isComplete,
        missingFields,
        hasProfile: true,
      });
    } catch (error: any) {
      return res
        .status(500)
        .json({
          message: "Failed to check profile completion",
          error: error.message,
        });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const talents = await Talent.find().populate(
        "userId",
        "firstName lastName email picture phone",
      );

      return res
        .status(200)
        .json({ message: `${talents.length} Talent(s) fetched`, talents });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to fetch all talents", error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { talentId } = req.params;

      const fetchedTalent = await Talent.findById(talentId).populate(
        "userId",
        "firstName lastName email picture phone",
      );

      if (!fetchedTalent)
        return res.status(404).json({ message: "Talent not found" });

      return res.status(200).json({ message: "Talent Found", fetchedTalent });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to fetch a talent", error: error.message });
    }
  },

  async createTalent(req: Request, res: Response) {
    try {
      const payload: ITalent = req.body;

      const createdTalent = await Talent.create(payload);

      return res
        .status(201)
        .json({ message: "New Talent Added", createdTalent });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to create new talent", error: error.message });
    }
  },

  async updateTalent(req: Request, res: Response) {
    try {
      const { talentId } = req.params;
      const payload: any = req.body;

      // If payload contains userId updates, handle them separately
      if (payload.userId) {
        const talent = await Talent.findById(talentId);
        if (talent && talent.userId) {
          // Explicitly update user fields to ensure picture is included
          const userUpdate: any = {};
          if (payload.userId.firstName)
            userUpdate.firstName = payload.userId.firstName;
          if (payload.userId.lastName)
            userUpdate.lastName = payload.userId.lastName;
          if (payload.userId.picture)
            userUpdate.picture = payload.userId.picture;

          await User.findByIdAndUpdate(talent.userId, { $set: userUpdate });
        }
        delete payload.userId;
      }

      const updatedTalent = await Talent.findByIdAndUpdate(talentId, payload, {
        new: true,
      }).populate("userId", "firstName lastName email picture phone");

      if (!updatedTalent)
        return res.status(404).json({ message: "Talent Not Found" });

      return res.status(200).json({ message: "Talent Updated", updatedTalent });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to update talent", error: error.message });
    }
  },

  async deleteTalent(req: Request, res: Response) {
    try {
      const { talentId } = req.params;

      const deleteTalent = await Talent.findByIdAndDelete(talentId);

      if (!talentId)
        return res.status(404).json({ message: "Talent not found" });

      return res
        .status(200)
        .json({ message: "Talent deleted successfully", deleteTalent });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to delete talent", error: error.message });
    }
  },
};

export { talentController };
