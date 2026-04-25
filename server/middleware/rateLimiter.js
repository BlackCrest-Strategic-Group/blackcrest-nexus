import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please retry later.', code: 'RATE_LIMITED' }
});
