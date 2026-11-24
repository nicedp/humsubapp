import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createParkingSlotSchema, updateParkingSlotSchema } from '../dtos/parking.dto';
import * as parkingController from '../controllers/parking.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Parking
 *   description: Parking slot management (40 slots on ground floor)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/parking:
 *   get:
 *     summary: Get all parking slots (all authenticated users)
 *     tags: [Parking]
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
 *         description: List of parking slots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ParkingSlot'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       401:
 *         description: Unauthorized
 */
router.get('/', parkingController.getAllParkingSlotsHandler);

/**
 * @swagger
 * /api/v1/parking/{id}:
 *   get:
 *     summary: Get a parking slot by ID (all authenticated users)
 *     tags: [Parking]
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
 *         description: Parking slot details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingSlot'
 *       404:
 *         description: Not found
 */
router.get('/:id', parkingController.getParkingSlotByIdHandler);

/**
 * @swagger
 * /api/v1/parking:
 *   post:
 *     summary: Create a parking slot (admin only)
 *     tags: [Parking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateParkingSlotRequest'
 *     responses:
 *       201:
 *         description: Parking slot created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingSlot'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('admin'), validate(createParkingSlotSchema), parkingController.createParkingSlotHandler);

/**
 * @swagger
 * /api/v1/parking/{id}:
 *   put:
 *     summary: Update a parking slot (admin only)
 *     tags: [Parking]
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
 *             $ref: '#/components/schemas/UpdateParkingSlotRequest'
 *     responses:
 *       200:
 *         description: Parking slot updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParkingSlot'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateParkingSlotSchema), parkingController.updateParkingSlotHandler);

/**
 * @swagger
 * /api/v1/parking/{id}:
 *   delete:
 *     summary: Delete a parking slot (admin only)
 *     tags: [Parking]
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
 *         description: Parking slot deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), parkingController.deleteParkingSlotHandler);

export default router;