import { Request, Response } from "express";
import Screening from "../models/screening.model";
import Talent from "../models/talents.model";
import Jobs from "../models/jobs.model";
import {
  sendScreeningEmails,
  EmailMode,
  CandidateResult,
} from "../services/email.service";

const emailController = {
  async sendScreeningResults(req: Request, res: Response) {
    try {
      const { screeningId } = req.params;
      const {
        mode,
        selectedCandidateId,
      }: { mode: EmailMode; selectedCandidateId?: string } = req.body;

      // Validate mode
      const validModes: EmailMode[] = [
        "selected_only",
        "all_with_ranking",
        "decision_only",
      ];
      if (!validModes.includes(mode)) {
        return res.status(400).json({
          message:
            "Invalid mode. Use: selected_only | all_with_ranking | decision_only",
        });
      }

      // Require selectedCandidateId for selected_only mode
      if (mode === "selected_only" && !selectedCandidateId) {
        return res.status(400).json({
          message: "selectedCandidateId required for 'selected_only' mode",
        });
      }

      // Fetch screening
      const screening = await Screening.findById(screeningId);
      if (!screening) {
        return res.status(404).json({ message: "Screening not found" });
      }

      // Fetch job details
      const job = await Jobs.findById(screening.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Build candidate results with email data
      const candidates: CandidateResult[] = [];
      for (const candidate of screening.candidates) {
        const talent = await Talent.findById(candidate.candidateId).populate(
          "userId",
        );
        // @ts-ignore
        if (!talent || !talent.email) continue;

        candidates.push({
          // @ts-ignore
          candidateId: candidate.candidateId,
          // @ts-ignore
          email: talent.email,
          // @ts-ignore
          firstName: talent.firstName,
          // @ts-ignore
          lastName: talent.lastName,
          rank: candidate.rank,
          matchScore: candidate.matchScore,
          strengths: candidate.strengths,
          gaps: candidate.gaps,
          reasoning: candidate.reasoning,
          finalRecommendation: candidate.finalRecommendation,
        });
      }

      if (candidates.length === 0) {
        return res
          .status(400)
          .json({ message: "No candidates with email addresses found" });
      }

      // Send emails
      const results = await sendScreeningEmails(
        candidates,
        { title: job.title, company: "Our Company" },
        mode,
        selectedCandidateId,
      );

      return res.status(200).json({
        message: `Emails sent successfully`,
        mode,
        sent: results.sent,
        failed: results.failed,
        totalCandidates: candidates.length,
        errors: results.errors.length > 0 ? results.errors : undefined,
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to send emails",
        error: error.message,
      });
    }
  },

  async previewEmail(req: Request, res: Response) {
    try {
      const { mode }: { mode: EmailMode } = req.body;

      // Sample data for preview
      const sampleCandidate: CandidateResult = {
        candidateId: "sample-id",
        email: "preview@example.com",
        firstName: "John",
        lastName: "Doe",
        rank: 1,
        matchScore: 92,
        strengths: [
          "5+ years React experience",
          "AWS certification",
          "Strong leadership",
        ],
        gaps: ["No Python experience"],
        reasoning: "Excellent full-stack background with cloud expertise.",
        finalRecommendation: "Strong hire",
      };

      return res.status(200).json({
        message: "Email preview generated",
        mode,
        preview: {
          subject:
            mode === "selected_only"
              ? "Congratulations! You're Selected"
              : mode === "all_with_ranking"
                ? "Your Application Results"
                : "Email Decision Preview",
          sampleData: sampleCandidate,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        message: "Failed to generate preview",
        error: error.message,
      });
    }
  },
};

export { emailController };
