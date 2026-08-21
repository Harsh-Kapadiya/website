import nodemailer from 'nodemailer';

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, OWNER_EMAIL } = process.env;

const isConfigured = Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && OWNER_EMAIL);

if (!isConfigured) {
  console.warn(
    '[mailer] SMTP_* / OWNER_EMAIL are not fully set — form submissions will ' +
      'still save to the database, but no notification email will be sent until backend/.env is filled in.'
  );
}

const transporter = isConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for 587/25 (STARTTLS)
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

// Strips newlines so untrusted user input can never inject extra email
// headers (a classic contact-form vulnerability).
function sanitizeHeaderValue(value) {
  return String(value ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function send({ subject, html, replyTo }) {
  if (!transporter) return { sent: false, reason: 'mailer_not_configured' };

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: OWNER_EMAIL,
    subject,
    html,
    ...(replyTo ? { replyTo: sanitizeHeaderValue(replyTo) } : {}),
  });
  return { sent: true };
}

export function sendContactNotification({ name, email, message }) {
  return send({
    subject: `New contact form message from ${sanitizeHeaderValue(name)}`,
    replyTo: email,
    html: `
      <h2>New message from your portfolio contact form</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
      <hr />
      <p style="color:#888;font-size:12px;">Reply to this email to respond directly to ${escapeHtml(name)}.</p>
    `,
  });
}

export function sendFeedbackNotification({ author, role, quote, rating }) {
  return send({
    subject: `New client feedback from ${sanitizeHeaderValue(author)} (${rating}★)`,
    html: `
      <h2>New feedback submitted on your site</h2>
      <p><strong>From:</strong> ${escapeHtml(author)}${role ? ` — ${escapeHtml(role)}` : ''}</p>
      <p><strong>Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</p>
      <p><strong>Quote:</strong></p>
      <p>"${escapeHtml(quote)}"</p>
      <hr />
      <p style="color:#888;font-size:12px;">This is pending review — approve it from the admin panel to make it live on the site.</p>
    `,
  });
}
