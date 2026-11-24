import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAssetSchema, updateAssetSchema } from '../dtos/asset.dto';
import * as assetController from '../controllers/asset.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Assets
 *   description: Society asset management (generators, lifts, pumps, etc.)
 */

router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get all assets (all authenticated users)
 *     tags: [Assets]
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
 *         description: List of assets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *                 meta:
 *                   $ref: '#/components/schemas/PaginatedMeta'
 *       401:
 *         description: Unauthorized
 */
router.get('/', assetController.getAllAssetsHandler);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   get:
 *     summary: Get an asset by ID (all authenticated users)
 *     tags: [Assets]
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
 *         description: Asset details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 */
router.get('/:id', assetController.getAssetByIdHandler);

/**
 * @swagger
 * /api/v1/assets:
 *   post:
 *     summary: Create an asset (admin only)
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssetRequest'
 *     responses:
 *       201:
 *         description: Asset created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 */
router.post('/', requireRoles('admin'), validate(createAssetSchema), assetController.createAssetHandler);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   put:
 *     summary: Update an asset (admin only)
 *     tags: [Assets]
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
 *             $ref: '#/components/schemas/UpdateAssetRequest'
 *     responses:
 *       200:
 *         description: Asset updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.put('/:id', requireRoles('admin'), validate(updateAssetSchema), assetController.updateAssetHandler);

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   delete:
 *     summary: Delete an asset (admin only)
 *     tags: [Assets]
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
 *         description: Asset deleted
 *       404:
 *         description: Not found
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', requireRoles('admin'), assetController.deleteAssetHandler);

export default router;