import { Request, Response, NextFunction } from 'express';
import { checkPermission } from '../services/acl.service';
import { PermissionModuleType } from '../dtos/acl.dto';

/**
 * Factory that returns Express middleware requiring a specific module permission.
 *
 * Usage:
 *   router.get('/billing', authMiddleware, requirePermission('billing', 'canView'), handler)
 *
 * Rules:
 *  - 'admin' role ALWAYS passes (no DB lookup)
 *  - 'sub_admin' and 'member' are checked against the DB-cached ACL matrix
 *  - All other roles (owner, tenant, security) are rejected with 403
 */
export function requirePermission(
  module: PermissionModuleType,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport'
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { role, societyId } = req.user;

    // Admin always has full access — skip DB lookup
    if (role === 'admin') {
      next();
      return;
    }

    // Only sub_admin and member have configurable permissions
    if (role !== 'sub_admin' && role !== 'member') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const allowed = await checkPermission(societyId, role, module, action);
    if (!allowed) {
      res.status(403).json({
        message: `You don't have ${action} permission on ${module}`,
      });
      return;
    }

    next();
  };
}