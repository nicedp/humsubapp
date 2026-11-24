import 'dotenv/config';
import 'express-async-errors';
import app from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// ─────────────────────────────────────────────
// T2: OWASP A07 — Startup JWT secret strength check
// Aborts in production if the secret is weak or default.
// Warns in development so devs know to rotate it before going live.
// ─────────────────────────────────────────────
const WEAK_SECRETS = new Set(['secret', 'changeme', 'jwt_secret', 'your_secret', 'password', '123456', 'supersecret']);
const jwtSecret = process.env.JWT_SECRET ?? '';
if (jwtSecret.length < 32 || WEAK_SECRETS.has(jwtSecret.toLowerCase())) {
  const msg = `⚠️  SECURITY WARNING: JWT_SECRET is weak or default ("${jwtSecret.slice(0, 8)}..."). Min 32 chars required.`;
  if (process.env.NODE_ENV === 'production') {
    console.error(msg);
    console.error('🚫 Refusing to start in production with a weak JWT_SECRET. Set a strong secret and restart.');
    process.exit(1);
  } else {
    console.warn(msg);
    console.warn('   → In production this would abort. Set JWT_SECRET to a random 32+ char string.');
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Society Management API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});