import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT ?? '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? 'noreply@societyportal.com';
const APP_BASE_URL = process.env.APP_BASE_URL ?? 'http://localhost:5173';

/**
 * Create a transporter — real SMTP when configured, console-only stub in dev.
 * Callers do not need to branch; the stub simply logs the message.
 */
function getTransporter() {
  if (!SMTP_HOST) {
    // Return a stub transporter for dev
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendMail(to: string, subject: string, html: string, text?: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    // Dev stub — log to console
    console.log('\n─── [EMAIL STUB] ─────────────────────────────');
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body (text): ${text ?? html}`);
    console.log('──────────────────────────────────────────────\n');
    return;
  }
  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send a society setup invite email with the onboarding wizard link.
 * Called after POST /onboarding/register — token is crypto hex (not JWT).
 */
export async function sendSetupInvite(email: string, token: string, societyName: string): Promise<void> {
  const link = `${APP_BASE_URL}/setup/${token}`;
  const subject = 'Society Portal — Complete Your Society Setup';
  const text = `Welcome! Your society "${societyName}" has been registered.\n\nComplete your setup here (link valid for 48 hours):\n${link}\n\nIf you did not register, please ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#1e40af">Society Portal</h2>
      <p>Welcome! Your society <strong>${societyName}</strong> has been registered.</p>
      <p>Complete your setup by clicking the button below. The link is valid for <strong>48 hours</strong>.</p>
      <p>
        <a href="${link}"
           style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Start Setup Wizard →
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">If you did not register, ignore this email.</p>
    </div>
  `;
  await sendMail(email, subject, html, text);
}

/**
 * Notify a resident that their portal password was changed by an admin.
 */
export async function sendPasswordChangedNotification(email: string, username: string): Promise<void> {
  const subject = 'Society Portal — Your Password Has Been Updated';
  const text = `Hello ${username},\n\nYour portal login password has been updated by the society admin.\n\nIf you did not expect this change, please contact your society administrator immediately.\n\nSociety Portal`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#1e40af">Society Portal</h2>
      <p>Hello <strong>${username}</strong>,</p>
      <p>Your portal login password has been updated by the society admin.</p>
      <p style="color:#b91c1c;font-weight:bold">If you did not expect this change, please contact your society administrator immediately.</p>
      <p style="color:#6b7280;font-size:13px">— Society Portal</p>
    </div>
  `;
  await sendMail(email, subject, html, text);
}

/**
 * Send a password-reset email with a link containing the reset token.
 */
export async function sendPasswordReset(email: string, token: string): Promise<void> {
  const link = `${APP_BASE_URL}/reset-password/${token}`;
  const subject = 'Society Portal — Password Reset';
  const text = `You requested a password reset.\n\nClick this link to set a new password (valid for 1 hour):\n${link}\n\nIf you did not request this, please ignore this email.`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#1e40af">Society Portal</h2>
      <p>You requested a password reset.</p>
      <p>
        <a href="${link}"
           style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold">
          Reset My Password
        </a>
      </p>
      <p style="color:#6b7280;font-size:13px">This link expires in <strong>1 hour</strong>. If you did not request this, ignore this email.</p>
    </div>
  `;
  await sendMail(email, subject, html, text);
}