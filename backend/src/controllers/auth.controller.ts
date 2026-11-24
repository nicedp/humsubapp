import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { decodeTokenExpiry } from '../utils/jwt.utils';

// ─── Existing handlers ─────────────────────────────────────────────────────────

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);

    // If 2FA is required, return tempToken instead of full JWT
    if (result.step === 'totp_required') {
      res.json({ tempToken: result.tempToken, step: result.step });
      return;
    }

    // No 2FA — record session and return full JWT
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? 'unknown';
    const ua = req.headers['user-agent'] ?? 'unknown';

    await authService.recordLoginSession(result.user!.id, ip, ua);

    res.json({ token: result.token, user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function getMeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await authService.getMe(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
}

export async function logoutHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.token!;
    const expiresAt = decodeTokenExpiry(token);
    await authService.logout(token, expiresAt);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── Forgot / Reset Password ───────────────────────────────────────────────────

export async function forgotPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.forgotPassword(req.body);
    // Always return 200 — never reveal whether the email exists
    res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.params.token, req.body);
    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
}

// ─── TOTP 2FA ─────────────────────────────────────────────────────────────────

/** POST /auth/2fa/setup — initiate TOTP setup, returns QR code data URL */
export async function initTotpSetupHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await authService.initTotpSetup(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /auth/2fa/enable — verify code and activate 2FA, returns backup codes */
export async function enableTotpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const backupCodes = await authService.verifyAndEnableTotp(userId, req.body);
    res.json({ message: '2FA enabled successfully', backupCodes });
  } catch (err) {
    next(err);
  }
}

/** POST /auth/2fa/verify — exchange tempToken + TOTP code for full JWT */
export async function verifyTotpLoginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      ?? req.socket.remoteAddress
      ?? 'unknown';
    const ua = req.headers['user-agent'] ?? 'unknown';

    const result = await authService.verifyTotpLogin(req.body, ip, ua);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** DELETE /auth/2fa — disable TOTP (requires current TOTP code) */
export async function disableTotpHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await authService.disableTotp(userId, req.body);
    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    next(err);
  }
}

/** GET /auth/2fa/status — returns isEnabled + backupCodesRemaining */
export async function getTotpStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const status = await authService.getTotpStatus(userId);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

// ─── Login Sessions ────────────────────────────────────────────────────────────

/** GET /auth/sessions — list login sessions for current user */
export async function getSessionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const sessions = await authService.getLoginSessions(userId);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

/** DELETE /auth/sessions/:id — invalidate a specific login session */
export async function invalidateSessionHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await authService.invalidateSession(userId, id);
    res.json({ message: 'Session invalidated' });
  } catch (err) {
    next(err);
  }
}