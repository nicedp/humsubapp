import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBlockSchema, updateBlockSchema } from '../dtos/block.dto';
import * as ctrl from '../controllers/block.controller';

const router = Router();

// All block routes require authentication
router.use(authMiddleware);

// GET /api/v1/blocks — all authenticated users can view blocks
router.get('/', ctrl.listBlocks);
router.get('/:id', ctrl.getBlock);

// Admin-only mutations
router.post('/', requireRoles('admin'), validate(createBlockSchema), ctrl.createBlock);
router.patch('/:id', requireRoles('admin'), validate(updateBlockSchema), ctrl.updateBlock);
router.delete('/:id', requireRoles('admin'), ctrl.deleteBlock);

export default router;