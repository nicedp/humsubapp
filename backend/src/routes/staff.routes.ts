import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createStaffSchema, updateStaffSchema, bulkCreateStaffSchema } from '../dtos/staff.dto';
import * as staffController from '../controllers/staff.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Society staff management (security guards, maintenance, etc.)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/staff:
 *   get:
 *     summary: Get all staff members (admin only)
 *     tags: [Staff]
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
 *         description: List of staff
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Staff'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRoles('admin'), staffController.getAllStaffHandler);

// POST /api/v1/staff/bulk — must be before /:id
router.post('/bulk', requireRoles('admin'), staffController.bulkCreateStaffHandler);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   get:
 *     summary: Get a staff member by ID (admin only)
 *     tags: [Staff]
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
 *         description: Staff member details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.get('/:id', requireRoles('admin'), staffController.getStaffByIdHandler);

/**
 * @swagger
 * /api/v1/staff:
 *   post:
 *     summary: Create a staff member (admin only)
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStaffRequest'
 *     responses:
 *       201:
 *         description: Staff member created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('admin'), validate(createStaffSchema), staffController.createStaffHandler);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   put:
 *     summary: Update a staff member (admin only)
 *     tags: [Staff]
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
 *             $ref: '#/components/schemas/UpdateStaffRequest'
 *     responses:
 *       200:
 *         description: Staff member updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Staff'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateStaffSchema), staffController.updateStaffHandler);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   delete:
 *     summary: Delete a staff member (admin only)
 *     tags: [Staff]
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
 *         description: Staff member deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), staffController.deleteStaffHandler);

export default router;