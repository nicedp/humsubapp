import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyTotpSchema,
  setupTotpSchema,
  disableTotpSchema,
} from '../dtos/auth.dto';
import * as authController from '../controllers/auth.controller';
import {
  loginRateLimiter,
  forgotPasswordRateLimiter,
  totpRateLimiter,
} from '../middleware/rate-limit.middleware';

const router = Router();

// ─── Public Routes ─────────────────────────────────────────────────────────────

// OWASP A07: Rate-limited login — 10 attempts per 15 min per IP
router.post('/login', loginRateLimiter, validate(loginSchema), authController.loginHandler);

/** POST /forgot-password — send password reset email (rate-limited: 5/hr) */
router.post('/forgot-password', forgotPasswordRateLimiter, validate(forgotPasswordSchema), authController.forgotPasswordHandler);

/** POST /reset-password/:token — set new password using reset token */
router.post('/reset-password/:token', validate(resetPasswordSchema), authController.resetPasswordHandler);

/** POST /2fa/verify — exchange tempToken + TOTP code for full JWT (rate-limited: 10/15min) */
router.post('/2fa/verify', totpRateLimiter, validate(verifyTotpSchema), authController.verifyTotpLoginHandler);

// ─── Authenticated Routes ──────────────────────────────────────────────────────

router.get('/me', authMiddleware, authController.getMeHandler);

router.put('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePasswordHandler);

router.post('/logout', authMiddleware, authController.logoutHandler);

/** GET /2fa/status — returns isEnabled + backupCodesRemaining */
router.get('/2fa/status', authMiddleware, authController.getTotpStatusHandler);

/** POST /2fa/setup — initiate TOTP setup, returns QR code data URL + secret */
router.post('/2fa/setup', authMiddleware, authController.initTotpSetupHandler);

/** POST /2fa/enable — verify TOTP code and activate 2FA, returns backup codes */
router.post('/2fa/enable', authMiddleware, validate(setupTotpSchema), authController.enableTotpHandler);

/** DELETE /2fa — disable TOTP (requires current TOTP code confirmation) */
router.delete('/2fa', authMiddleware, validate(disableTotpSchema), authController.disableTotpHandler);

/** GET /sessions — list login sessions for current user */
router.get('/sessions', authMiddleware, authController.getSessionsHandler);

/** DELETE /sessions/:id — invalidate a specific login session */
router.delete('/sessions/:id', authMiddleware, authController.invalidateSessionHandler);

export default router;