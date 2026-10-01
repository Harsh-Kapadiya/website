import nodemailer from 'nodemailer';

const { RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, OWNER_EMAIL } = process.env;

// Render's free tier blocks SMTP ports (25/465/587), so production uses
// Resend's HTTPS API. SMTP stays for local dev or a paid Render instance.
const smtpConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
export const mailerConfigured = Boolean(OWNER_EMAIL && (RESEND_API_KEY || smtpConfigured));

const transporter =
  !RESEND_API_KEY && smtpConfigured
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        // Never let message content pull in local files or remote URLs.
        disableFileAccess: true,
        disableUrlAccess: true,
      })
    : null;

// Plain-text only: no HTML to escape, nothing for user input to inject into.
// `replyTo` must already have passed validate()'s strict email check.
export async function notifyOwner({ subject, text, replyTo }) {
  if (!mailerConfigured) return;
  const msg = {
    to: OWNER_EMAIL,
    subject: subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
    text: text.slice(0, 10000),
  };

  if (RESEND_API_KEY) {
    // ponytail: onboarding@resend.dev can only mail the Resend account's own
    // address — fine, OWNER_EMAIL is you. Verify a domain to change the sender.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'Portfolio <onboarding@resend.dev>', ...msg, ...(replyTo ? { reply_to: replyTo } : {}) }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return;
  }

  await transporter.sendMail({ from: SMTP_FROM || SMTP_USER, ...msg, ...(replyTo ? { replyTo } : {}) });
}
