import { Request, Response } from "express";
import axios from "axios";
import ENV from "../config/env";
import Jobs from "../models/jobs.model";

const SYSTEM_PROMPT = `You are HireLens AI, the intelligent assistant for HireLens — an AI-powered recruitment platform developed by **Group X**. You help applicants, job seekers, and users navigate the HireLens system.

## About HireLens
HireLens is a modern AI-driven recruitment platform that helps companies screen candidates, manage job postings, and make data-driven hiring decisions. It was developed by **Group X**.

## Your Capabilities
- Help users understand how to use HireLens (register, apply, track applications)
- Give job search and career advice (resume tips, cover letter writing, interview prep)
- Explain how AI screening works on the platform
- Answer questions about available jobs, application status, and the hiring process
- Respond in **English**, **Kinyarwanda (Ikinyarwanda)**, **French**, or **Swahili** — match the language the user writes in

## How HireLens Works
1. **Applicants** register at /applicant/auth/register, browse jobs at /applicant/jobs, and apply
2. **Applications** go through statuses: Pending → Reviewing → Shortlisted → Hired (or Rejected)
3. **Admins** use AI-powered screening to evaluate candidates with match scores
4. The platform uses advanced AI (Gemini/Groq) to rank candidates by skills, experience, and education

## Tips You Can Share
- Always tailor your cover letter to the specific job
- Highlight relevant skills and experience that match the job requirements
- Keep your profile complete and up to date
- Check your application status regularly in the My Applications dashboard
- Apply to multiple positions to increase your chances

## Important Rules
- Always mention that HireLens was developed by **Group X** when asked about the creators
- Be helpful, friendly, and professional
- Keep responses concise and actionable
- If asked about something outside HireLens scope, politely redirect to HireLens-related topics
- Respond in the same language the user writes in`;

const chatController = {
  async sendMessage(req: Request, res: Response) {
    try {
      const { messages } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ message: "Messages array is required" });
      }

      // Fetch current job data for context
      let jobContext = "";
      try {
        const jobs = await Jobs.find({ status: "open" }).select("title jobType locationType status").lean();
        const closedJobs = await Jobs.find({ status: "closed" }).select("title jobType locationType status").lean();

        if (jobs.length > 0) {
          jobContext += "\n\n## Currently Open Jobs\n";
          jobs.forEach((j: any) => {
            jobContext += `- ${j.title} (${j.jobType}, ${j.locationType})\n`;
          });
        }
        if (closedJobs.length > 0) {
          jobContext += "\n## Closed Jobs\n";
          closedJobs.forEach((j: any) => {
            jobContext += `- ${j.title} (${j.jobType}, ${j.locationType})\n`;
          });
        }
      } catch {
        // Ignore job fetch errors — chat still works without job context
      }

      const fullSystemPrompt = SYSTEM_PROMPT + jobContext;

      // EjoChat does not support "system" role — prepend context as a user/assistant pair
      const apiMessages = [
        { role: "user", content: fullSystemPrompt },
        { role: "assistant", content: "Understood. I am HireLens AI, built by Group X. I will follow these instructions and help the user with HireLens-related questions." },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const response = await axios.post(
        "https://api.ejolabs.com/api/v1/subiza",
        { messages: apiMessages },
        {
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": ENV.ejochat_api_key,
          },
          timeout: 60000,
        },
      );

      const data = response.data;

      // EjoChat returns OpenAI-style: choices[0].message.content
      const reply =
        data?.choices?.[0]?.message?.content ||
        data?.reply ||
        data?.response ||
        data?.message ||
        data?.content ||
        (typeof data === "string" ? data : "") ||
        "I'm sorry, I couldn't generate a response. Please try again.";

      return res.status(200).json({ reply });
    } catch (error: any) {
      console.error("Chat error:", error?.response?.data || error.message);
      return res.status(500).json({
        message: "Chat request failed",
        error: error?.response?.data?.message || error.message,
      });
    }
  },
};

export { chatController };
