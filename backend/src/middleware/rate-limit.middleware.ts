import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoint — 10 attempts per 15 minutes per IP.
 * OWASP A07: Identification and Authentication Failures — Brute Force Protection.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
  skipSuccessfulRequests: false,
});

/**
 * Rate limiter for forgot-password — 5 requests per hour per IP.
 * Prevents email flood / enumeration.
 */
export const forgotPasswordRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many password reset requests. Please try again in 1 hour.' },
});

/**
 * Rate limiter for TOTP 2FA verify — 10 attempts per 15 minutes per IP.
 * Prevents brute-forcing the 6-digit TOTP window.
 */
export const totpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many 2FA attempts. Please try again in 15 minutes.' },
});

/**
 * Global API rate limiter — 300 requests per minute per IP.
 * Applied to all /api/v1/* routes as a backstop.
 */
export const globalApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});