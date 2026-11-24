import { Request, Response, NextFunction } from 'express';

// All valid roles in the system
export type AppRole = 'admin' | 'sub_admin' | 'member' | 'owner' | 'tenant' | 'security';

/**
 * Factory function that returns middleware requiring one of the specified roles.
 * Usage: router.get('/admin-only', authMiddleware, requireRoles('admin'), handler)
 * Sprint 5: now accepts sub_admin and member roles
 */
export function requireRoles(...roles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role as AppRole)) {
      res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
}