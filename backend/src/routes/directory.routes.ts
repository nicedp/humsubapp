import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import * as directoryController from '../controllers/directory.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Directory
 *   description: Resident directory (PII-safe - name, flat, floor, type only)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/directory:
 *   get:
 *     summary: Get resident directory (owner/tenant/admin - no PII)
 *     description: Returns a PII-safe list of residents showing name, flat_number, floor, flat_type only. Phone and email are never exposed to residents.
 *     tags: [Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: PII-safe resident directory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DirectoryEntry'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRoles('owner', 'tenant', 'admin'), directoryController.getDirectoryHandler);

export default router;