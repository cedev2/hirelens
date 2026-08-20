# HireLens n8n Email Automation — Workflow Generation Prompt

Use this prompt in n8n's AI workflow builder or with any AI assistant to generate the 5 email automation workflows.

---

## System Prompt (for AI assistant)

You are an n8n workflow expert. Generate 5 complete, production-ready n8n workflows for a recruitment platform called HireLens. Each workflow is triggered by a webhook and sends a branded HTML email based on the applicant's status change.

---

## Workflow Prompt

Create 5 n8n workflows for automated recruitment email notifications. Each workflow follows the same pattern but sends a different email template.

### Shared Details

- **Webhook Authentication:** Header Auth with header name `x-webhook-secret` and value `{{ N8N_WEBHOOK_SECRET }}`
- **Email Service:** Use n8n's built-in **Send Email** node with SMTP (configure SMTP credentials in n8n credentials store)
- **From Address:** `HireLens <noreply@hirelens.com>`
- **All emails use inline HTML** (no external CSS files — use table-based layout with inline styles)

### Webhook Payload Structure

Every workflow receives this POST body:

```json
{
  "event": "application.status_changed",
  "application": {
    "id": "string",
    "jobTitle": "string",
    "applicantName": "string",
    "applicantEmail": "string",
    "previousStatus": "pending | reviewing | shortlisted | rejected | hired",
    "newStatus": "pending | reviewing | shortlisted | rejected | hired",
    "timestamp": "ISO 8601 string"
  }
}
```

### Workflow 1: Application Received (`hirelens-pending`)

**Webhook Path:** `hirelens-pending`
**Trigger Status:** `newStatus = "pending"`

**Email:**
- **Subject:** `Application Received — {{ jobTitle }}`
- **To:** `{{ applicantEmail }}`
- **Body:** Professional HTML email confirming application receipt. Include:
  - Greeting with applicant name
  - Job title applied for
  - 3-step process (Application Review → AI Screening → Status Update)
  - Brand color: `#087F5B` (green)
  - HireLens logo header bar

### Workflow 2: Application Under Review (`hirelens-reviewing`)

**Webhook Path:** `hirelens-reviewing`
**Trigger Status:** `newStatus = "reviewing"`

**Email:**
- **Subject:** `Your Application is Being Reviewed — {{ jobTitle }}`
- **To:** `{{ applicantEmail }}`
- **Body:** Exciting update that application is being reviewed. Include:
  - Greeting with applicant name
  - Job title
  - Explanation that hiring team is actively evaluating
  - AI-powered screening mention
  - Encouraging tone

### Workflow 3: Shortlisted (`hirelens-shortlisted`)

**Webhook Path:** `hirelens-shortlisted`
**Trigger Status:** `newStatus = "shortlisted"`

**Email:**
- **Subject:** `You Have Been Shortlisted! — {{ jobTitle }}`
- **To:** `{{ applicantEmail }}`
- **Body:** Celebration email. Include:
  - Congratulatory header
  - Job title
  - What to expect next (interview invitation coming, keep contact info updated, watch inbox)
  - Green accent color for celebration feel
  - Professional but exciting tone

### Workflow 4: Hired (`hirelens-hired`)

**Webhook Path:** `hirelens-hired`
**Trigger Status:** `newStatus = "hired"`

**Email:**
- **Subject:** `Congratulations! You Are Hired — {{ jobTitle }}`
- **To:** `{{ applicantEmail }}`
- **Body:** Hiring celebration email. Include:
  - Congratulatory header with green accent
  - Job title and company name
  - Next steps (contract coming, review carefully, welcome message)
  - Professional and warm tone
  - Offer letter/contract attachment mention

### Workflow 5: Rejected (`hirelens-rejected`)

**Webhook Path:** `hirelens-rejected`
- **Trigger Status:** `newStatus = "rejected"`

**Email:**
- **Subject:** `Update on Your Application — {{ jobTitle }}`
- **To:** `{{ applicantEmail }}`
- **Body:** Respectful rejection. Include:
  - Professional but empathetic tone
  - Job title
  - Explanation that other candidates were selected
  - Encouragement to apply for other positions
  - Keep profile updated message
  - Future opportunities mention
  - **Do NOT use celebratory colors** — use neutral gray/blue tones

### HTML Email Template Requirements

All 5 emails must follow this structure:

```
┌─────────────────────────────────────┐
│  Header: Green (#087F5B) bar        │
│  with "HireLens" logo text          │
├─────────────────────────────────────┤
│  Content area with:                 │
│  - Heading                          │
│  - Greeting with applicant name     │
│  - Job title in highlighted box     │
│  - Status-specific content          │
│  - Next steps / CTA                 │
├─────────────────────────────────────┤
│  Footer: "Automated message from    │
│  HireLens" disclaimer               │
└─────────────────────────────────────┘
```

- **Layout:** Table-based for email client compatibility
- **Max width:** 600px centered
- **Fonts:** Segoe UI, Roboto, Helvetica, Arial (web-safe stack)
- **Inline styles only** — no `<style>` tags or external CSS
- **Responsive:** Use `width="100%"` on tables

### n8n Workflow Node Structure (for each workflow)

```
1. [Webhook] Trigger node
   - Method: POST
   - Path: (as specified per workflow)
   - Authentication: Header Auth
   - Response Mode: Immediately

2. [Set] Parse payload
   - applicantName: {{ $json.body.application.applicantName }}
   - applicantEmail: {{ $json.body.application.applicantEmail }}
   - jobTitle: {{ $json.body.application.jobTitle }}
   - newStatus: {{ $json.body.application.newStatus }}
   - previousStatus: {{ $json.body.application.previousStatus }}

3. [IF] Check status (optional guard)
   - Condition: {{ $json.newStatus }} equals "pending" (or reviewing/shortlisted/hired/rejected)
   - True → continue to Send Email
   - False → Respond to Webhook (200, no action)

4. [Send Email] SMTP node
   - From: noreply@hirelens.com
   - To: {{ $json.applicantEmail }}
   - Subject: (as specified per workflow)
   - HTML Body: (full branded HTML template as specified above)

5. [Respond to Webhook] 
   - Response Code: 200
   - Body: { "success": true, "status": "{{ $json.newStatus }}" }
```

### Credentials Setup (do this once in n8n)

1. Go to **Credentials** → Add **SMTP** credential
2. Set your SMTP server details (Gmail, SendGrid, etc.)
3. Name it `HireLens SMTP`
4. Reference this credential in all 5 Send Email nodes

---

## Quick Reference: All 5 Workflows

| # | Workflow Name | Webhook Path | Subject Line | Email Tone |
|---|---------------|-------------|--------------|------------|
| 1 | Application Received | `hirelens-pending` | Application Received — {job} | Confirmation |
| 2 | Under Review | `hirelens-reviewing` | Your Application is Being Reviewed — {job} | Exciting |
| 3 | Shortlisted | `hirelens-shortlisted` | You Have Been Shortlisted! — {job} | Celebration |
| 4 | Hired | `hirelens-hired` | Congratulations! You Are Hired — {job} | Celebration |
| 5 | Rejected | `hirelens-rejected` | Update on Your Application — {job} | Empathetic |
