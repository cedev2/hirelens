import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Jobs from "../models/jobs.model";
import ExternalScreening from "../models/external-screening.model";
import {
  parseSpreadsheet,
  fetchAndParseResume,
  cleanupUploadedFile,
} from "../services/external-screening.service";
import {
  evaluateCandidates,
  evaluateCandidatesGroqOnly,
  JobData,
  CandidateData,
} from "../services/gemini.service";
import {
  IExternalApplicant,
  IExternalScreeningResult,
} from "../types/external-screening.types";

// Multer config for file uploads
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
    cb(null, "screening-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [".csv", ".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV and Excel files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}); // 10MB limit

const externalScreeningController = {
  // Upload and screen external applicants
  async uploadAndScreen(req: Request, res: Response) {
    try {
      const { jobId, topN = 10 } = req.body;
      const file = req.file;

      if (!jobId || !file) {
        return res.status(400).json({
          message: "Job ID and spreadsheet file are required",
        });
      }

      const uploadedFile = file as Express.Multer.File;

      // Verify job exists
      const job = await Jobs.findById(jobId);
      if (!job) {
        cleanupUploadedFile(uploadedFile.path);
        return res.status(404).json({ message: "Job not found" });
      }

      // Create screening record
      const screening = await ExternalScreening.create({
        jobId,
        totalApplicants: 0,
        processedApplicants: 0,
        topCandidates: [],
        allResults: [],
        status: "processing",
        sourceFile: uploadedFile.originalname,
      });

      // Parse spreadsheet
      let applicants: IExternalApplicant[];
      try {
        applicants = await parseSpreadsheet(uploadedFile.path);
      } catch (parseError: any) {
        cleanupUploadedFile(uploadedFile.path);
        screening.status = "failed";
        await screening.save();
        return res.status(400).json({
          message: "Failed to parse spreadsheet",
          error: parseError.message,
        });
      }

      // Update total applicants
      screening.totalApplicants = applicants.length;
      await screening.save();

      // Cleanup uploaded file after parsing
      cleanupUploadedFile(uploadedFile.path);

      // Start async screening process
      processApplicantsAsync(
        String(screening._id),
        jobId,
        applicants,
        parseInt(topN),
        "gemini",
      );

      return res.status(202).json({
        message: "Screening started",
        screeningId: screening._id,
        totalApplicants: applicants.length,
        status: "processing",
      });
    } catch (error: any) {
      const reqFile = (req as any).file as Express.Multer.File | undefined;
      if (reqFile) cleanupUploadedFile(reqFile.path);
      return res.status(500).json({
        message: "Screening upload failed",
        error: error.message,
      });
    }
  },

  async uploadAndScreenGroq(req: Request, res: Response) {
    try {
      const { jobId, topN = 10 } = req.body;
      const file = req.file;

      if (!jobId || !file) {
        return res.status(400).json({
          message: "Job ID and spreadsheet file are required",
        });
      }

      const uploadedFile = file as Express.Multer.File;

      // Verify job exists
      const job = await Jobs.findById(jobId);
      if (!job) {
        cleanupUploadedFile(uploadedFile.path);
        return res.status(404).json({ message: "Job not found" });
      }

      // Create screening record
      const screening = await ExternalScreening.create({
        jobId,
        totalApplicants: 0,
        processedApplicants: 0,
        topCandidates: [],
        allResults: [],
        status: "processing",
        sourceFile: uploadedFile.originalname,
      });

      // Parse spreadsheet
      let applicants: IExternalApplicant[];
      try {
        applicants = await parseSpreadsheet(uploadedFile.path);
      } catch (parseError: any) {
        cleanupUploadedFile(uploadedFile.path);
        screening.status = "failed";
        await screening.save();
        return res.status(400).json({
          message: "Failed to parse spreadsheet",
          error: parseError.message,
        });
      }

      // Update total applicants
      screening.totalApplicants = applicants.length;
      await screening.save();

      // Cleanup uploaded file after parsing
      cleanupUploadedFile(uploadedFile.path);

      // Start async screening process
      processApplicantsAsync(
        String(screening._id),
        jobId,
        applicants,
        parseInt(topN),
        "groq",
      );

      return res.status(202).json({
        message: "Screening started",
        screeningId: screening._id,
        totalApplicants: applicants.length,
        status: "processing",
      });
    } catch (error: any) {
      const reqFile = (req as any).file as Express.Multer.File | undefined;
      if (reqFile) cleanupUploadedFile(reqFile.path);
      return res.status(500).json({
        message: "Screening upload failed",
        error: error.message,
      });
    }
  },

  // Get screening results
  async getResults(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;

      const screening = await ExternalScreening.findById(screeningId);
      if (!screening) {
        return res.status(404).json({ message: "Screening not found" });
      }

      return res.status(200).json({
        screeningId: screening._id,
        jobId: screening.jobId,
        status: screening.status,
        totalApplicants: screening.totalApplicants,
        processedApplicants: screening.processedApplicants,
        topCandidates: screening.topCandidates,
        progress:
          Math.round(
            (screening.processedApplicants / screening.totalApplicants) * 100,
          ) || 0,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to get screening results",
        error: error.message,
      });
    }
  },

  // Get detailed results with all candidates
  async getDetailedResults(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;
      const { limit = 50, skip = 0 } = req.query;

      const screening = await ExternalScreening.findById(screeningId);
      if (!screening) {
        return res.status(404).json({ message: "Screening not found" });
      }

      const allResults = screening.allResults;
      const paginatedResults = allResults
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(Number(skip), Number(skip) + Number(limit));

      return res.status(200).json({
        screeningId: screening._id,
        jobId: screening.jobId,
        status: screening.status,
        totalApplicants: screening.totalApplicants,
        processedApplicants: screening.processedApplicants,
        results: paginatedResults,
        pagination: {
          total: allResults.length,
          limit: Number(limit),
          skip: Number(skip),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to get detailed results",
        error: error.message,
      });
    }
  },

  // List all external screenings for a job
  async getScreeningsByJob(req: Request, res: Response) {
    try {
      const { jobId } = req.params;

      const screenings = await ExternalScreening.find({ jobId })
        .sort({ createdAt: -1 })
        .select(
          "_id status totalApplicants processedApplicants sourceFile createdAt",
        );

      return res.status(200).json({ screenings });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to get screenings",
        error: error.message,
      });
    }
  },
};

// Async processing function
async function processApplicantsAsync(
  screeningId: string,
  jobId: string,
  applicants: IExternalApplicant[],
  topN: number,
  provider: "gemini" | "groq",
) {
  try {
    const job = await Jobs.findById(jobId);
    if (!job) throw new Error("Job not found");

    const jobData: JobData = {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      weights: job.weights,
    };

    const candidateDataList: CandidateData[] = [];
    const applicantMap = new Map<string, IExternalApplicant>();

    // Fetch and parse resumes
    for (let i = 0; i < applicants.length; i++) {
      const applicant = applicants[i];
      const parsedResume = await fetchAndParseResume(applicant);

      if (parsedResume) {
        const candidateData: CandidateData = {
          id: applicant.id,
          firstName: parsedResume.firstName || applicant.firstName,
          lastName: parsedResume.lastName || applicant.lastName,
          headline: parsedResume.headline || "",
          bio: parsedResume.summary,
          skills: parsedResume.skills.map((s) => ({
            name: s,
            level: "intermediate",
            yearsOfExperience: 0,
          })),
          experience: parsedResume.experience.map((e) => ({
            company: e.company,
            role: e.role,
            description: e.description,
            technologies: [],
            startDate: e.startDate ? new Date(e.startDate) : new Date(),
            endDate: e.endDate ? new Date(e.endDate) : undefined,
          })),
          education: parsedResume.education.map((e) => ({
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.field || "",
          })),
          certifications: parsedResume.certifications?.map((c) => ({
            name: c,
            issuer: "",
          })),
          projects: [],
        };

        candidateDataList.push(candidateData);
        applicantMap.set(applicant.id, applicant);
      }

      // Update progress every 5 applicants
      if ((i + 1) % 5 === 0 || i === applicants.length - 1) {
        await ExternalScreening.findByIdAndUpdate(screeningId, {
          processedApplicants: i + 1,
        });
      }
    }

    const evaluationResult =
      provider === "groq"
        ? await evaluateCandidatesGroqOnly(jobData, candidateDataList)
        : await evaluateCandidates(jobData, candidateDataList);

    // Map results to external screening format
    const results: IExternalScreeningResult[] = evaluationResult.candidates.map(
      (c) => ({
        applicantId: c.candidateId,
        matchScore: c.matchScore,
        skillsMatch: c.matchScore * 0.4, // Approximate from weights
        experienceMatch: c.matchScore * 0.35,
        educationMatch: c.matchScore * 0.25,
        reasoning: c.reasoning,
        strengths: c.strengths,
        gaps: c.gaps,
        recommendation: mapRecommendation(c.matchScore),
      }),
    );

    // Sort by match score and get top N
    results.sort((a, b) => b.matchScore - a.matchScore);
    const topCandidates = results.slice(0, topN);

    // Update screening with results
    await ExternalScreening.findByIdAndUpdate(screeningId, {
      status: "completed",
      topCandidates,
      allResults: results,
      processedApplicants: applicants.length,
    });

    console.log(
      `External screening ${screeningId} completed. Top ${topN} candidates identified.`,
    );
  } catch (error) {
    console.error(`External screening ${screeningId} failed:`, error);
    await ExternalScreening.findByIdAndUpdate(screeningId, {
      status: "failed",
    });
  }
}

function mapRecommendation(
  score: number,
): IExternalScreeningResult["recommendation"] {
  if (score >= 85) return "highly_recommended";
  if (score >= 70) return "recommended";
  if (score >= 50) return "consider";
  return "not_suitable";
}

export default externalScreeningController;
