import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { contactRouter } from './routes/contact.js';
import { feedbackRouter } from './routes/feedback.js';
import { formLimiter } from './middleware/rateLimit.js';
import { supabaseAdmin } from './lib/supabaseAdmin.js';

const PORT = process.env.PORT || 8787;

// Comma-separated in .env, e.g.
// ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://arik.design,https://admin.arik.design
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      // Allow no-origin requests (curl, server-to-server health checks)
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, supabaseConnected: Boolean(supabaseAdmin) });
});

app.use('/api/contact', formLimiter, contactRouter);
app.use('/api/feedback', formLimiter, feedbackRouter);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err.message);
  res.status(500).json({ error: 'Something went wrong.' });
});

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
  if (allowedOrigins.length === 0) {
    console.warn('[server] ALLOWED_ORIGINS is empty — every origin will currently be allowed. Set it before deploying.');
  }
});
