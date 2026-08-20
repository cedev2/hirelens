export interface EmailTemplateData {
  applicantName: string;
  jobTitle: string;
  company?: string;
}

const BRANDING = {
  primary: "#087F5B",
  primaryLight: "#E6F9F1",
  text: "#1E293B",
  textMuted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  white: "#FFFFFF",
};

function baseLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HireLens</title>
</head>
<body style="margin:0;padding:0;background:${BRANDING.bg};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:${BRANDING.white};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:${BRANDING.primary};padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:${BRANDING.white};font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                Hire<span style="color:#A7F3D0;">Lens</span>
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${BRANDING.border};text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRANDING.textMuted};">
                This is an automated message from HireLens. Please do not reply directly to this email.
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

export function applicationReceivedTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const content = `
    <h2 style="margin:0 0 8px;color:${BRANDING.text};font-size:20px;">Application Received</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${BRANDING.textMuted};">
      Thank you for applying, <strong style="color:${BRANDING.text}">${data.applicantName}</strong>!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRANDING.primaryLight};border-radius:8px;border:1px solid #C6F0DD;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:${BRANDING.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Position Applied</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRANDING.text};">${data.jobTitle}</p>
          ${data.company ? `<p style="margin:4px 0 0;font-size:14px;color:${BRANDING.textMuted};">${data.company}</p>` : ""}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 12px;font-size:15px;color:${BRANDING.text};">
      We have received your application and it is now in our system. Here is what happens next:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRANDING.border};">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;background:${BRANDING.primary};color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:600;">1</span></td>
            <td style="padding-left:12px;"><p style="margin:0;font-size:14px;color:${BRANDING.text};"><strong>Application Review</strong> &mdash; Our team will review your profile and qualifications.</p></td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BRANDING.border};">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;background:${BRANDING.primary};color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:600;">2</span></td>
            <td style="padding-left:12px;"><p style="margin:0;font-size:14px;color:${BRANDING.text};"><strong>AI Screening</strong> &mdash; Your application will be evaluated by our AI-powered screening system.</p></td>
          </tr></table>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 0;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="width:32px;vertical-align:top;"><span style="display:inline-block;width:28px;height:28px;background:${BRANDING.primary};color:#fff;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:600;">3</span></td>
            <td style="padding-left:12px;"><p style="margin:0;font-size:14px;color:${BRANDING.text};"><strong>Status Update</strong> &mdash; You will receive an email once a decision has been made.</p></td>
          </tr></table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRANDING.textMuted};">
      You can track the status of your application at any time by logging into your HireLens dashboard.
    </p>
  `;

  return {
    subject: `Application Received — ${data.jobTitle}`,
    html: baseLayout(content),
  };
}

export function applicationReviewedTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const content = `
    <h2 style="margin:0 0 8px;color:${BRANDING.text};font-size:20px;">Your Application is Being Reviewed</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${BRANDING.textMuted};">
      Hi <strong style="color:${BRANDING.text}">${data.applicantName}</strong>,
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRANDING.primaryLight};border-radius:8px;border:1px solid #C6F0DD;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:${BRANDING.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Position</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRANDING.text};">${data.jobTitle}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      Good news! Your application has moved to the review stage. Our hiring team is now actively evaluating your qualifications against the role requirements.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      Our AI-powered screening system is analyzing your profile to ensure a fair and thorough evaluation. You will hear from us soon with an update on your application status.
    </p>

    <p style="margin:0;font-size:14px;color:${BRANDING.textMuted};">
      Thank you for your patience. We appreciate your interest in this opportunity.
    </p>
  `;

  return {
    subject: `Your Application is Being Reviewed — ${data.jobTitle}`,
    html: baseLayout(content),
  };
}

export function shortlistedTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const content = `
    <h2 style="margin:0 0 8px;color:${BRANDING.primary};font-size:22px;">You Have Been Shortlisted!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${BRANDING.textMuted};">
      Congratulations, <strong style="color:${BRANDING.text}">${data.applicantName}</strong>!
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRANDING.primaryLight};border-radius:8px;border:1px solid #C6F0DD;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:${BRANDING.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Position</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRANDING.text};">${data.jobTitle}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      Your application has stood out among many candidates. You have been shortlisted and our team would like to move forward with you in the hiring process.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      <strong>What to expect next:</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9654;&nbsp;&nbsp;An interview invitation will be sent to you shortly with all the details you need.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9654;&nbsp;&nbsp;Please ensure your contact information is up to date.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9654;&nbsp;&nbsp;Keep an eye on your inbox for further communication.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRANDING.textMuted};">
      We are excited to get to know you better. Good luck!
    </p>
  `;

  return {
    subject: `You Have Been Shortlisted! — ${data.jobTitle}`,
    html: baseLayout(content),
  };
}

export function hiredTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const content = `
    <h2 style="margin:0 0 8px;color:${BRANDING.primary};font-size:22px;">Congratulations, You Are Hired!</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${BRANDING.textMuted};">
      Dear <strong style="color:${BRANDING.text}">${data.applicantName}</strong>,
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRANDING.primaryLight};border-radius:8px;border:1px solid #C6F0DD;padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:${BRANDING.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Position</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRANDING.text};">${data.jobTitle}</p>
          ${data.company ? `<p style="margin:4px 0 0;font-size:14px;color:${BRANDING.textMuted};">${data.company}</p>` : ""}
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      We are thrilled to inform you that you have been selected for the position! After careful consideration, we believe you are the ideal candidate to join our team.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      <strong>Next steps:</strong>
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#10003;&nbsp;&nbsp;An employment contract and onboarding details will be sent to you shortly.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#10003;&nbsp;&nbsp;Please review the contract carefully and reach out with any questions.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#10003;&nbsp;&nbsp;Welcome to the team — we look forward to working with you!</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRANDING.textMuted};">
      If you have any questions, please do not hesitate to contact our HR team.
    </p>
  `;

  return {
    subject: `Congratulations! You Are Hired — ${data.jobTitle}`,
    html: baseLayout(content),
  };
}

export function rejectedTemplate(data: EmailTemplateData): {
  subject: string;
  html: string;
} {
  const content = `
    <h2 style="margin:0 0 8px;color:${BRANDING.text};font-size:20px;">Thank You for Applying</h2>
    <p style="margin:0 0 24px;font-size:15px;color:${BRANDING.textMuted};">
      Dear <strong style="color:${BRANDING.text}">${data.applicantName}</strong>,
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRANDING.bg};border-radius:8px;border:1px solid ${BRANDING.border};padding:20px;margin-bottom:24px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:${BRANDING.textMuted};text-transform:uppercase;letter-spacing:0.5px;">Position</p>
          <p style="margin:0;font-size:18px;font-weight:600;color:${BRANDING.text};">${data.jobTitle}</p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      Thank you for taking the time to apply for this position. After careful review, we have decided to move forward with other candidates whose experience more closely matches the current requirements.
    </p>

    <p style="margin:0 0 16px;font-size:15px;color:${BRANDING.text};">
      This does not diminish your skills or potential. We encourage you to:
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9679;&nbsp;&nbsp;Apply for other open positions that match your expertise.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid ${BRANDING.border};">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9679;&nbsp;&nbsp;Keep your HireLens profile updated for future opportunities.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <p style="margin:0;font-size:14px;color:${BRANDING.text};">&#9679;&nbsp;&nbsp;We will keep your application on file for upcoming roles.</p>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:14px;color:${BRANDING.textMuted};">
      We wish you the very best in your job search and future career endeavors.
    </p>
  `;

  return {
    subject: `Update on Your Application — ${data.jobTitle}`,
    html: baseLayout(content),
  };
}
