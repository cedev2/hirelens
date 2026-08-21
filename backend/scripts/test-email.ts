import "dotenv/config";
import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.error("Usage: npx ts-node scripts/test-email.ts <recipient@email.com>");
  process.exit(1);
}

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = parseInt(process.env.SMTP_PORT || "587");

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

(async () => {
  try {
    await transporter.verify();
    console.log("SMTP connection + auth: OK");
    const info = await transporter.sendMail({
      from: `"HireLens Test" <${process.env.SMTP_USER}>`,
      to,
      subject: "HireLens SMTP test",
      text: "If you received this in your inbox (not spam), SMTP is working.",
    });
    console.log("Email sent:", info.messageId);
    console.log("Server response:", info.response);
  } catch (err) {
    console.error("FAILED:", err);
    process.exit(1);
  }
})();
