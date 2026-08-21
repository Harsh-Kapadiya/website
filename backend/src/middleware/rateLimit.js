import rateLimit from 'express-rate-limit';

// 5 submissions per 15 minutes per IP — generous for a real visitor,
// enough to blunt basic spam/bot hammering on a public endpoint.
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this address — please try again later.' },
});
