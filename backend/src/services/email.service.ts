import nodemailer from "nodemailer";
import ENV from "../config/env";

const transporter = nodemailer.createTransport({
  host: ENV.smtp_host,
  port: ENV.smtp_port,
  secure: ENV.smtp_port === 465,  // true for port 465 (SSL), false for 587 (STARTTLS)
  requireTLS: ENV.smtp_port !== 465, // enforce STARTTLS upgrade on port 587
  auth: {
    user: ENV.smtp_user,
    pass: ENV.smtp_pass,
  },
  tls: {
    // Reject self-signed certs in production; allow in dev if needed
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

// Verify SMTP connection at startup so credential issues are caught immediately
if (process.env.ENABLE_EMAILS === "true") {
  transporter.verify().then(() => {
    console.log(`✓ SMTP ready — sending from ${ENV.smtp_user}`);
  }).catch((err: Error) => {
    console.error(`✗ SMTP connection failed (${ENV.smtp_user}): ${err.message}`);
    console.error("  → Check SMTP_USER and SMTP_PASS in .env (Gmail requires an App Password, not your account password)");
  });
}

export interface CandidateResult {
  candidateId: string;
  email: string;
  firstName: string;
  lastName: string;
  rank: number;
  matchScore: number;
  strengths: string[];
  gaps: string[];
  reasoning: string;
  finalRecommendation: string;
}

export interface JobDetails {
  title: string;
  company?: string;
}

export type EmailMode = "selected_only" | "all_with_ranking" | "decision_only";

// Selected candidate only - job offer style
function selectedOnlyTemplate(
  candidate: CandidateResult,
  job: JobDetails,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #087F5B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .footer { text-align: center; padding: 20px; color: #64748B; font-size: 12px; }
    .highlight { background: #E8F7F0; padding: 15px; border-left: 4px solid #087F5B; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Congratulations! You're Selected</h1>
    </div>
    <div class="content">
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
      
      <p>We are thrilled to inform you that you have been <strong>selected</strong> for the position of <strong>${job.title}</strong> at ${job.company || "our company"}.</p>
      
      <div class="highlight">
        <h3>Your Achievement</h3>
        <p>You ranked <strong>#${candidate.rank}</strong> with a match score of <strong>${candidate.matchScore}%</strong></p>
      </div>
      
      <p><strong>What impressed us:</strong></p>
      <ul>
        ${candidate.strengths.map((s) => `<li>${s}</li>`).join("\n")}
      </ul>
      
      <p>We were particularly impressed by your profile and believe you'll be a great fit for our team.</p>
      
      <p>Next steps: Our HR team will contact you within 2 business days to discuss the offer details.</p>
      
      <p>Welcome aboard!</p>
      
      <p>Best regards,<br>
      The Hiring Team</p>
    </div>
    <div class="footer">
      <p>This email was sent automatically by our AI-powered recruitment system.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// All candidates with full ranking details
function allWithRankingTemplate(
  candidate: CandidateResult,
  job: JobDetails,
  totalCandidates: number,
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #087F5B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .score-box { background: ${candidate.matchScore >= 80 ? "#E8F7F0" : candidate.matchScore >= 60 ? "#E8F7F0" : "#ffebee"}; 
                 padding: 15px; text-align: center; border-radius: 5px; margin: 15px 0; }
    .section { margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #64748B; font-size: 12px; }
    .recommendation { font-size: 18px; font-weight: bold; color: ${getRecommendationColor(candidate.finalRecommendation)}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Application Results</h1>
      <p>${job.title} at ${job.company || "our company"}</p>
    </div>
    <div class="content">
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
      
      <p>Thank you for your interest in our position. Our AI-powered screening system has evaluated all applications, and here are your results:</p>
      
      <div class="score-box">
        <h2>Your Ranking: #${candidate.rank} of ${totalCandidates}</h2>
        <p style="font-size: 24px; margin: 10px 0;"><strong>${candidate.matchScore}%</strong> Match Score</p>
        <p class="recommendation">${candidate.finalRecommendation}</p>
      </div>
      
      <div class="section">
        <h3>Your Strengths</h3>
        <ul>
          ${candidate.strengths.map((s) => `<li>${s}</li>`).join("\n")}
        </ul>
      </div>
      
      <div class="section">
        <h3>Areas for Growth</h3>
        <ul>
          ${candidate.gaps.map((g) => `<li>${g}</li>`).join("\n")}
        </ul>
      </div>
      
      <div class="section">
        <h3>AI Analysis</h3>
        <p>${candidate.reasoning}</p>
      </div>
      
      <p>We appreciate your time and wish you the best in your career journey.</p>
      
      <p>Best regards,<br>
      The Hiring Team</p>
    </div>
    <div class="footer">
      <p>This evaluation was conducted by our AI recruitment system.</p>
    </div>
  </div>
</body>
</html>
  `;
}

// Decision only - positive for selected, thank you for others
function decisionOnlyTemplate(
  candidate: CandidateResult,
  job: JobDetails,
  isSelected: boolean,
): string {
  if (isSelected) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #087F5B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .highlight { background: #E8F7F0; padding: 15px; border-left: 4px solid #087F5B; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You're Moving Forward!</h1>
    </div>
    <div class="content">
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
      
      <p>Great news! We are impressed with your profile and would like to move forward with your application for <strong>${job.title}</strong>.</p>
      
      <div class="highlight">
        <p><strong>Your Selection Details:</strong></p>
        <p>Match Score: ${candidate.matchScore}%</p>
        <p>Ranking: #${candidate.rank}</p>
        <p>Recommendation: ${candidate.finalRecommendation}</p>
      </div>
      
      <p>Our HR team will contact you within 2 business days with next steps.</p>
      
      <p>Congratulations and welcome to the next phase!</p>
      
      <p>Best regards,<br>
      The Hiring Team</p>
    </div>
    <div class="footer">
      <p>This email was sent by our AI recruitment system.</p>
    </div>
  </div>
</body>
</html>
    `;
  } else {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #64748B; color: white; padding: 20px; text-align: center; }
    .content { background: #F8FAFC; padding: 20px; border-radius: 5px; }
    .feedback { background: #E8F7F0; padding: 15px; border-left: 4px solid #12A66A; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #64748B; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Interest</h1>
    </div>
    <div class="content">
      <p>Dear ${candidate.firstName} ${candidate.lastName},</p>
      
      <p>Thank you for taking the time to apply for the <strong>${job.title}</strong> position at ${job.company || "our company"}.</p>
      
      <p>After careful consideration of all applications, we have decided to move forward with other candidates whose profiles more closely align with our current requirements.</p>
      
      <div class="feedback">
        <p><strong>Your Application:</strong></p>
        <p>Match Score: ${candidate.matchScore}%</p>
        <p>We encourage you to apply for future opportunities that match your skills.</p>
      </div>
      
      <p>We wish you all the best in your job search and future endeavors.</p>
      
      <p>Sincerely,<br>
      The Hiring Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 HireLens. All rights Reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

function getRecommendationColor(rec: string): string {
  switch (rec.toLowerCase()) {
    case "strong hire":
      return "#087F5B";
    case "consider":
      return "#12A66A";
    case "weak fit":
      return "#F44336";
    case "reject":
      return "#F44336";
    default:
      return "#111827";
  }
}

export async function sendScreeningEmails(
  candidates: CandidateResult[],
  job: JobDetails,
  mode: EmailMode,
  selectedCandidateId?: string,
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const candidate of candidates) {
    try {
      let subject: string;
      let html: string;

      switch (mode) {
        case "selected_only":
          if (candidate.candidateId !== selectedCandidateId) continue;
          subject = `Congratulations! You're Selected for ${job.title}`;
          html = selectedOnlyTemplate(candidate, job);
          break;

        case "all_with_ranking":
          subject = `Your Application Results for ${job.title}`;
          html = allWithRankingTemplate(candidate, job, candidates.length);
          break;

        case "decision_only":
          const isSelected =
            candidate.finalRecommendation.toLowerCase() === "strong hire" ||
            candidate.finalRecommendation.toLowerCase() === "consider";
          subject = isSelected
            ? `You're Moving Forward - ${job.title}`
            : `Thank You for Your Interest - ${job.title}`;
          html = decisionOnlyTemplate(candidate, job, isSelected);
          break;

        default:
          continue;
      }

      await transporter.sendMail({
        from: ENV.email_from,
        to: candidate.email,
        subject,
        html,
      });

      results.sent++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(
        `Failed to send to ${candidate.email}: ${error.message}`,
      );
    }
  }

  return results;
}

// --- Application Confirmation Addition ---

export interface ApplicationConfirmationDetails {
  candidateName: string;
  jobTitle: string;
  timestamp: Date;
}

// Job Application Confirmation Template
function applicationConfirmationTemplate(
  details: ApplicationConfirmationDetails,
): string {
  const formattedDate = details.timestamp.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #111827;
            margin: 0;
            padding: 0;
            background-color: #F8FAFC;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #F8FAFC;
            padding-bottom: 40px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 12px;
            overflow: hidden;
            margin-top: 40px;
            border: 1px solid #E8F7F0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #087F5B;
            padding: 32px;
            text-align: center;
        }

        .content {
            padding: 40px;
        }

        .title {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 24px;
            text-align: center;
        }

        .details-box {
            background-color: #E8F7F0;
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            border: 1px solid #E8F7F0;
        }

        .detail-item {
            margin-bottom: 12px;
            font-size: 14px;
        }

        .detail-label {
            font-weight: 600;
            color: #64748B;
            min-width: 100px;
            display: inline-block;
        }

        .detail-value {
            color: #111827;
        }

        .button-container {
            text-align: center;
            margin-top: 32px;
        }

        .button {
            background-color: #087F5B;
            color: #FFFFFF !important;
            padding: 12px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
        }

        .footer {
            text-align: center;
            padding: 32px;
            color: #64748B;
            font-size: 13px;
            border-top: 1px solid #E8F7F0;
        }

        .divider {
            height: 1px;
            background-color: #E8F7F0;
            margin: 32px 0;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div style="color: white; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">HireLens
                </div>
            </div>
            <div class="content">
                <h1 class="title">Application Received</h1>
                <p>Hi ${details.candidateName},</p>
                <p>Thank you for applying to HireLens! We've successfully received your application for the
                    <strong>${details.jobTitle}</strong> position.
                </p>

                <div class="details-box">
                    <div class="detail-item">
                        <span class="detail-label">Job Title:</span>
                        <span class="detail-value">${details.jobTitle}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Submitted:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value">Under Review</span>
                    </div>
                </div>

                <p>Our recruitment team is currently reviewing your profile. If your skills and experience match our
                    requirements, we'll reach out to you regarding the next steps in our selection process.</p>

                <p>In the meantime, you can track your application status in your dashboard.</p>

                <div class="button-container">
                    <a href="${ENV.frontend_url}/dashboard/applications" class="button">View My Dashboard</a>
                </div>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #64748B;">Best regards,<br><strong>The HireLens Team</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2026 HireLens. All rights reserved.</p>
                <p>This is an automated confirmation email. Please do not reply directly to this message.</p>
            </div>
        </div>
    </div>
</body>

</html>
  `;
}

export const sendApplicationConfirmation = async (
  email: string,
  details: ApplicationConfirmationDetails,
) => {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_EMAILS !== "true"
  ) {
    console.log("Email skipped in development mode.");
    return;
  }

  try {
    const html = applicationConfirmationTemplate(details);
    await transporter.sendMail({
      from: `"${ENV.email_from || "HireLens Team"}" <${ENV.smtp_user}>`,
      to: email,
      subject: "Job Application Submitted – Next Steps Inside",
      html,
    });
    console.log(`Confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }
};

// ─── OTP Email Templates ────────────────────────────────────────────────────

function otpEmailTemplate(
  firstName: string,
  otp: string,
  type: "verify" | "reset",
): string {
  const isVerify = type === "verify";
  const title = isVerify ? "Verify your email" : "Reset your password";
  const subtitle = isVerify
    ? "Thanks for creating your HireLens account. Enter the code below to verify your email address."
    : "We received a request to reset your password. Enter the code below to continue.";
  const notice = isVerify
    ? "If you did not create a HireLens account, you can safely ignore this email."
    : "If you did not request a password reset, please ignore this email. Your password will not change.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F0FDF4;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0FDF4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #D1FAE5;box-shadow:0 4px 24px rgba(8,127,91,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#087F5B;padding:28px 40px;text-align:center;">
              <span style="color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">HireLens</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">${title}</h1>
              <p style="margin:0 0 28px;font-size:14px;color:#6B7280;line-height:1.6;">Hi ${firstName},<br/>${subtitle}</p>

              <!-- OTP box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:28px;background:#F0FDF4;border-radius:12px;border:1px solid #D1FAE5;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6B7280;letter-spacing:0.08em;text-transform:uppercase;">Your verification code</p>
                    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:12px;color:#087F5B;font-variant-numeric:tabular-nums;">${otp}</p>
                    <p style="margin:12px 0 0;font-size:12px;color:#9CA3AF;">Expires in 10 minutes &nbsp;·&nbsp; Do not share this code</p>
                  </td>
                </tr>
              </table>

              <!-- Security notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="padding:16px;background:#FEF9C3;border-radius:8px;border-left:4px solid #F59E0B;">
                    <p style="margin:0;font-size:13px;color:#92400E;">${notice}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #F0FDF4;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">
                &copy; 2026 HireLens. All rights reserved.<br/>
                This is an automated message. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOtpEmail(
  email: string,
  firstName: string,
  otp: string,
  type: "verify" | "reset",
): Promise<void> {
  const label = type === "verify" ? "Email verification" : "Password reset";

  // Always log OTP in non-production — acts as a guaranteed fallback
  // if SMTP fails, the developer/admin can retrieve the OTP from server logs
  if (process.env.NODE_ENV !== "production") {
    console.log("\n" + "=".repeat(56));
    console.log(`  [OTP] ${label}`);
    console.log(`  To      : ${email}`);
    console.log(`  Code    : ${otp}`);
    console.log(`  Expires : 10 minutes`);
    console.log("=".repeat(56) + "\n");
  }

  // Skip SMTP sending if emails are explicitly disabled in dev
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_EMAILS !== "true"
  ) {
    return;
  }

  const subject =
    type === "verify"
      ? "Verify your HireLens email"
      : "Reset your HireLens password";

  const html = otpEmailTemplate(firstName, otp, type);

  try {
    await transporter.sendMail({
      from: `"HireLens" <${ENV.smtp_user}>`,
      to: email,
      subject,
      html,
    });
    console.log(`[SMTP] ${label} email sent to ${email}`);
  } catch (err: any) {
    // Log the full SMTP error so it's visible in server logs
    console.error(`[SMTP ERROR] Failed to send ${label.toLowerCase()} email to ${email}`);
    console.error(`  Error   : ${err.message}`);
    console.error(`  Code    : ${err.code || "unknown"}`);
    console.error(`  Host    : ${ENV.smtp_host}:${ENV.smtp_port}`);
    console.error(`  User    : ${ENV.smtp_user}`);
    console.error("  → Verify SMTP_PASS is a valid Gmail App Password (Google Account → Security → App Passwords)");
    // Re-throw so the controller .catch() also knows it failed
    throw err;
  }
}

// Generic send mail function
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_EMAILS !== "true"
  ) {
    console.log(
      "Email skipped in development mode:",
      options.to,
      options.subject,
    );
    return;
  }

  await transporter.sendMail({
    from:
      options.from ||
      `"${ENV.email_from || "HireLens Team"}" <${ENV.smtp_user}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
