import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { generateBillsSchema, recordPaymentSchema, createSingleBillSchema, createBulkSingleBillsSchema, updateBillSchema, quickPaySchema } from '../dtos/billing.dto';
import * as billingController from '../controllers/billing.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Maintenance billing and payment management
 */

router.use(authMiddleware);

// ─────────────────────────────────────────────
// STATIC ROUTES — must come before /:id param routes
// ─────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/billing/generate:
 *   post:
 *     summary: Bulk generate monthly maintenance bills (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateBillsRequest'
 *     responses:
 *       201:
 *         description: Bills generated successfully
 *       400:
 *         description: Validation error or bills already exist for this month
 *       403:
 *         description: Forbidden
 */
router.post('/generate', requireRoles('admin'), validate(generateBillsSchema), billingController.generateBillsHandler);

/**
 * @swagger
 * /api/v1/billing/overdue:
 *   post:
 *     summary: Mark unpaid bills past due date as overdue (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overdue bills updated
 *       403:
 *         description: Forbidden
 */
router.post('/overdue', requireRoles('admin'), billingController.updateOverdueBillsHandler);

/**
 * @swagger
 * /api/v1/billing/single:
 *   post:
 *     summary: Create a bill for a single flat (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [flatId, month, year, dueDate]
 *             properties:
 *               flatId:
 *                 type: string
 *               month:
 *                 type: integer
 *               year:
 *                 type: integer
 *               dueDate:
 *                 type: string
 *                 example: "2026-06-15"
 *               amount:
 *                 type: number
 *                 description: Optional override; auto-calculated if omitted
 *     responses:
 *       201:
 *         description: Bill created
 *       409:
 *         description: Bill already exists for this flat/month/year
 */
router.post('/single', requireRoles('admin'), validate(createSingleBillSchema), billingController.createSingleBillHandler);
router.post('/bulk-single', requireRoles('admin'), validate(createBulkSingleBillsSchema), billingController.createBulkSingleBillsHandler);
router.post('/quick-pay', requireRoles('admin'), validate(quickPaySchema), billingController.quickPayHandler);

/**
 * @swagger
 * /api/v1/billing:
 *   get:
 *     summary: Get all bills with optional filters (admin only)
 *     tags: [Billing]
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
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unpaid, paid, overdue]
 *       - in: query
 *         name: flatId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bills
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRoles('admin'), billingController.getBillsHandler);

/**
 * @swagger
 * /api/v1/billing/my:
 *   get:
 *     summary: Get own bills (resident - owner/tenant only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resident's own bills
 *       403:
 *         description: Forbidden
 */
router.get('/my', requireRoles('owner', 'tenant'), billingController.getMyBillsHandler);

/**
 * @swagger
 * /api/v1/billing/summary:
 *   get:
 *     summary: Get billing KPI summary for a month/year (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Billing summary aggregates
 */
router.get('/summary', requireRoles('admin'), billingController.getBillingSummaryHandler);

/**
 * @swagger
 * /api/v1/billing/floor-status:
 *   get:
 *     summary: Get per-flat billing status for floor grid view (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of flat billing statuses
 */
router.get('/floor-status', requireRoles('admin'), billingController.getFloorStatusHandler);

/**
 * @swagger
 * /api/v1/billing/defaulters:
 *   get:
 *     summary: Get list of defaulters (2+ consecutive unpaid months) (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of defaulter summaries sorted by worst first
 */
router.get('/defaulters', requireRoles('admin'), billingController.getDefaultersHandler);
router.get('/monthly-trend', requireRoles('admin'), billingController.getMonthlyTrendHandler);

/**
 * @swagger
 * /api/v1/billing/flat/{flatId}:
 *   get:
 *     summary: Get full billing history for a flat (admin only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: flatId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Flat billing history with cumulative totals
 *       404:
 *         description: Flat not found
 */
router.get('/flat/:flatId', requireRoles('admin'), billingController.getFlatBillingHistoryHandler);

// ─────────────────────────────────────────────
// PARAM ROUTES — /:id must come after all static routes
// ─────────────────────────────────────────────

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   get:
 *     summary: Get a bill by ID (admin only)
 *     tags: [Billing]
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
 *         description: Bill details
 *       404:
 *         description: Bill not found
 *       403:
 *         description: Forbidden
 */
router.get('/:id', requireRoles('admin'), billingController.getBillByIdHandler);

/**
 * @swagger
 * /api/v1/billing/{id}/payment:
 *   post:
 *     summary: Record a payment for a bill (admin only)
 *     tags: [Billing]
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
 *             $ref: '#/components/schemas/RecordPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment recorded, bill marked as paid
 *       400:
 *         description: Bill already paid or validation error
 *       404:
 *         description: Bill not found
 *       403:
 *         description: Forbidden
 */
router.post('/:id/payment', requireRoles('admin'), validate(recordPaymentSchema), billingController.recordPaymentHandler);

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   put:
 *     summary: Update a bill's due date or amount (admin only, unpaid/overdue only)
 *     tags: [Billing]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dueDate:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated bill
 *       400:
 *         description: Cannot edit a paid bill
 */
router.put('/:id', requireRoles('admin'), validate(updateBillSchema), billingController.updateBillHandler);

/**
 * @swagger
 * /api/v1/billing/{id}:
 *   delete:
 *     summary: Delete an unpaid bill (admin only)
 *     tags: [Billing]
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
 *         description: Bill deleted
 *       400:
 *         description: Only unpaid bills can be deleted
 */
router.delete('/:id', requireRoles('admin'), billingController.deleteBillHandler);

export default router;