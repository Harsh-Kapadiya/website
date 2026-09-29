import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { validate, publicMessage, contactSpec, feedbackSpec } from './validate.js';
import { notifyOwner, mailerConfigured } from './mailer.js';

// ---------- config: fail fast, fail closed ----------
const env = process.env;
// Anything that isn't explicitly local dev is treated as production.
const isDev = env.NODE_ENV === 'development';
const supabaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const allowedOrigins = new Set(
  (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

const missing = [
  ['SUPABASE_URL', env.SUPABASE_URL],
  ['SUPABASE_SECRET_KEY', supabaseKey],
  ['ALLOWED_ORIGINS', allowedOrigins.size > 0],
]
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

if (missing.length) {
  if (!isDev) {
    console.error(`[config] refusing to start, missing: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.warn(`[config] dev mode, missing: ${missing.join(', ')} — form writes will fail`);
}
if (!mailerConfigured) console.warn('[config] SMTP/OWNER_EMAIL incomplete — submissions save but no email is sent');

const db =
  env.SUPABASE_URL && supabaseKey
    ? createClient(env.SUPABASE_URL, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

const log = (level, msg, extra = {}) => console[level](JSON.stringify({ level, msg, ...extra }));

// ---------- app ----------
const app = express();

// Render (and most PaaS) put exactly one proxy in front of the app. This makes
// req.ip the real client IP for rate limiting instead of the proxy's.
app.set('trust proxy', Number(env.TRUST_PROXY_HOPS ?? 1));
app.use(helmet());

app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = not a browser cross-origin request (curl, uptime checks).
      if (!origin) return callback(null, true);
      const localDev = isDev && /^http:\/\/localhost:\d+$/.test(origin);
      callback(null, allowedOrigins.has(origin) || localDev);
    },
    methods: ['GET', 'POST'],
  })
);
app.use(express.json({ limit: '16kb' }));

// Per-IP limit per form, plus a global ceiling so rotating IPs can't flood
// the database or the mailbox.
// ponytail: in-memory store — fine for one Render instance. Scaling to several
// instances? Swap in a Redis store (rate-limit-redis / Upstash).
const perIp = () => rateLimit({ windowMs: 15 * 60_000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'Too many submissions — please try again later.' } });
const globalCap = rateLimit({ windowMs: 15 * 60_000, limit: 100, keyGenerator: () => 'global', standardHeaders: 'draft-8',
  legacyHeaders: false, message: { error: 'RATE_LIMITED', message: 'The form is busy right now — please try again shortly.' } });

// ---------- health ----------
app.get('/api/health', (_req, res) => res.json({ ok: true })); // liveness: process is up

app.get('/api/ready', async (_req, res) => {
  // readiness: can we actually reach the database?
  if (!db) return res.status(503).json({ ready: false });
  const { error } = await db.from('content_blocks').select('id', { head: true, count: 'exact' }).limit(1);
  res.status(error ? 503 : 200).json({ ready: !error });
});

// ---------- forms ----------
async function submit(req, res, { spec, table, toRow, email }) {
  const { data, error, field } = validate(req.body, spec);
  if (error) return res.status(400).json({ error, message: publicMessage(error, field), requestId: req.id });

  // Honeypot filled → pretend success, store nothing.
  if (data.website) return res.status(201).json({ ok: true });

  const row = toRow(data);
  const { error: dbError } = await db.from(table).insert(row);
  if (dbError) {
    log('error', 'insert failed', { requestId: req.id, table, code: dbError.code, detail: dbError.message });
    return res.status(500).json({ error: 'SUBMISSION_FAILED', message: 'Something went wrong. Please try again.', requestId: req.id });
  }

  // Row is saved first; a mail failure is logged, never shown to the visitor.
  // ponytail: no retry queue — every submission is also in the admin panel inbox.
  notifyOwner(email(row)).catch((e) => log('error', 'notification failed', { requestId: req.id, table, detail: e.message }));
  res.status(201).json({ ok: true });
}

const requireDb = (req, res, next) =>
  db ? next() : res.status(503).json({ error: 'UNAVAILABLE', message: 'Service temporarily unavailable.', requestId: req.id });

app.post('/api/contact', requireDb, globalCap, perIp(), (req, res) =>
  submit(req, res, {
    spec: contactSpec,
    table: 'contact_messages',
    toRow: ({ name, email, message }) => ({ name, email, message }),
    email: (r) => ({
      subject: `New contact message from ${r.name}`,
      replyTo: r.email,
      text: `Name: ${r.name}\nEmail: ${r.email}\n\n${r.message}\n\n— Reply to this email to answer ${r.name} directly.`,
    }),
  })
);

app.post('/api/feedback', requireDb, globalCap, perIp(), (req, res) =>
  submit(req, res, {
    spec: feedbackSpec,
    table: 'feedback',
    toRow: ({ author, role, quote, rating }) => ({ author, role, quote, rating, approved: false }),
    email: (r) => ({
      subject: `New client review from ${r.author} (${r.rating}/5)`,
      text: `From: ${r.author}${r.role ? ` — ${r.role}` : ''}\nRating: ${r.rating}/5\n\n"${r.quote}"\n\n— Pending: approve it in the admin panel to show it on the site.`,
    }),
  })
);

// ---------- fallbacks ----------
app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', requestId: req.id }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  const status = err.status === 400 || err.status === 413 ? err.status : 500;
  const code = status === 413 ? 'PAYLOAD_TOO_LARGE' : status === 400 ? 'INVALID_JSON' : 'INTERNAL_ERROR';
  if (status === 500) log('error', 'unhandled', { requestId: req.id, detail: err.message });
  res.status(status).json({ error: code, message: 'Invalid request.', requestId: req.id });
});

const port = Number(env.PORT) || 8787;
app.listen(port, () => log('info', 'listening', { port, origins: [...allowedOrigins] }));
