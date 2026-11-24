import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  societyId: number;
  role: string;
  residentId?: string | null;
  staffId?: string | null;
}

/** Short-lived temp token payload used during the TOTP verification step */
export interface TempTokenPayload {
  userId: string;
  step: 'totp';
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '8h';
const JWT_DEFAULT_TTL = process.env.JWT_DEFAULT_TTL ?? '1d';
const JWT_REMEMBER_TTL = process.env.JWT_REMEMBER_TTL ?? '30d';
const TEMP_TOKEN_TTL = '5m'; // short-lived for TOTP step

export function signAccessToken(payload: JwtPayload, rememberMe = false): string {
  // Use legacy JWT_EXPIRES_IN if the new TTL vars are not set (backwards compat)
  const expiresIn = rememberMe ? JWT_REMEMBER_TTL : JWT_DEFAULT_TTL;
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded as JwtPayload;
}

/**
 * Decode token WITHOUT verifying signature — used to extract `exp` for blacklisting.
 * The token was already verified by authMiddleware before calling logout.
 */
export function decodeTokenExpiry(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (!decoded?.exp) {
    // Fallback: 24 hours from now
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  return new Date(decoded.exp * 1000);
}

/**
 * Issue a short-lived (5 min) temp token for the 2FA TOTP verification step.
 * The frontend exchanges this token for a full JWT after TOTP is verified.
 */
export function signTempToken(userId: string): string {
  const payload: TempTokenPayload = { userId, step: 'totp' };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TEMP_TOKEN_TTL } as jwt.SignOptions);
}

/**
 * Verify a temp token — throws if invalid/expired or not a totp step token.
 */
export function verifyTempToken(token: string): TempTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as TempTokenPayload;
  if (decoded.step !== 'totp') {
    throw new Error('Invalid temp token step');
  }
  return decoded;
}