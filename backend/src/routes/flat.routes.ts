import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createFlatSchema, updateFlatSchema, bulkCreateFlatsSchema } from '../dtos/flat.dto';
import * as flatController from '../controllers/flat.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Flats
 *   description: Flat management (50 residential flats across floors 1-5)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/flats:
 *   get:
 *     summary: Get all flats (paginated)
 *     tags: [Flats]
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
 *         description: List of flats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Flat'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       401:
 *         description: Unauthorized
 */
router.get('/', flatController.getAllFlatsHandler);

/**
 * @swagger
 * /api/v1/flats/{id}:
 *   get:
 *     summary: Get a flat by ID
 *     tags: [Flats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: F1-01
 *     responses:
 *       200:
 *         description: Flat details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flat'
 *       404:
 *         description: Flat not found
 */
router.get('/:id', flatController.getFlatByIdHandler);

/**
 * @swagger
 * /api/v1/flats:
 *   post:
 *     summary: Create a new flat (admin only)
 *     tags: [Flats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFlatRequest'
 *     responses:
 *       201:
 *         description: Flat created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flat'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
// Bulk create must come BEFORE /:id routes
router.post('/bulk', requireRoles('admin'), validate(bulkCreateFlatsSchema), flatController.bulkCreateFlatsHandler);
router.post('/', requireRoles('admin'), validate(createFlatSchema), flatController.createFlatHandler);

/**
 * @swagger
 * /api/v1/flats/{id}:
 *   put:
 *     summary: Update a flat (admin only)
 *     tags: [Flats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: F1-01
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFlatRequest'
 *     responses:
 *       200:
 *         description: Flat updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Flat'
 *       404:
 *         description: Flat not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateFlatSchema), flatController.updateFlatHandler);
router.patch('/:id', requireRoles('admin'), validate(updateFlatSchema), flatController.updateFlatHandler);

/**
 * @swagger
 * /api/v1/flats/{id}:
 *   delete:
 *     summary: Delete a flat (admin only)
 *     tags: [Flats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: F1-01
 *     responses:
 *       200:
 *         description: Flat deleted
 *       404:
 *         description: Flat not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), flatController.deleteFlatHandler);

export default router;