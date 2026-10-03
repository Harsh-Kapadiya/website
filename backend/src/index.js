import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { validate, publicMessage, contactSpec, feedbackSpec } from './validate.js';
import { notifyOwner, mailerConfigured } from './mailer.js';
import { validateChat, loadKnowledge, runChat } from './chat.js';

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
if (!mailerConfigured) console.warn('[config] email not configured (OWNER_EMAIL + RESEND_API_KEY or SMTP_*) — submissions save but no email is sent');

// Chat assistant is optional: without a key the endpoint answers 503 and the widget shows "offline".
const chatKey = env.ANTHROPIC_API_KEY;
const chatModel = env.CHAT_MODEL || 'claude-haiku-4-5-20251001';
// Links the assistant shares: the first non-localhost allowed origin (your live site).
const siteUrl = [...allowedOrigins].find((o) => o.startsWith('https://')) || '';
if (!chatKey) console.warn('[config] ANTHROPIC_API_KEY not set — website chat is disabled');

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
// Chat carries a short conversation history, so it gets a larger (still small) body limit.
app.use('/api/chat', express.json({ limit: '48kb' }));
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
// liveness: process is up. `chat` lets the widget show "offline" instead of failing on send.
app.get('/api/health', (_req, res) => res.json({ ok: true, chat: Boolean(chatKey) }));

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

app.post('/api/contact', requireDb, perIp(), globalCap, (req, res) =>
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

app.post('/api/feedback', requireDb, perIp(), globalCap, (req, res) =>
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

// ---------- chat assistant ----------
const chatPerIp = rateLimit({ windowMs: 15 * 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'You’re sending messages quickly — please wait a few minutes.' } });
// Cost ceiling: whatever happens, at most CHAT_DAILY_LIMIT replies per day across all visitors.
const chatDaily = rateLimit({ windowMs: 24 * 60 * 60_000, limit: Number(env.CHAT_DAILY_LIMIT) || 300, keyGenerator: () => 'chat-daily',
  standardHeaders: 'draft-8', legacyHeaders: false,
  message: { error: 'RATE_LIMITED', message: 'The assistant is resting for today — please use the contact form.' } });
const requireChat = (req, res, next) =>
  chatKey && db ? next() : res.status(503).json({ error: 'CHAT_UNAVAILABLE', message: 'The assistant is offline — please use the contact form.', requestId: req.id });

// A confirmed lead from the chat lands exactly like a contact-form message.
async function saveChatLead(input, requestId) {
  const { data, error, field } = validate({ name: input.name, email: input.email, message: input.message }, contactSpec);
  if (error) return { ok: false, error: `${publicMessage(error, field)} Ask the visitor to correct it.` };
  const row = { name: data.name, email: data.email, message: `[via website chat]\n\n${data.message}` };
  const { error: dbError } = await db.from('contact_messages').insert(row);
  if (dbError) {
    log('error', 'chat lead insert failed', { requestId, code: dbError.code, detail: dbError.message });
    return { ok: false, error: 'Saving failed. Suggest the contact page instead.' };
  }
  notifyOwner({
    subject: `New lead from the website chat: ${row.name}`,
    replyTo: row.email,
    text: `Name: ${row.name}\nEmail: ${row.email}\n\n${data.message}\n\n— Sent by the website chat assistant after the visitor confirmed. Reply to this email to answer directly.`,
  }).catch((e) => log('error', 'notification failed', { requestId, table: 'contact_messages', detail: e.message }));
  return { ok: true };
}

app.post('/api/chat', requireChat, chatPerIp, chatDaily, async (req, res) => {
  const { data, error } = validateChat(req.body);
  if (error) return res.status(400).json({ error, message: publicMessage(error, 'message'), requestId: req.id });
  if (data.website) return res.json({ reply: 'Thanks!', leadSaved: false }); // honeypot

  try {
    const knowledge = await loadKnowledge(db, siteUrl);
    const out = await runChat({
      messages: data.messages, knowledge, siteUrl, apiKey: chatKey, model: chatModel,
      saveLead: (input) => saveChatLead(input, req.id),
      // Token counts only — conversation text is never logged or stored.
      onUsage: (u) => log('info', 'chat usage', { requestId: req.id, input: u?.input_tokens, cached: u?.cache_read_input_tokens, output: u?.output_tokens }),
    });
    res.json(out);
  } catch (e) {
    log('error', 'chat failed', { requestId: req.id, detail: e.message });
    res.status(502).json({ error: 'CHAT_FAILED', message: 'The assistant is having trouble right now — please try again or use the contact form.', requestId: req.id });
  }
});

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
