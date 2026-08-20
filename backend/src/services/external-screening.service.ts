/**
 * External Screening Service - Main Orchestrator
 * Re-exports from modular service structure
 */

// Re-export all modular services
export {
  parseSpreadsheet,
  downloadAndParsePDF,
  isPDFUrl,
  structureResumeWithAI,
  cleanupUploadedFile,
  sanitizeText,
} from "./external-screening";

// Re-export types for convenience
export type {
  IExternalApplicant,
  ParsedResume,
} from "../types/external-screening.types";

// Orchestrator: combines resume fetching + AI parsing
import {
  IExternalApplicant,
  ParsedResume,
} from "../types/external-screening.types";
import {
  downloadAndParsePDF,
  isPDFUrl,
  structureResumeWithAI,
} from "./external-screening";

/**
 * Fetch and parse resume for an external applicant
 * Flow: Download PDF (if URL) → Extract text → AI structuring
 */
export async function fetchAndParseResume(
  applicant: IExternalApplicant,
): Promise<ParsedResume | null> {
  try {
    let resumeText = "";

    if (applicant.resumeUrl) {
      if (isPDFUrl(applicant.resumeUrl)) {
        resumeText = await downloadAndParsePDF(applicant.resumeUrl);
      } else {
        resumeText = `[Resume available at: ${applicant.resumeUrl}]`;
      }
    }

    if (!resumeText) {
      resumeText = `Name: ${applicant.firstName} ${applicant.lastName}
Email: ${applicant.email}
Headline: ${applicant.headline || "Not provided"}`;
    }

    return await structureResumeWithAI(resumeText, applicant);
  } catch (error) {
    console.error(`Failed to parse resume for ${applicant.email}:`, error);
    return null;
  }
}
