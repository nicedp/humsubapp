import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createComplaintSchema, updateComplaintSchema } from '../dtos/complaint.dto';
import * as complaintController from '../controllers/complaint.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Resident complaint management
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/complaints:
 *   get:
 *     summary: Get all complaints with filters (admin only)
 *     tags: [Complaints]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *       - in: query
 *         name: flatId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRoles('admin'), complaintController.getAllComplaintsHandler);

/**
 * @swagger
 * /api/v1/complaints/my:
 *   get:
 *     summary: Get my own complaints (resident - owner/tenant)
 *     tags: [Complaints]
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
 *         description: Resident's own complaints
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Complaint'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       403:
 *         description: Forbidden
 */
router.get('/my', requireRoles('owner', 'tenant'), complaintController.getMyComplaintsHandler);

/**
 * @swagger
 * /api/v1/complaints/{id}:
 *   get:
 *     summary: Get a complaint by ID (admin + owner/tenant)
 *     tags: [Complaints]
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
 *         description: Complaint details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.get('/:id', requireRoles('admin', 'owner', 'tenant'), complaintController.getComplaintByIdHandler);

/**
 * @swagger
 * /api/v1/complaints:
 *   post:
 *     summary: Raise a complaint (resident - owner/tenant only)
 *     tags: [Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateComplaintRequest'
 *     responses:
 *       201:
 *         description: Complaint created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('owner', 'tenant'), validate(createComplaintSchema), complaintController.createComplaintHandler);

/**
 * @swagger
 * /api/v1/complaints/{id}:
 *   put:
 *     summary: Update complaint status or remark (admin only)
 *     tags: [Complaints]
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
 *             $ref: '#/components/schemas/UpdateComplaintRequest'
 *     responses:
 *       200:
 *         description: Complaint updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Complaint'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateComplaintSchema), complaintController.updateComplaintHandler);

export default router;