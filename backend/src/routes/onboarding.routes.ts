import { Router } from 'express';
import { loginRateLimiter } from '../middleware/rate-limit.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  registerSocietySchema,
  step1ProfileSchema,
  step2AdminSchema,
  step3BillingSchema,
} from '../dtos/onboarding.dto';
import * as ctrl from '../controllers/onboarding.controller';

const router = Router();

// ─── Public (token-gated or fully public) ─────────────────────────────────────

/** POST /api/v1/onboarding/register — rate-limited public endpoint */
router.post('/register', loginRateLimiter, validate(registerSocietySchema), ctrl.registerSociety);

/** GET /api/v1/onboarding/check-url?slug=<slug> — public; check slug availability */
router.get('/check-url', ctrl.checkSocietyUrl);

/** GET /api/v1/onboarding/find-account?q=<query> — public; search society by name/email/phone */
router.get('/find-account', ctrl.findAccount);

/** GET /api/v1/onboarding/:token/validate — validate token + return society + session */
router.get('/:token/validate', ctrl.validateToken);

/** POST /api/v1/onboarding/:token/step1 — save society profile (token-gated, no JWT) */
router.post('/:token/step1', validate(step1ProfileSchema), ctrl.saveStep1);

/** POST /api/v1/onboarding/:token/step2 — create admin account; returns JWT */
router.post('/:token/step2', validate(step2AdminSchema), ctrl.saveStep2);

// ─── JWT Auth (admin of the society being set up) ─────────────────────────────

/** POST /api/v1/onboarding/step3 — save billing config */
router.post('/step3', authMiddleware, requireRoles('admin'), validate(step3BillingSchema), ctrl.saveStep3);

/** GET /api/v1/onboarding/progress — get current session (for resume on reload) */
router.get('/progress', authMiddleware, requireRoles('admin'), ctrl.getProgress);

/** POST /api/v1/onboarding/activate — activate society (wizard complete) */
router.post('/activate', authMiddleware, requireRoles('admin'), ctrl.activateSociety);

export default router;