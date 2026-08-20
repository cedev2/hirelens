import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import Talent from "../models/talents.model";
import User from "../models/user.model";
import pdfParse = require("pdf-parse");
import { GoogleGenAI } from "@google/genai";
import ENV from "../config/env";
import axios from "axios";

const genAI = new GoogleGenAI({ apiKey: ENV.gemini_api_key as string });

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

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads/cv");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const pictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(__dirname, "../../uploads/pictures");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 32 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

const uploadPicture = multer({
  storage: pictureStorage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const router = Router();

router.post(
  "/cv",
  authenticateToken,
  requireRole(["applicant", "admin"]),
  uploadCv.single("file"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.userId;
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${baseUrl}/uploads/cv/${req.file.filename}`;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let talent = await Talent.findOne({ userId });
      if (!talent) {
        talent = new Talent({
          userId,
          headline: "Talent",
          location: "Remote",
          skills: [],
          experience: [],
          availability: { status: "Available", type: "Full-time" },
          socialLinks: [],
        });
      }

      try {
        const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
        const pdfBuffer = Buffer.from(response.data);
        const parsed = await pdfParse(pdfBuffer);
        const resumeText = parsed.text;

        if (resumeText && resumeText.trim().length > 10) {
          const prompt = buildResumeParsingPrompt(resumeText, user);
          const aiResponse = await genAI.models.generateContent({
            model: ENV.gemini_model,
            contents: prompt,
            config: { temperature: 0.1, responseMimeType: "application/json" },
          });

          const text = aiResponse.text;
          if (text) {
            try {
              const parsedData = JSON.parse(text);
              talent.headline = parsedData.headline || talent.headline || "";
              talent.bio = parsedData.summary || talent.bio || "";
              talent.location = parsedData.location || talent.location || "";

              if (parsedData.skills && Array.isArray(parsedData.skills)) {
                talent.skills = parsedData.skills.map((s: string) => ({
                  name: s,
                  level: "Intermediate",
                  yearsOfExperience: 1,
                }));
              }

              if (parsedData.experience && Array.isArray(parsedData.experience)) {
                talent.experience = parsedData.experience.map((e: any) => ({
                  company: e.company || "",
                  role: e.role || "",
                  startDate: e.startDate ? new Date(e.startDate) : new Date(),
                  endDate: e.endDate && e.endDate !== "Present" ? new Date(e.endDate) : undefined,
                  description: e.description || "",
                  technologies: e.technologies || [],
                  IsCurrent: e.endDate === "Present" || !e.endDate,
                }));
              }

              if (parsedData.education && Array.isArray(parsedData.education)) {
                talent.education = parsedData.education.map((e: any) => ({
                  institution: e.institution || "",
                  degree: e.degree || "",
                  fieldOfStudy: e.field || "",
                  startYear: new Date(),
                  endYear: new Date(),
                }));
              }

              if (parsedData.certifications && Array.isArray(parsedData.certifications)) {
                talent.certifications = parsedData.certifications.map((c: string) => ({
                  name: c,
                  issuer: "",
                  issueDate: new Date(),
                }));
              }

              talent.rawCv = { text: resumeText, parsedAt: new Date() };
            } catch (jsonError) {
              console.error("Failed to parse AI response JSON:", jsonError);
            }
          }
        }
      } catch (parseError) {
        console.error("Failed to parse PDF content:", parseError);
      }

      talent.cvUrl = fileUrl;
      await talent.save();
      await User.findByIdAndUpdate(userId, { talentProfileId: talent._id });

      res.json({
        message: "CV uploaded successfully",
        files: [{ url: fileUrl, name: req.file.originalname }],
      });
    } catch (error) {
      console.error("CV upload error:", error);
      res.status(500).json({ message: "Failed to process CV upload" });
    }
  },
);

router.post(
  "/picture",
  authenticateToken,
  requireRole(["applicant", "admin"]),
  uploadPicture.single("file"),
  async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.userId;
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fileUrl = `${baseUrl}/uploads/pictures/${req.file.filename}`;

      await User.findByIdAndUpdate(userId, { picture: fileUrl });

      res.json({
        message: "Profile picture uploaded successfully",
        files: [{ url: fileUrl, name: req.file.originalname }],
      });
    } catch (error) {
      console.error("Picture upload error:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  },
);

export default router;
