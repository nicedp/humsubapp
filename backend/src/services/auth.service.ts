import crypto from 'crypto';
import QRCode from 'qrcode';
import prisma from '../config/db';
import { hashPassword, comparePassword } from '../utils/hash.utils';
import { signAccessToken, signTempToken, verifyTempToken } from '../utils/jwt.utils';
import { LoginDto, ForgotPasswordDto, ResetPasswordDto, SetupTotpDto, VerifyTotpDto, DisableTotpDto } from '../dtos/auth.dto';
import { createError } from '../middleware/error.middleware';
import { generateSecret, verifyToken, getOtpAuthUrl, generateBackupCodes, hashBackupCode, verifyBackupCode } from '../utils/otp.utils';
import { sendPasswordReset } from '../utils/email.utils';

// ─── Token Blacklist (DB-persistent — CRIT-2 fix) ─────────────────────────────

export async function blacklistToken(token: string, expiresAt: Date): Promise<void> {
  try {
    await (prisma as any).blacklistedToken.upsert({
      where: { token },
      update: {},
      create: { token, expiresAt },
    });
  } catch {
    // Ignore duplicate — token may already be blacklisted
  }
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const record = await (prisma as any).blacklistedToken.findUnique({
    where: { token },
    select: { expiresAt: true },
  });
  if (!record) return false;
  // If expired, treat as not blacklisted (it wouldn't be valid anyway)
  return new Date() < record.expiresAt;
}

export async function logout(token: string, expiresAt: Date): Promise<void> {
  await blacklistToken(token, expiresAt);
}

// Periodic cleanup — called on app startup to remove stale entries
export async function cleanupBlacklistedTokens(): Promise<void> {
  try {
    await (prisma as any).blacklistedToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  } catch {
    // Non-critical — ignore errors
  }
}

// ─── Auth Result Interfaces ────────────────────────────────────────────────────

export interface AuthResult {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    residentId: string | null;
    staffId: string | null;
  };
}

export interface LoginResult {
  /** Set when credentials are valid and 2FA is NOT required */
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    residentId: string | null;
    staffId: string | null;
  };
  /** Set when 2FA IS required — frontend shows TOTP input */
  tempToken?: string;
  step?: 'totp_required';
}

// ─── Login ─────────────────────────────────────────────────────────────────────

export async function login(dto: LoginDto): Promise<LoginResult> {
  let user: any;

  if (dto.identifier) {
    // ── Path B: Admin email/phone login (no account number required) ──────────
    // Find the society by the registration contact email or phone
    const identifier = dto.identifier.trim();
    const society = await (prisma as any).society.findFirst({
      where: {
        OR: [
          { contactEmail: identifier },
          { contactPhone: identifier },
        ],
      },
      select: { id: true, status: true },
    });

    if (!society) {
      throw createError('Invalid credentials', 401);
    }

    if (society.status === 'suspended') {
      throw createError('This society account has been suspended', 403);
    }

    // Find the admin user for this society — only role='admin' can use this path
    user = await prisma.user.findFirst({
      where: { societyId: society.id, role: 'admin' },
    });

    if (!user) {
      throw createError('Invalid credentials', 401);
    }
  } else {
    // ── Path A: Standard account number + username login ──────────────────────
    const society = await (prisma as any).society.findUnique({
      where: { accountNumber: dto.accountNumber },
      select: { id: true, status: true },
    });

    if (!society) {
      throw createError('Invalid account number, username, or password', 401);
    }

    if (society.status === 'suspended') {
      throw createError('This society account has been suspended', 403);
    }

    // Find user scoped to the resolved society (compound unique key)
    user = await (prisma as any).user.findUnique({
      where: { societyId_username: { societyId: society.id, username: dto.username } },
    });

    if (!user) {
      throw createError('Invalid account number, username, or password', 401);
    }
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 403);
  }

  const valid = await comparePassword(dto.password, user.passwordHash);
  if (!valid) {
    throw createError(
      dto.identifier ? 'Invalid credentials' : 'Invalid account number, username, or password',
      401
    );
  }

  // Check if 2FA is required (society-wide setting OR user has TOTP enabled)
  const [require2faSetting, totpSecret] = await Promise.all([
    (prisma as any).societySetting.findUnique({
      where: { societyId_varName: { societyId: user.societyId, varName: 'require_2fa' } },
    }),
    (prisma as any).totpSecret.findUnique({ where: { userId: user.id } }),
  ]);

  const globalRequire2fa = require2faSetting?.varValue === 'true';
  const userHasTotp = totpSecret?.isEnabled === true;

  if (globalRequire2fa || userHasTotp) {
    // Issue a short-lived temp token — full JWT only after TOTP verified
    const tempToken = signTempToken(user.id);
    return { tempToken, step: 'totp_required' };
  }

  // No 2FA — issue full JWT
  const token = signAccessToken(
    {
      userId: user.id,
      societyId: user.societyId,
      role: user.role,
      residentId: user.residentId,
      staffId: user.staffId,
    },
    dto.rememberMe
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      residentId: user.residentId,
      staffId: user.staffId,
    },
  };
}

// ─── Record Login Session ──────────────────────────────────────────────────────

export async function recordLoginSession(
  userId: string,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  // Parse basic browser / device info from User-Agent string
  const browser = parseBrowser(userAgent);
  const device = parseDevice(userAgent);

  // MED-5: Delete sessions older than 90 days to prevent unbounded growth
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await (prisma as any).loginSession.deleteMany({
    where: { userId, loggedAt: { lt: cutoff } },
  });

  await (prisma as any).loginSession.create({
    data: { userId, ipAddress, userAgent, browser, device },
  });
}

function parseBrowser(ua: string): string {
  if (/Chrome\//.test(ua) && !/Chromium|Edge|OPR/.test(ua)) return 'Chrome';
  if (/Firefox\//.test(ua)) return 'Firefox';
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  return 'Unknown';
}

function parseDevice(ua: string): string {
  if (/Mobile|Android/.test(ua)) return 'Mobile';
  if (/Tablet|iPad/.test(ua)) return 'Tablet';
  return 'Desktop';
}

export async function getLoginSessions(userId: string) {
  const sessions = await (prisma as any).loginSession.findMany({
    where: { userId },
    orderBy: { loggedAt: 'desc' },
    take: 20,
  });
  return sessions;
}

export async function invalidateSession(userId: string, sessionId: string): Promise<void> {
  const session = await (prisma as any).loginSession.findUnique({ where: { id: sessionId } });
  if (!session || session.userId !== userId) {
    throw createError('Session not found', 404);
  }
  await (prisma as any).loginSession.update({
    where: { id: sessionId },
    data: { isActive: false },
  });
}

// ─── Change Password ───────────────────────────────────────────────────────────

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw createError('Current password is incorrect', 400);

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
}

// ─── Forgot / Reset Password ───────────────────────────────────────────────────

export async function forgotPassword(dto: ForgotPasswordDto): Promise<void> {
  // Find user by email — stored on the linked resident or staff record
  const resident = await prisma.resident.findUnique({ where: { email: dto.email } });
  const user = resident
    ? await prisma.user.findUnique({ where: { residentId: resident.id } })
    : null;

  if (!user) {
    // Do NOT reveal whether email exists — always respond 200 on the API
    return;
  }

  // Invalidate any existing unused tokens for this user
  await (prisma as any).passwordResetToken.updateMany({
    where: { userId: user.id, usedAt: null },
    data: { usedAt: new Date() }, // mark old tokens as "used" to invalidate
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await (prisma as any).passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  await sendPasswordReset(dto.email, token);
}

export async function resetPassword(token: string, dto: ResetPasswordDto): Promise<void> {
  const record = await (prisma as any).passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) throw createError('Invalid or expired reset link', 400);
  if (record.usedAt) throw createError('This reset link has already been used', 400);
  if (new Date() > record.expiresAt) throw createError('Reset link has expired', 400);

  const newHash = await hashPassword(dto.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: newHash },
    }),
    (prisma as any).passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);
}

// ─── TOTP 2FA ─────────────────────────────────────────────────────────────────

/**
 * Initialize TOTP setup — generates secret + returns otpauth URL + QR code PNG (base64)
 * Does NOT enable 2FA yet — user must call verifyAndEnableTotp() to confirm.
 */
export async function initTotpSetup(userId: string): Promise<{
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createError('User not found', 404);

  const secret = generateSecret();
  const otpauthUrl = getOtpAuthUrl(secret, user.username);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  // Upsert the secret as pending (isEnabled=false) so it survives the page refresh
  await (prisma as any).totpSecret.upsert({
    where: { userId },
    create: { userId, secret, isEnabled: false, backupCodes: [] },
    update: { secret, isEnabled: false, backupCodes: [] },
  });

  return { secret, otpauthUrl, qrCodeDataUrl };
}

/**
 * Verify a TOTP code and activate 2FA for the user.
 * Returns backup codes (shown once, never again).
 */
export async function verifyAndEnableTotp(userId: string, dto: SetupTotpDto): Promise<string[]> {
  const record = await (prisma as any).totpSecret.findUnique({ where: { userId } });
  if (!record) throw createError('TOTP setup not initiated — call setup first', 400);
  if (record.isEnabled) throw createError('2FA is already enabled', 400);

  if (!verifyToken(record.secret, dto.code)) {
    throw createError('Invalid TOTP code', 400);
  }

  const plainCodes = generateBackupCodes(8);
  const hashedCodes = plainCodes.map(hashBackupCode);

  await (prisma as any).totpSecret.update({
    where: { userId },
    data: { isEnabled: true, backupCodes: hashedCodes },
  });

  return plainCodes; // shown once — user must save them
}

/**
 * Verify TOTP during login — exchanges tempToken for full JWT.
 * Accepts 6-digit TOTP code OR a backup code (XXXX-XXXX format).
 */
export async function verifyTotpLogin(
  dto: VerifyTotpDto,
  ipAddress: string,
  userAgent: string
): Promise<AuthResult> {
  // Validate the temp token
  let tempPayload;
  try {
    tempPayload = verifyTempToken(dto.tempToken);
  } catch {
    throw createError('Invalid or expired session — please login again', 401);
  }

  const userId = tempPayload.userId;
  const [user, totpRecord] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    (prisma as any).totpSecret.findUnique({ where: { userId } }),
  ]);

  if (!user) throw createError('User not found', 401);
  if (!totpRecord || !totpRecord.isEnabled) {
    throw createError('2FA is not set up for this account', 400);
  }

  // Try TOTP code first, then backup code
  let verified = false;

  const isBackupCode = /^[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}$/i.test(dto.code);
  if (isBackupCode) {
    const idx = verifyBackupCode(dto.code, totpRecord.backupCodes);
    if (idx >= 0) {
      // Remove used backup code
      const newCodes = [...totpRecord.backupCodes];
      newCodes.splice(idx, 1);
      await (prisma as any).totpSecret.update({
        where: { userId },
        data: { backupCodes: newCodes },
      });
      verified = true;
    }
  } else {
    verified = verifyToken(totpRecord.secret, dto.code);
  }

  if (!verified) {
    throw createError('Invalid TOTP code', 401);
  }

  // Record login session
  await recordLoginSession(userId, ipAddress, userAgent);

  const token = signAccessToken(
    {
      userId: user.id,
      societyId: user.societyId,
      role: user.role,
      residentId: user.residentId,
      staffId: user.staffId,
    },
    dto.rememberMe
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      residentId: user.residentId,
      staffId: user.staffId,
    },
  };
}

/**
 * Disable TOTP for a user — requires current TOTP code confirmation.
 */
export async function disableTotp(userId: string, dto: DisableTotpDto): Promise<void> {
  const record = await (prisma as any).totpSecret.findUnique({ where: { userId } });
  if (!record || !record.isEnabled) throw createError('2FA is not enabled', 400);

  if (!verifyToken(record.secret, dto.code)) {
    throw createError('Invalid TOTP code', 400);
  }

  await (prisma as any).totpSecret.delete({ where: { userId } });
}

/**
 * Get TOTP status for a user
 */
export async function getTotpStatus(userId: string): Promise<{
  isEnabled: boolean;
  backupCodesRemaining: number;
}> {
  const record = await (prisma as any).totpSecret.findUnique({ where: { userId } });
  return {
    isEnabled: record?.isEnabled ?? false,
    backupCodesRemaining: record?.backupCodes?.length ?? 0,
  };
}

// ─── getMe ────────────────────────────────────────────────────────────────────

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      resident: {
        include: { flat: true },
      },
      staff: true,
    },
  });

  if (!user) throw createError('User not found', 404);

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    residentId: user.residentId,
    staffId: user.staffId,
    resident: user.resident
      ? {
          id: user.resident.id,
          name: user.resident.name,
          flatNumber: user.resident.flat.flatNumber,
          floor: user.resident.flat.floor,
        }
      : null,
    staff: user.staff
      ? {
          id: user.staff.id,
          name: user.staff.name,
          role: user.staff.role,
        }
      : null,
  };
}