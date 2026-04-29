/**
 * Quick SMTP connection test.
 * Run: npx tsx scripts/test-email.ts
 */
import nodemailer from "nodemailer";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

if (!SMTP_USER || !SMTP_PASS) {
  console.error("❌ SMTP_USER or SMTP_PASS not set in .env.local");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(SMTP_PORT || "465"),
  secure: (SMTP_PORT || "465") === "465",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function test() {
  console.log(`Testing SMTP connection to ${SMTP_HOST}:${SMTP_PORT}...`);

  // 1. Verify connection
  try {
    await transporter.verify();
    console.log("✓ SMTP connection successful");
  } catch (err: any) {
    console.error("❌ SMTP connection failed:", err.message);
    process.exit(1);
  }

  // 2. Send a test email to yourself
  try {
    const info = await transporter.sendMail({
      from: `MetaLogics LMS <${SMTP_USER}>`,
      to: SMTP_USER, // sends to yourself
      subject: "✅ MetaLogics LMS — SMTP test",
      html: `
        <div style="font-family:sans-serif;padding:24px;max-width:480px;">
          <h2 style="color:#4f46e5;">SMTP is working!</h2>
          <p>This is a test email from your MetaLogics LMS server.</p>
          <p style="color:#71717a;font-size:13px;">
            Sent from: ${SMTP_USER}<br/>
            Host: ${SMTP_HOST}:${SMTP_PORT}
          </p>
        </div>
      `,
    });
    console.log("✓ Test email sent! Message ID:", info.messageId);
    console.log(`  Check inbox at: ${SMTP_USER}`);
  } catch (err: any) {
    console.error("❌ Failed to send test email:", err.message);
    process.exit(1);
  }
}

test();
