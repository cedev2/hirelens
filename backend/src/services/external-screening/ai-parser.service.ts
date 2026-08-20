/**
 * AI Parser Service
 * Uses Gemini AI to structure and enhance parsed resume data
 */

import { GoogleGenAI } from "@google/genai";
import ENV from "../../config/env";
import { IExternalApplicant, ParsedResume } from "../../types/external-screening.types";

const genAI = new GoogleGenAI({ apiKey: ENV.gemini_api_key });

export async function structureResumeWithAI(
  resumeText: string,
  applicant: IExternalApplicant
): Promise<ParsedResume> {
  try {
    const prompt = buildResumeParsingPrompt(resumeText, applicant);

    const response = await genAI.models.generateContent({
      model: ENV.gemini_model,
      contents: prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    const parsed: ParsedResume = JSON.parse(text);

    return normalizeParsedResume(parsed, applicant, resumeText);
  } catch (error) {
    console.error("Gemini resume parsing failed:", error);
    return createFallbackResume(applicant, resumeText);
  }
}

function normalizeParsedResume(
  parsed: ParsedResume,
  applicant: IExternalApplicant,
  resumeText: string
): ParsedResume {
  return {
    firstName: parsed.firstName || applicant.firstName,
    lastName: parsed.lastName || applicant.lastName,
    email: parsed.email || applicant.email,
    phone: parsed.phone || applicant.phone || "",
    headline: parsed.headline || applicant.headline || "",
    summary: parsed.summary || resumeText.slice(0, 500),
    skills: parsed.skills || [],
    experience: parsed.experience || [],
    education: parsed.education || [],
    certifications: parsed.certifications || [],
  };
}

function createFallbackResume(applicant: IExternalApplicant, resumeText: string): ParsedResume {
  return {
    firstName: applicant.firstName,
    lastName: applicant.lastName,
    email: applicant.email,
    phone: applicant.phone || "",
    headline: applicant.headline || "",
    summary: resumeText.slice(0, 500),
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };
}

function buildResumeParsingPrompt(resumeText: string, applicant: IExternalApplicant): string {
  return `You are an expert resume parser and data extractor. Extract structured information from the following resume text.

## APPLICANT BASICS (use as hints if text is unclear)
- Name: ${applicant.firstName} ${applicant.lastName}
- Email: ${applicant.email}
- Phone: ${applicant.phone || "Not provided"}
- Headline: ${applicant.headline || "Not provided"}

## RESUME TEXT TO PARSE
\`\`\`
${resumeText.slice(0, 8000)}
\`\`\`

## TASK
Extract and return STRICT JSON with this structure:

{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "headline": "string - professional title/summary",
  "summary": "string - 2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "company": "string",
      "role": "string - job title",
      "description": "string - key responsibilities and achievements",
      "startDate": "string (optional) - e.g., '2020-01' or 'Jan 2020'",
      "endDate": "string (optional) - e.g., '2023-12' or 'Present'"
    }
  ],
  "education": [
    {
      "institution": "string - university/school name",
      "degree": "string - e.g., 'Bachelor of Science', 'MBA'",
      "field": "string - e.g., 'Computer Science', 'Business Administration'"
    }
  ],
  "certifications": ["Certification Name - Issuer", "Another Cert"]
}

## RULES
1. Extract ALL skills mentioned - technical, soft skills, tools, languages
2. For experience: include ALL jobs found with descriptions
3. For education: include degrees, certifications, bootcamps
4. Dates: use original format from text or YYYY-MM
5. Be thorough - don't miss any information
6. If a field is not found, use empty string/array
7. Return ONLY valid JSON, no markdown, no explanations`;
}
