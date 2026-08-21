# HireLens — Hackathon Judge Q&A Prep

> Quick-reference guide for explaining the code and answering judge questions.
> Focus areas: Email/SMTP system, AI screening, architecture, security, scaling.

---

## Part 1: How the Email System Works (Code Walkthrough)

### The 3 pieces

```
┌─────────────┐     ┌───────────────────────────┐     ┌───────────────┐
│ App action   │ --> │ email.service.ts           │ --> │ Gmail SMTP     │ --> Applicant's inbox
│ (apply/hire) │     │ (nodemailer + templates)   │     │ smtp.gmail.com │
└─────────────┘     └───────────────────────────┘     └───────────────┘
```

**1. Transporter setup** (`backend/src/services/email.service.ts:4`)
```ts
const transporter = nodemailer.createTransport({
  host: ENV.smtp_host,          // smtp.gmail.com
  port: ENV.smtp_port,          // 587
  secure: ENV.smtp_port === 465,// TLS only on 465; 587 uses STARTTLS
  auth: { user: ENV.smtp_user, pass: ENV.smtp_pass }, // Gmail App Password
});
```
- Created **once** at startup and reused — opening a new SMTP connection per email would be slow.
- Credentials come from environment variables, never hardcoded.

**2. Trigger points**
| User action | Function | Where |
|---|---|---|
| Candidate applies to job | `sendApplicationConfirmation()` | application.controller.ts |
| Recruiter selects/hires after screening | `sendScreeningEmails()` — mode `selected_only` | email.controller.ts |
| Send results to everyone | mode `all_with_ranking` / `decision_only` | email.controller.ts |
| Interview invitation | `sendMail()` with `{{candidateName}}`, `{{jobTitle}}` placeholders | screening.controller.ts |

**3. Sending an email**
```ts
await transporter.sendMail({
  from: `"HireLens Team" <${ENV.smtp_user}>`,
  to: email,
  subject: "Job Application Submitted – Next Steps Inside",
  html: applicationConfirmationTemplate(details), // branded HTML template
});
```
- Each email type has its own HTML template function (`selectedOnlyTemplate`, `allWithRankingTemplate`, etc.) so applicants get a professional, personalized message.
- Errors are caught and logged (`Failed to send confirmation email`) so one bad address never crashes the app or blocks the recruiter's request.

**Why Gmail App Password instead of my normal password?**
Google disabled "less secure apps." An App Password is a 16-character key scoped to SMTP access, revocable anytime without touching the main account password. We enabled 2FA first, then generated it at myaccount.google.com/apppasswords.

---

## Part 2: Questions Judges Will Ask + Strong Answers

### Technical / Architecture

**Q: Walk me through what happens end-to-end when a candidate applies.**
> The candidate submits the form → frontend POSTs to `/api/applications` → backend validates and stores the application in MongoDB → fires `sendApplicationConfirmation()`, which renders our branded HTML template and hands it to nodemailer → nodemailer opens a STARTTLS connection to Gmail SMTP → Gmail delivers it to the applicant's inbox. All of this happens without blocking the candidate's success response.

**Q: Why SMTP/Gmail instead of an email API like SendGrid?**
> For a hackathon MVP, Gmail SMTP is free, instant to set up, and has no signup/approval gate. Nodemailer abstracts the transport, so swapping in Resend/SendGrid later is a ~10-line change — the templates and trigger points stay identical. We designed it so the transport is replaceable by design.

**Q: How do you know an email actually got delivered?**
> Three signals: (1) nodemailer resolves only when Gmail accepts the message (`250 OK`), (2) every send logs success/failure with the recipient address, and (3) our send endpoints return per-candidate `{ sent, failed }` counts to the UI so the recruiter sees failures immediately. Bounces from fake addresses surface as failed sends in logs.

**Q: What if sending fails mid-flow — does the applicant lose their application?**
> No. Email sending is decoupled from the critical path: the application is persisted first, then we attempt the email in a try/catch. A failure logs an error but never rolls back the application. In production we'd move this to a queue (BullMQ) with automatic retries.

**Q: How is the AI screening connected to emails?**
> Screening ranks candidates with Gemini/Groq and stores results per screening. The recruiter reviews the ranked list, chooses an email mode (`selected_only`, `all_with_ranking`, `decision_only`), and we generate a personalized email per candidate from those AI results — strengths, gaps, match score, recommendation.

**Q: Is your code ready for multiple emails at once (e.g., 200 candidates)?**
> Yes for moderate volume — the transporter reuses connections and each send is individually try/caught, so one invalid address doesn't abort the batch; we collect per-candidate errors. Beyond that we'd add rate-limiting/batching because Gmail caps personal accounts (~500/day) — another reason a provider swap is on the roadmap.

### Security

**Q: Where do you store secrets like the SMTP password?**
> Only in environment variables (.env locally, Render's encrypted env vars in production). They're gitignored, never in the repo, never sent to the frontend. The app fails loudly rather than falling back to defaults if they're missing.

**Q: Could someone spoof emails as your company?**
> Mail from this system authenticates through Google's own SPF/DKIM since it genuinely originates from Gmail infrastructure. The next maturity step is sending from our own domain via a provider, which gives us full SPF/DKIM/DMARC alignment under hirelens' domain.

**Q: Does the email contain sensitive data?**
> Templates carry only what the candidate already knows or owns: their name, the job title, and their own screening outcome. No tokens, no passwords, no other candidates' data. Rejection/ranking modes only reveal information the recipient is entitled to see.

### Product / Impact

**Q: What problem does automating these emails solve?**
> In real hiring, candidates wait days wondering if anyone saw their application — most never hear back at all. HireLens closes the loop automatically: instant acknowledgment on apply, transparent results after screening, and interview invites in one click. Recruiters save hours of copy-paste work; candidates get dignity of response.

**Q: What happens if an applicant typed a wrong/fake email?**
> The send attempt completes against a nonexistent mailbox and later bounces. Our logs record it and batch responses report failures, so recruiters can spot bad records. A production enhancement would be webhook-based bounce handling to flag those accounts.

**Q: What would you build next?**
> (Pick 2–3): email queue + retries, custom-domain sending with open/click analytics, in-app notification center alongside email, i18n templates, calendar .ics attachments on invites.

### Rapid-fire short answers

- **Stack?** React + Vite frontend, Node/Express + TypeScript backend, MongoDB Atlas, Gemini & Groq AI, nodemailer + Gmail SMTP, deployed on Render (+ Vercel/static hosting for frontend).
- **Hardest bug?** Gmail rejecting auth until we used an App Password with 2FA — normal passwords are blocked by design; fixed by scoping credentials properly via env vars.
- **How did you test emails?** A standalone script using the same transporter (`scripts/test-email.ts`) plus mail-tester.com for spam scoring, then full E2E: apply → confirm, screen → select → invite, verifying inbox delivery at each step.
- **Is this production-ready?** Core flows are solid; before real scale we'd add a job queue, bounce webhooks, and domain-based sending — all mapped out, none block the demo.

---

## Part 3: 60-Second Demo Script for the Email Feature

1. "When any candidate applies…" → apply with a test account → *"instant branded confirmation, no recruiter effort."*
2. "After AI ranks them…" → run screening → click **Send Emails (selected_only)** → *"personalized selection email built from the AI's actual analysis."*
3. "And interview invites…" → invite candidate → *"template variables personalize every message."*
4. Show the phone/inbox receiving them live. *"Delivered in seconds — closing the feedback loop that hiring usually leaves open."*
