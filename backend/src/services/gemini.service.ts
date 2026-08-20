import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";
import fs from "fs";
import path from "path";
import ENV from "../config/env";

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: ENV.gemini_api_key });
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Logger to file for debugging Groq issues
const LOG_FILE = path.join(process.cwd(), "logs", "groq-screening.log");
function logToFile(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}${data ? "\n" + JSON.stringify(data, null, 2) : ""}\n`;
  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logEntry);
  } catch (e) {
    console.error("Failed to write to log file:", e);
  }
  // Also output to console
  console.log(logEntry.trim());
}

export interface JobData {
  title: string;
  description: string;
  requirements: string[];
  weights?: {
    skills: number;
    experience: number;
    education: number;
  };
}

export interface CandidateData {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  bio?: string;
  location?: string;
  cvUrl?: string;
  skills: Array<{
    name: string;
    level: string;
    yearsOfExperience: number;
  }>;
  experience: Array<{
    company: string;
    role: string;
    description: string;
    technologies: string[];
    startDate: Date;
    endDate?: Date;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

export interface CandidateScore {
  candidateId: string;
  rank: number;
  matchScore: number;
  confidence: "high" | "medium" | "low";
  strengths: string[];
  gaps: string[];
  reasoning: string;
  finalRecommendation: string;
}

export interface ScreeningResult {
  candidates: CandidateScore[];
  comparisonSummary: string;
}

export async function evaluateCandidatesGroqOnly(
  job: JobData,
  candidates: CandidateData[],
): Promise<ScreeningResult> {
  const startedAt = Date.now();
  const topRequirements = (
    Array.isArray(job.requirements) ? job.requirements : []
  )
    .filter(Boolean)
    .map((r) => String(r).trim())
    .filter(Boolean)
    .slice(0, 5);

  const concurrency = Number(process.env.SCREENING_AI_CONCURRENCY ?? 10);

  const topK = (() => {
    const raw = Number(process.env.SCREENING_AI_TOP_K ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.floor(raw));
  })();

  const stage0 = candidates.map((c) => ({
    candidate: c,
    heuristicScore: computeHeuristicScore(topRequirements, c),
  }));

  const selectedIds = new Set<string>(
    (topK > 0 && topK < candidates.length
      ? stage0
          .slice()
          .sort((a, b) => b.heuristicScore - a.heuristicScore)
          .slice(0, topK)
      : stage0
    ).map((x) => x.candidate.id),
  );

  const stage1Inputs = stage0
    .filter((x) => selectedIds.has(x.candidate.id))
    .map((x) => x.candidate);

  const stage1Ai = await mapWithConcurrency(
    stage1Inputs,
    Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 10,
    async (candidate, index) => {
      const prompt = buildCandidateScoringPrompt(
        job,
        topRequirements,
        candidate,
      );
      try {
        const result = await generateJsonGroqOnly<Stage1CandidateScore>(
          prompt,
          {
            label: `stage1:candidate:${index + 1}/${stage1Inputs.length}`,
            maxOutputTokens: 512,
          },
        );
        return {
          candidateId: candidate.id,
          matchScore: clampInt(Number(result?.matchScore ?? 0), 0, 100),
          strengths: toStringArray(result?.strengths).slice(0, 5),
          gaps: toStringArray(result?.gaps).slice(0, 5),
          shortReason: String(result?.shortReason ?? "")
            .trim()
            .slice(0, 200),
        };
      } catch (error) {
        console.log(
          `Groq stage1 failed (candidateId=${candidate.id}) - continuing with fallback`,
        );
        return {
          candidateId: candidate.id,
          matchScore: 0,
          strengths: [],
          gaps: ["AI evaluation failed"],
          shortReason: "AI evaluation failed",
        };
      }
    },
  );

  const aiById = new Map(stage1Ai.map((x) => [x.candidateId, x] as const));

  const stage1: Stage1CandidateScore[] = stage0.map((x) => {
    const ai = aiById.get(x.candidate.id);
    if (ai) return ai;

    const score = clampInt(x.heuristicScore, 0, 100);
    return {
      candidateId: x.candidate.id,
      matchScore: score,
      strengths: score > 0 ? ["Basic requirement match"] : [],
      gaps: score > 0 ? [] : ["Low requirement match"],
      shortReason: "AI skipped because of incomplete talent's details",
    };
  });

  // Only rank the candidates that were actually evaluated by AI (not skipped ones)
  const stage2Prompt = buildRankingPrompt(stage1Ai);
  const stage2 = await (async () => {
    try {
      return await generateJsonGroqOnly<Stage2RankingResult>(stage2Prompt, {
        label: "stage2:ranking",
        maxOutputTokens: 4096,
      });
    } catch (error) {
      console.log("Groq stage2 ranking failed - using fallback ranking");
      const fallbackRanked = stage1Ai
        .slice()
        .sort((a, b) => b.matchScore - a.matchScore)
        .map((c, idx) => ({
          candidateId: c.candidateId,
          rank: idx + 1,
          finalRecommendation: mapRecommendationFromScore(c.matchScore) as any,
        }));
      return { ranked: fallbackRanked, summary: "" } as Stage2RankingResult;
    }
  })();

  const ranked = Array.isArray(stage2?.ranked)
    ? (stage2.ranked as Stage2RankingResult["ranked"])
    : ([] as Stage2RankingResult["ranked"]);
  const rankById = new Map(
    ranked
      .filter((r: Stage2RankingResult["ranked"][number]) => r && r.candidateId)
      .map((r: Stage2RankingResult["ranked"][number]) => [
        String(r.candidateId),
        {
          rank: clampInt(Number(r.rank ?? 0), 1, 9999),
          finalRecommendation: String(r.finalRecommendation ?? "").trim(),
        },
      ]),
  );

  // Only output the candidates that were AI-evaluated and ranked
  const candidatesOut: CandidateScore[] = stage1Ai
    .map((s) => {
      const rankMeta = rankById.get(s.candidateId);
      return {
        candidateId: s.candidateId,
        rank: rankMeta?.rank ?? 9999,
        matchScore: s.matchScore,
        confidence: deriveConfidence(s.matchScore),
        strengths: s.strengths,
        gaps: s.gaps,
        reasoning: s.shortReason,
        finalRecommendation:
          rankMeta?.finalRecommendation ||
          mapRecommendationFromScore(s.matchScore),
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  console.log(
    `AI screening pipeline (groq-only) complete: candidates=${candidates.length} aiEvaluated=${stage1Inputs.length} ranked=${candidatesOut.length} concurrency=${
      Number.isFinite(concurrency) ? concurrency : "default"
    } totalMs=${Date.now() - startedAt}`,
  );

  return {
    candidates: candidatesOut,
    comparisonSummary: String(
      (stage2 as any)?.comparisonSummary ?? (stage2 as any)?.summary ?? "",
    ).trim(),
  };
}

async function generateJsonGroqOnly<T>(
  prompt: string,
  opts?: { label?: string; maxOutputTokens?: number },
): Promise<T> {
  return generateJson<T>(prompt, opts);
}

export async function evaluateCandidates(
  job: JobData,
  candidates: CandidateData[],
): Promise<ScreeningResult> {
  const startedAt = Date.now();
  const topRequirements = (
    Array.isArray(job.requirements) ? job.requirements : []
  )
    .filter(Boolean)
    .map((r) => String(r).trim())
    .filter(Boolean)
    .slice(0, 5);

  const concurrency = Number(process.env.SCREENING_AI_CONCURRENCY ?? 10);

  const topK = (() => {
    const raw = Number(process.env.SCREENING_AI_TOP_K ?? 0);
    if (!Number.isFinite(raw)) return 0;
    return Math.max(0, Math.floor(raw));
  })();

  const stage0 = candidates.map((c) => ({
    candidate: c,
    heuristicScore: computeHeuristicScore(topRequirements, c),
  }));

  const selectedIds = new Set<string>(
    (topK > 0 && topK < candidates.length
      ? stage0
          .slice()
          .sort((a, b) => b.heuristicScore - a.heuristicScore)
          .slice(0, topK)
      : stage0
    ).map((x) => x.candidate.id),
  );

  const stage1Inputs = stage0
    .filter((x) => selectedIds.has(x.candidate.id))
    .map((x) => x.candidate);

  const stage1Ai = await mapWithConcurrency(
    stage1Inputs,
    Number.isFinite(concurrency) && concurrency > 0 ? concurrency : 10,
    async (candidate, index) => {
      const prompt = buildCandidateScoringPrompt(
        job,
        topRequirements,
        candidate,
      );
      try {
        const result = await generateJson<Stage1CandidateScore>(prompt, {
          label: `stage1:candidate:${index + 1}/${stage1Inputs.length}`,
          maxOutputTokens: 512,
        });
        return {
          candidateId: candidate.id,
          matchScore: clampInt(Number(result?.matchScore ?? 0), 0, 100),
          strengths: toStringArray(result?.strengths).slice(0, 5),
          gaps: toStringArray(result?.gaps).slice(0, 5),
          shortReason: String(result?.shortReason ?? "")
            .trim()
            .slice(0, 200),
        };
      } catch (error) {
        console.log(
          `Gemini stage1 failed (candidateId=${candidate.id}) - continuing with fallback`,
        );
        return {
          candidateId: candidate.id,
          matchScore: 0,
          strengths: [],
          gaps: ["AI evaluation failed"],
          shortReason: "AI evaluation failed",
        };
      }
    },
  );

  const aiById = new Map(stage1Ai.map((x) => [x.candidateId, x] as const));

  const stage1: Stage1CandidateScore[] = stage0.map((x) => {
    const ai = aiById.get(x.candidate.id);
    if (ai) return ai;

    const score = clampInt(x.heuristicScore, 0, 100);
    return {
      candidateId: x.candidate.id,
      matchScore: score,
      strengths: score > 0 ? ["Basic requirement match"] : [],
      gaps: score > 0 ? [] : ["Low requirement match"],
      shortReason: "AI skipped because of incomplete talent's details",
    };
  });

  // Only rank the candidates that were actually evaluated by AI (not skipped ones)
  const stage2Prompt = buildRankingPrompt(stage1Ai);
  const stage2 = await (async () => {
    try {
      return await generateJson<Stage2RankingResult>(stage2Prompt, {
        label: "stage2:ranking",
        maxOutputTokens: 4096,
      });
    } catch (error) {
      console.log("Gemini stage2 ranking failed - using fallback ranking");
      const fallbackRanked = stage1Ai
        .slice()
        .sort((a, b) => b.matchScore - a.matchScore)
        .map((c, idx) => ({
          candidateId: c.candidateId,
          rank: idx + 1,
          finalRecommendation: mapRecommendationFromScore(c.matchScore) as any,
        }));
      return { ranked: fallbackRanked, summary: "" } as Stage2RankingResult;
    }
  })();

  const ranked = Array.isArray(stage2?.ranked) ? stage2.ranked : [];
  const rankById = new Map(
    ranked
      .filter((r) => r && r.candidateId)
      .map((r) => [
        String(r.candidateId),
        {
          rank: clampInt(Number(r.rank ?? 0), 1, 9999),
          finalRecommendation: String(r.finalRecommendation ?? "").trim(),
        },
      ]),
  );

  // Only output the candidates that were AI-evaluated and ranked
  const candidatesOut: CandidateScore[] = stage1Ai
    .map((s) => {
      const rankMeta = rankById.get(s.candidateId);
      return {
        candidateId: s.candidateId,
        rank: rankMeta?.rank ?? 9999,
        matchScore: s.matchScore,
        confidence: deriveConfidence(s.matchScore),
        strengths: s.strengths,
        gaps: s.gaps,
        reasoning: s.shortReason,
        finalRecommendation:
          rankMeta?.finalRecommendation ||
          mapRecommendationFromScore(s.matchScore),
      };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  console.log(
    `AI screening pipeline (gemini) complete: candidates=${candidates.length} aiEvaluated=${stage1Inputs.length} ranked=${candidatesOut.length} concurrency=${
      Number.isFinite(concurrency) ? concurrency : "default"
    } totalMs=${Date.now() - startedAt}`,
  );

  return {
    candidates: candidatesOut,
    comparisonSummary: String(
      (stage2 as any)?.comparisonSummary ?? (stage2 as any)?.summary ?? "",
    ).trim(),
  };
}

type Stage1CandidateScore = {
  candidateId: string;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  shortReason: string;
};

type Stage2RankingResult = {
  ranked: Array<{
    candidateId: string;
    rank: number;
    finalRecommendation: "Strong hire" | "Consider" | "Weak fit" | "Reject";
  }>;
  summary?: string;
  comparisonSummary?: string;
};

function buildCandidateScoringPrompt(
  job: JobData,
  topRequirements: string[],
  candidate: CandidateData,
): string {
  const name =
    `${candidate.firstName ?? ""} ${candidate.lastName ?? ""}`.trim();
  const skills = toUniqueStrings(candidate.skills?.map((s) => s?.name)).slice(
    0, 20,
  );
  const roles = toUniqueStrings(
    candidate.experience?.map((e) => e?.role),
  ).slice(0, 10);
  const degrees = toUniqueStrings(
    candidate.education?.map((e) => e?.degree),
  ).slice(0, 5);

  const experienceDetails = (candidate.experience || []).slice(0, 5).map((e) =>
    `${e.role || "Unknown"} at ${e.company || "Unknown"}${e.description ? ` - ${e.description.slice(0, 200)}` : ""}${e.technologies?.length ? ` [Tech: ${e.technologies.join(", ")}]` : ""}`
  ).join("\n");
  const educationDetails = (candidate.education || []).slice(0, 3).map((e) =>
    `${e.degree || ""} in ${e.fieldOfStudy || ""} - ${e.institution || ""}`
  ).join("\n");

  return `Evaluate this candidate for the job.

JOB:
Title: ${String(job.title ?? "").trim()}
Key Requirements:
${topRequirements.map((r) => `- ${r}`).join("\n")}

CANDIDATE:
CandidateId: ${candidate.id}
Name: ${name || "Unknown"}
${candidate.bio ? `Bio: ${candidate.bio.slice(0, 300)}` : ""}
${candidate.location ? `Location: ${candidate.location}` : ""}
Skills: ${skills.join(", ") || "None"}
Experience:
${experienceDetails || "None"}
Education:
${educationDetails || "None"}

TASK:
Evaluate how well the candidate matches the job requirements. Consider:
- Skills alignment with job requirements
- Relevant work experience and responsibilities
- Education and qualifications
- Technologies used in previous roles

Calculate matchScore based on:
- 90-100: Perfect match, exceeds all key requirements
- 70-89: Strong match, meets most requirements with relevant experience
- 50-69: Moderate match, meets some requirements
- 30-49: Weak match, limited relevant experience
- 0-29: Poor match, lacks key requirements

Return STRICT JSON:

{
  "candidateId": "string",
  "matchScore": 75,
  "strengths": ["short bullet"],
  "gaps": ["short bullet"],
  "shortReason": "1 sentence"
}

Rules:
- matchScore: integer 0-100 based on criteria above
- Keep strengths/gaps short (max 5 each)
- shortReason: 1 sentence explaining the score`;
}

function buildRankingPrompt(stage1: Stage1CandidateScore[]): string {
  const input = stage1.map((c) => ({
    candidateId: c.candidateId,
    matchScore: c.matchScore,
    strengths: c.strengths,
  }));

  return `Rank these candidates in DESCENDING order by matchScore (highest first). Candidate with highest matchScore gets rank 1.

Input (already sorted by matchScore descending):
${JSON.stringify(input)}

CRITICAL RULES:
1. Rank 1 = HIGHEST matchScore (strongest candidate)
2. Sort ALL candidates by matchScore descending
3. If scores equal, use strengths to break ties
4. Assign ranks 1, 2, 3... N sequentially
5. Do NOT skip ranks or reorder arbitrarily

Return JSON:
{
  "ranked": [
    {
      "candidateId": "string",
      "rank": 1,
      "finalRecommendation": "Strong hire"
    }
  ],
  "comparisonSummary": "Why top candidates ranked highest"
}

Recommendations based on matchScore:
- 80-100: "Strong hire"
- 60-79: "Consider"
- 40-59: "Weak fit"
- 0-39: "Reject"
`;
}

async function generateJson<T>(
  prompt: string,
  opts?: { label?: string; maxOutputTokens?: number },
): Promise<T> {
  const label = opts?.label ? ` (${opts.label})` : "";
  const approxChars = prompt.length;
  const maxOutputTokens =
    Number.isFinite(opts?.maxOutputTokens) &&
    (opts?.maxOutputTokens as number) > 0
      ? (opts?.maxOutputTokens as number)
      : undefined;

  const hasGroq = Boolean(String(process.env.GROQ_API_KEY ?? "").trim());

  // Primary: Groq (faster). Fallback: Gemini (more accurate).
  if (hasGroq) {
    const startedAt = Date.now();
    console.log(
      `Groq request${label}: model=${getGroqModel()} promptChars=${approxChars} maxOutputTokens=${maxOutputTokens ?? "default"} (primary)`,
    );
    try {
      const parsed = await generateJsonWithGroq<T>(prompt, {
        maxOutputTokens,
        label: opts?.label,
      });
      console.log(
        `Groq response${label}: ok in ${Date.now() - startedAt}ms (primary)`,
      );
      return parsed;
    } catch (error) {
      console.log(
        `Groq primary${label}: failed in ${Date.now() - startedAt}ms - falling back to Gemini`,
      );
      console.log(`Groq error${label}:`, (error as any)?.message ?? String(error));
    }
  }

  // Fallback: Gemini with retries
  const maxAttempts = clampInt(
    Number(process.env.SCREENING_AI_RETRIES ?? 2) + 1,
    1,
    6,
  );

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const startedAt = Date.now();

    console.log(
      `Gemini request${label}: model=${ENV.gemini_model} promptChars=${approxChars} maxOutputTokens=${maxOutputTokens ?? "default"} attempt=${attempt}/${maxAttempts}`,
    );

    try {
      const response = await genAI.models.generateContent({
        model: ENV.gemini_model,
        contents: prompt,
        config: {
          temperature: 0,
          responseMimeType: "application/json",
          ...(maxOutputTokens ? { maxOutputTokens } : {}),
        },
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini API");

      try {
        const parsed = JSON.parse(stripJsonFences(text)) as T;
        console.log(
          `Gemini response${label}: ok in ${Date.now() - startedAt}ms`,
        );
        return parsed;
      } catch (error) {
        console.log(
          `Gemini response${label}: JSON parse failed in ${Date.now() - startedAt}ms`,
        );
        throw new Error(`Failed to parse Gemini response: ${error}`);
      }
    } catch (error) {
      lastError = error;
      const transient = isTransientGeminiError(error);
      console.log(
        `Gemini error${label}: transient=${transient} attempt=${attempt}/${maxAttempts}`,
      );
      console.log(`Gemini error detail${label}:`, (error as any)?.message ?? String(error));
      if (!transient || attempt === maxAttempts) break;
      await sleep(computeBackoffMs(attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function getGroqModel() {
  return (
    String(process.env.GROQ_MODEL ?? "llama-4-scout").trim() || "llama-4-scout"
  );
}

function stripJsonFences(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/);
  return match ? match[1].trim() : trimmed;
}

async function generateJsonWithGroq<T>(
  prompt: string,
  opts?: { maxOutputTokens?: number; label?: string },
): Promise<T> {
  const apiKey = String(process.env.GROQ_API_KEY ?? "").trim();
  if (!apiKey) throw new Error("Missing GROQ_API_KEY");

  const maxTokens =
    Number.isFinite(opts?.maxOutputTokens) &&
    (opts?.maxOutputTokens as number) > 0
      ? (opts?.maxOutputTokens as number)
      : 8192;

  const model = getGroqModel();
  const label = opts?.label ?? "groq-request";
  const maxAttempts = 3;

  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const chatCompletion = await groqClient.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are a strict JSON generator. Output ONLY valid JSON. No markdown, no commentary.",
          },
          { role: "user", content: prompt },
        ],
        model: model,
        temperature: 0,
        max_completion_tokens: maxTokens,
        top_p: 1,
        stream: false,
        stop: null,
      });

      const text = String(
        chatCompletion.choices?.[0]?.message?.content ?? "",
      ).trim();

      if (!text) throw new Error("Empty response from Groq API");

      const parsed = JSON.parse(text) as T;
      return parsed;
    } catch (err: any) {
      lastError = err;
      const status = err?.response?.status ?? err?.status;
      const isRateLimit = status === 429 || String(err?.message ?? "").includes("rate_limit");
      if (isRateLimit && attempt < maxAttempts) {
        const waitMs = computeBackoffMs(attempt);
        console.log(`Groq ${label}: rate limited, retrying in ${waitMs}ms (attempt ${attempt}/${maxAttempts})`);
        await sleep(waitMs);
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeBackoffMs(attempt: number) {
  const base = 500;
  const cappedAttempt = Math.min(Math.max(attempt, 1), 6);
  const exp = base * Math.pow(2, cappedAttempt - 1);
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(exp + jitter, 6000);
}

function isTransientGeminiError(error: unknown) {
  const msg = String((error as any)?.message ?? error ?? "").toLowerCase();
  const code = String((error as any)?.code ?? "").toLowerCase();
  const status = (error as any)?.status ?? (error as any)?.statusCode;
  return (
    msg.includes("internal") ||
    msg.includes('"code":500') ||
    msg.includes('status":"internal') ||
    msg.includes("429") ||
    msg.includes("resource_exhausted") ||
    msg.includes("timeout") ||
    status === 429 ||
    status === 500 ||
    status === 503
  );
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({
    length: Math.min(concurrency, items.length),
  }).map(async () => {
    while (true) {
      const current = nextIndex;
      nextIndex += 1;
      if (current >= items.length) return;
      results[current] = await mapper(items[current], current);
    }
  });

  await Promise.all(workers);
  return results;
}

function deriveConfidence(score: number): CandidateScore["confidence"] {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

function mapRecommendationFromScore(
  score: number,
): CandidateScore["finalRecommendation"] {
  if (score >= 85) return "Strong hire";
  if (score >= 70) return "Consider";
  if (score >= 50) return "Weak fit";
  return "Reject";
}

function clampInt(n: number, min: number, max: number) {
  const x = Math.round(Number(n));
  if (!Number.isFinite(x)) return min;
  return Math.min(max, Math.max(min, x));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function toUniqueStrings(value: unknown): string[] {
  const arr = Array.isArray(value) ? value : [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of arr) {
    const s = String(v ?? "").trim();
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
  }
  return out;
}

function computeHeuristicScore(
  requirements: string[],
  candidate: CandidateData,
) {
  const reqTokens = tokenize(requirements.join(" "));
  if (reqTokens.size === 0) return 0;

  const skills = toUniqueStrings(candidate.skills?.map((s) => s?.name)).join(
    " ",
  );
  const roles = toUniqueStrings(candidate.experience?.map((e) => e?.role)).join(
    " ",
  );
  const degrees = toUniqueStrings(
    candidate.education?.map((e) => e?.degree),
  ).join(" ");

  const candTokens = tokenize(`${skills} ${roles} ${degrees}`);
  if (candTokens.size === 0) return 0;

  let overlap = 0;
  for (const t of reqTokens) {
    if (candTokens.has(t)) overlap += 1;
  }

  const ratio = overlap / Math.max(reqTokens.size, 1);
  return Math.round(ratio * 100);
}

function tokenize(text: string) {
  const cleaned = String(text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+.#-]/g, " ");
  const parts = cleaned.split(/\s+/g).filter(Boolean);

  const stop = new Set([
    "and",
    "or",
    "the",
    "a",
    "an",
    "to",
    "in",
    "for",
    "with",
    "of",
    "on",
    "at",
    "as",
    "is",
    "are",
    "be",
    "this",
    "that",
    "from",
  ]);

  const set = new Set<string>();
  for (const p of parts) {
    if (p.length < 2) continue;
    if (stop.has(p)) continue;
    set.add(p);
  }
  return set;
}
