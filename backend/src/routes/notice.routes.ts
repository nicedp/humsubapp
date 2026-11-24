import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createNoticeSchema, updateNoticeSchema } from '../dtos/notice.dto';
import * as noticeController from '../controllers/notice.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notices
 *   description: Society notice board management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/notices:
 *   get:
 *     summary: Get all notices (residents see active only; admin sees all)
 *     tags: [Notices]
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
 *         description: List of notices
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notice'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       401:
 *         description: Unauthorized
 */
router.get('/', noticeController.getAllNoticesHandler);

/**
 * @swagger
 * /api/v1/notices/{id}:
 *   get:
 *     summary: Get a notice by ID (all authenticated users)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notice details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       404:
 *         description: Not found
 */
router.get('/:id', noticeController.getNoticeByIdHandler);

/**
 * @swagger
 * /api/v1/notices:
 *   post:
 *     summary: Create a notice (admin only)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNoticeRequest'
 *     responses:
 *       201:
 *         description: Notice created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('admin'), validate(createNoticeSchema), noticeController.createNoticeHandler);

/**
 * @swagger
 * /api/v1/notices/{id}:
 *   put:
 *     summary: Update a notice (admin only)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoticeRequest'
 *     responses:
 *       200:
 *         description: Notice updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notice'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateNoticeSchema), noticeController.updateNoticeHandler);

/**
 * @swagger
 * /api/v1/notices/{id}:
 *   delete:
 *     summary: Delete a notice (admin only)
 *     tags: [Notices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notice deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), noticeController.deleteNoticeHandler);

export default router;