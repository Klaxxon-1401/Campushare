import rateLimit from 'express-rate-limit';

const rateLimited = (code: string, message: string) => ({ error: { code, message } });

/** Broad limiter applied to every request. */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Credential endpoints: register / login. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimited('RATE_LIMITED', 'Too many attempts. Try again later.'),
});

/** OTP issuance: guards against email bombing. */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimited('RATE_LIMITED', 'Too many verification requests. Try again later.'),
});
