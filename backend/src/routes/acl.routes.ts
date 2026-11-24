import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { getPermissionsHandler, updatePermissionsHandler } from '../controllers/acl.controller';

const router = Router();

// All ACL routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/acl/permissions
 * Returns the full ACL matrix for the current society.
 * Accessible by admin, sub_admin, and member (they need to know their own permissions).
 */
router.get(
  '/permissions',
  requireRoles('admin', 'sub_admin', 'member'),
  getPermissionsHandler
);

/**
 * PATCH /api/v1/acl/permissions
 * Update permissions for a specific role. Admin only.
 */
router.patch(
  '/permissions',
  requireRoles('admin'),
  updatePermissionsHandler
);

export default router;