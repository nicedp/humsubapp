import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { logVisitorEntrySchema, logVisitorExitSchema } from '../dtos/visitor.dto';
import * as visitorController from '../controllers/visitor.controller';

const router = Router();

router.use(authMiddleware);

// ─── Guard / Security routes ────────────────────────────────────────────────

/**
 * POST /api/v1/visitors/entry
 * Log a visitor entry (security/admin)
 */
router.post(
  '/entry',
  requireRoles('security', 'admin'),
  validate(logVisitorEntrySchema),
  visitorController.logEntryHandler,
);

/**
 * GET /api/v1/visitors/today
 * Get today's visitors (security/admin)
 */
router.get(
  '/today',
  requireRoles('security', 'admin'),
  visitorController.getTodaysVisitorsHandler,
);

// ─── Resident routes ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/visitors/my
 * Get visitors for my flat (owner/tenant only)
 */
router.get(
  '/my',
  requireRoles('owner', 'tenant'),
  visitorController.getMyVisitorsHandler,
);

// ─── Admin routes ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/visitors/stats
 * Get visitor counts grouped by type (admin only)
 * Query: dateFrom, dateTo
 */
router.get(
  '/stats',
  requireRoles('admin'),
  visitorController.getVisitorStatsHandler,
);

/**
 * GET /api/v1/visitors/export
 * Export visitors as CSV with active filters (admin only)
 * Query: flatId, visitorType, dateFrom, dateTo, hasExit, search
 */
router.get(
  '/export',
  requireRoles('admin'),
  visitorController.exportVisitorsHandler,
);

/**
 * GET /api/v1/visitors
 * Get all visitors with filters (admin only)
 * Query: flatId, visitorType, dateFrom, dateTo, hasExit, search, skip, limit
 */
router.get(
  '/',
  requireRoles('admin'),
  visitorController.getVisitorsHandler,
);

/**
 * GET /api/v1/visitors/:id
 * Get a visitor by ID (admin/security)
 */
router.get(
  '/:id',
  requireRoles('admin', 'security'),
  visitorController.getVisitorByIdHandler,
);

/**
 * PUT /api/v1/visitors/:id/exit
 * Log visitor exit time (security/admin)
 */
router.put(
  '/:id/exit',
  requireRoles('security', 'admin'),
  validate(logVisitorExitSchema),
  visitorController.logExitHandler,
);

export default router;