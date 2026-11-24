import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createResidentSchema,
  updateResidentSchema,
  createVehicleSchema,
  updateVehicleSchema,
  updateMyProfileSchema,
  bulkCreateResidentsSchema,
} from '../dtos/resident.dto';
import * as residentController from '../controllers/resident.controller';
import * as familyMemberController from '../controllers/family-member.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Residents
 *   description: Resident management and vehicle sub-resources (admin only)
 */

router.use(authMiddleware);

// ─── Self-service "me" routes — MUST come before /:id ────────────────────────
router.get('/me', requireRoles('owner', 'tenant'), residentController.getMyProfileHandler);
router.patch('/me', requireRoles('owner', 'tenant'), validate(updateMyProfileSchema), residentController.updateMyProfileHandler);
router.get('/me/vehicles', requireRoles('owner', 'tenant'), residentController.getMyVehiclesHandler);

/**
 * @swagger
 * /api/v1/residents:
 *   get:
 *     summary: Get all residents (admin only, paginated)
 *     tags: [Residents]
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
 *         description: List of residents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Resident'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRoles('admin'), residentController.getAllResidentsHandler);

// POST /api/v1/residents/bulk — must be registered BEFORE /:id to avoid conflict
router.post('/bulk', requireRoles('admin'), residentController.bulkCreateResidentsHandler);

/**
 * @swagger
 * /api/v1/residents/{id}:
 *   get:
 *     summary: Get a resident by ID (admin only)
 *     tags: [Residents]
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
 *         description: Resident details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resident'
 *       404:
 *         description: Resident not found
 *       403:
 *         description: Forbidden
 */
// GET /:id/profile — must come BEFORE /:id to avoid 'profile' being treated as an ID
router.get('/:id/profile', requireRoles('admin'), residentController.getResidentProfileHandler);

// POST /:id/change-password — must come BEFORE /:id to avoid conflict
router.post('/:id/change-password', requireRoles('admin'), residentController.adminChangeResidentPasswordHandler);

router.get('/:id', requireRoles('admin'), residentController.getResidentByIdHandler);

/**
 * @swagger
 * /api/v1/residents:
 *   post:
 *     summary: Create a new resident (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateResidentRequest'
 *     responses:
 *       201:
 *         description: Resident created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resident'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('admin'), validate(createResidentSchema), residentController.createResidentHandler);

/**
 * @swagger
 * /api/v1/residents/{id}:
 *   put:
 *     summary: Update a resident (admin only)
 *     tags: [Residents]
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
 *             $ref: '#/components/schemas/UpdateResidentRequest'
 *     responses:
 *       200:
 *         description: Resident updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resident'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateResidentSchema), residentController.updateResidentHandler);

/**
 * @swagger
 * /api/v1/residents/{id}:
 *   delete:
 *     summary: Delete a resident (admin only)
 *     tags: [Residents]
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
 *         description: Resident deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), residentController.deleteResidentHandler);

// ─── Vehicle Sub-routes (/api/v1/residents/:residentId/vehicles) ──────────────

/**
 * @swagger
 * /api/v1/residents/{residentId}/vehicles:
 *   get:
 *     summary: Get all vehicles for a resident (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of vehicles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehicle'
 *       403:
 *         description: Forbidden
 */
router.get('/:residentId/vehicles', requireRoles('admin'), residentController.getVehiclesByResidentHandler);

/**
 * @swagger
 * /api/v1/residents/{residentId}/vehicles/{vehicleId}:
 *   get:
 *     summary: Get a specific vehicle by ID (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Not found
 */
router.get('/:residentId/vehicles/:vehicleId', requireRoles('admin'), residentController.getVehicleByIdHandler);

/**
 * @swagger
 * /api/v1/residents/{residentId}/vehicles:
 *   post:
 *     summary: Add a vehicle for a resident (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVehicleRequest'
 *     responses:
 *       201:
 *         description: Vehicle added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post(
  '/:residentId/vehicles',
  requireRoles('admin'),
  validate(createVehicleSchema),
  residentController.addVehicleHandler,
);

/**
 * @swagger
 * /api/v1/residents/{residentId}/vehicles/{vehicleId}:
 *   put:
 *     summary: Update a vehicle (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVehicleRequest'
 *     responses:
 *       200:
 *         description: Vehicle updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehicle'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put(
  '/:residentId/vehicles/:vehicleId',
  requireRoles('admin'),
  validate(updateVehicleSchema),
  residentController.updateVehicleHandler,
);

/**
 * @swagger
 * /api/v1/residents/{residentId}/vehicles/{vehicleId}:
 *   delete:
 *     summary: Delete a vehicle (admin only)
 *     tags: [Residents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: residentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vehicle deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete(
  '/:residentId/vehicles/:vehicleId',
  requireRoles('admin'),
  residentController.deleteVehicleHandler,
);

// ─── Family Member Sub-routes (/api/v1/residents/:residentId/family) ──────────

router.get('/:residentId/family', requireRoles('admin'), familyMemberController.listFamilyMembersHandler);
router.post('/:residentId/family', requireRoles('admin'), familyMemberController.createFamilyMemberHandler);
router.patch('/:residentId/family/:memberId', requireRoles('admin'), familyMemberController.updateFamilyMemberHandler);
router.delete('/:residentId/family/:memberId', requireRoles('admin'), familyMemberController.deleteFamilyMemberHandler);

export default router;