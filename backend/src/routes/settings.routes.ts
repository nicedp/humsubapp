import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateSettingsSchema } from '../dtos/settings.dto';
import * as settingsController from '../controllers/settings.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Society settings management (rate_per_sqft, fixed_charge, late fee config, etc.)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/settings:
 *   get:
 *     summary: Get all society settings (all authenticated users)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current society settings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 */
router.get('/', settingsController.getSettingsHandler);

/**
 * @swagger
 * /api/v1/settings:
 *   put:
 *     summary: Update society settings (admin only)
 *     description: Updates one or more settings. Known vars - societyName, address, ratePerSqft, fixedCharge, lateFeeGraceDays, lateFeePerDay
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSettingsRequest'
 *     responses:
 *       200:
 *         description: Settings updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.put('/', requireRoles('admin'), validate(updateSettingsSchema), settingsController.updateSettingsHandler);

/**
 * POST /api/v1/settings/generate-account-number
 * Generates and persists a society account number — only if one doesn't exist yet.
 * Admin only. Idempotent: returns existing number if already set.
 */
router.post('/generate-account-number', requireRoles('admin'), settingsController.generateAccountNumberHandler);

export default router;