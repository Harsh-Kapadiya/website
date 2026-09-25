import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { sendContactNotification } from '../lib/mailer.js';

export const contactRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactRouter.post('/', async (req, res) => {
  const { name, email, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'name, email and message are all required.' });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ error: 'That email address doesn\u2019t look valid.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long.' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Server is not connected to Supabase yet.' });
  }

  const clean = { name: name.trim(), email: email.trim(), message: message.trim() };

  const { error } = await supabaseAdmin.from('contact_messages').insert(clean);
  if (error) return res.status(500).json({ error: error.message });

  // Email failures shouldn't fail the request — the message is already
  // saved and visible in the admin panel either way.
  try {
    await sendContactNotification(clean);
  } catch (err) {
    console.error('[contact] email notification failed:', err.message);
  }

  res.status(201).json({ ok: true });
});
