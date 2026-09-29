import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, OWNER_EMAIL } = process.env;

export const mailerConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && OWNER_EMAIL);

const transporter = mailerConfigured
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
  if (!transporter) return;
  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: OWNER_EMAIL,
    subject: subject.replace(/[\r\n]+/g, ' ').slice(0, 200),
    text: text.slice(0, 10000),
    ...(replyTo ? { replyTo } : {}),
  });
}
