// otplib v12 — uses top-level functions (already have crypto plugin pre-configured)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const otplib = require('otplib') as {
  generateSecret: (opts?: object) => string;
  generateURI: (opts: { issuer: string; label: string; secret: string; type: 'totp' }) => string;
  verifySync: (opts: { token: string; secret: string; type: 'totp' }) => { valid: boolean };
  generateSync: (opts: { secret: string; type: 'totp' }) => string;
};

import crypto from 'crypto';

/**
 * Generate a new TOTP secret key (base32 encoded)
 */
export function generateSecret(): string {
  return otplib.generateSecret();
}

/**
 * Verify a TOTP token against a secret (synchronous)
 */
export function verifyToken(secret: string, token: string): boolean {
  try {
    const result = otplib.verifySync({ token: token.replace(/\s/g, ''), secret, type: 'totp' });
    return result.valid;
  } catch {
    return false;
  }
}

/**
 * Generate a TOTP token for a secret (useful for tests / backup code display)
 */
export function generateToken(secret: string): string {
  return otplib.generateSync({ secret, type: 'totp' });
}

/**
 * Generate an otpauth:// URI for QR code generation
 */
export function getOtpAuthUrl(secret: string, username: string, issuer = 'Society Portal'): string {
  return otplib.generateURI({
    type: 'totp',
    label: `${issuer}:${username}`,
    issuer,
    secret,
  });
}

/**
 * Generate N random backup codes (plain text, NOT hashed)
 * Each code is 8 hex chars formatted as XXXX-XXXX
 */
export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${raw.slice(0, 4)}-${raw.slice(4)}`;
  });
}

/**
 * Hash a backup code for storage (SHA-256)
 */
export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.replace('-', '').toUpperCase()).digest('hex');
}

/**
 * Verify a submitted backup code against stored hashes.
 * Returns the index of the matched hash (caller should splice it out), or -1 if no match.
 */
export function verifyBackupCode(submitted: string, storedHashes: string[]): number {
  const hash = hashBackupCode(submitted);
  return storedHashes.indexOf(hash);
}