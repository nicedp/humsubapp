import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { getAlertSummaryHandler } from '../controllers/alert.controller';

const router = Router();

router.use(authMiddleware);

/**
 * GET /api/v1/alerts/summary
 * Returns a structured alert summary for admin/sub_admin/member.
 * Includes: overdue/due-soon assets, AMC service alerts, expiring contracts,
 * overdue bills count, open complaints count, unread resident messages.
 */
router.get(
  '/summary',
  requireRoles('admin', 'sub_admin', 'member'),
  getAlertSummaryHandler,
);

export default router;