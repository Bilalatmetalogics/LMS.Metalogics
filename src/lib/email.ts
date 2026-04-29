import nodemailer from "nodemailer";

const APP_URL = process.env.AUTH_URL || "http://localhost:3000";

// SMTP transporter — configured via environment variables
// Hostinger SMTP: smtp.hostinger.com, port 465 (SSL) or 587 (TLS)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: (process.env.SMTP_PORT || "465") === "465", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_NAME = process.env.SMTP_FROM_NAME || "MetaLogics LMS";
const FROM_EMAIL = process.env.SMTP_USER || "noreply@bilal.metalogics.io";
const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;

export async function sendWelcomeEmail({
  name,
  email,
  tempPassword,
  role,
}: {
  name: string;
  email: string;
  tempPassword: string;
  role: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr>
          <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;">
            <p style="margin:0;color:#c7d2fe;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">MetaLogics LMS</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:800;">Your account is ready</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px;line-height:1.6;">
              An account has been created for you on MetaLogics LMS as a
              <strong style="color:#4f46e5;text-transform:capitalize;">${role}</strong>.
              Use the credentials below to log in.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#a1a1aa;letter-spacing:1px;text-transform:uppercase;">Login Credentials</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#71717a;width:90px;">Email</td>
                      <td style="padding:4px 0;font-size:13px;color:#18181b;font-weight:600;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#71717a;">Password</td>
                      <td style="padding:4px 0;font-size:15px;color:#4f46e5;font-weight:800;font-family:monospace;letter-spacing:1px;">${tempPassword}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:12px 16px;font-size:13px;color:#92400e;">
                  ⚠️ You will be asked to change your password on first login. Keep this email safe until then.
                </td>
              </tr>
            </table>

            <a href="${APP_URL}/login" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;">
              Log in to LMS →
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">
              This email was sent by MetaLogics LMS. If you weren't expecting this, please contact your administrator.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your MetaLogics LMS account is ready",
    html,
  });
}

export async function sendPasswordResetEmail({
  name,
  email,
  tempPassword,
}: {
  name: string;
  email: string;
  tempPassword: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr>
          <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 40px;">
            <p style="margin:0;color:#94a3b8;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">MetaLogics LMS</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:800;">Password reset</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 40px;">
            <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#71717a;font-size:14px;line-height:1.6;">
              Your password has been reset by an administrator. Use the temporary password below to log in.
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#a1a1aa;letter-spacing:1px;text-transform:uppercase;">New Credentials</p>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#71717a;width:90px;">Email</td>
                      <td style="padding:4px 0;font-size:13px;color:#18181b;font-weight:600;">${email}</td>
                    </tr>
                    <tr>
                      <td style="padding:4px 0;font-size:13px;color:#71717a;">Password</td>
                      <td style="padding:4px 0;font-size:15px;color:#4f46e5;font-weight:800;font-family:monospace;letter-spacing:1px;">${tempPassword}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:28px;">
              <tr>
                <td style="padding:12px 16px;font-size:13px;color:#92400e;">
                  ⚠️ You will be asked to change your password on first login.
                </td>
              </tr>
            </table>

            <a href="${APP_URL}/login" style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;">
              Log in now →
            </a>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 40px;border-top:1px solid #f4f4f5;">
            <p style="margin:0;font-size:12px;color:#a1a1aa;">MetaLogics LMS — If you didn't request this, contact your administrator.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Your MetaLogics LMS password has been reset",
    html,
  });
}
