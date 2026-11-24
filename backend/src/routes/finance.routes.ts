import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { getFinanceSummary, getMonthlyReportHandler } from '../controllers/finance.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

// GET /api/v1/finance/summary?months=12
router.get('/summary', getFinanceSummary);
// GET /api/v1/finance/monthly-report?month=M&year=Y
router.get('/monthly-report', getMonthlyReportHandler);

export default router;