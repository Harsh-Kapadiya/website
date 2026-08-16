import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import { sendFeedbackNotification } from '../lib/mailer.js';

export const feedbackRouter = Router();

feedbackRouter.post('/', async (req, res) => {
  const { author, role, quote, rating } = req.body ?? {};

  if (!author?.trim() || !quote?.trim()) {
    return res.status(400).json({ error: 'Your name and feedback are required.' });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number from 1 to 5.' });
  }
  if (quote.length > 2000) {
    return res.status(400).json({ error: 'Feedback is too long.' });
  }
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Server is not connected to Supabase yet.' });
  }

  const clean = {
    author: author.trim(),
    role: role?.trim() || null,
    quote: quote.trim(),
    rating: ratingNum,
    approved: false, // always starts pending — admin approves before it's public
  };

  const { error } = await supabaseAdmin.from('feedback').insert(clean);
  if (error) return res.status(500).json({ error: error.message });

  try {
    await sendFeedbackNotification(clean);
  } catch (err) {
    console.error('[feedback] email notification failed:', err.message);
  }

  res.status(201).json({ ok: true });
});
