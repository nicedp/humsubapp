import { Request, Response, NextFunction } from 'express';
import { updatePermissionsSchema } from '../dtos/acl.dto';
import * as aclService from '../services/acl.service';
import { getSocietyId } from '../helpers/society.helper';

/** GET /api/v1/acl/permissions — get full ACL matrix for the current society */
export async function getPermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = getSocietyId(req);
    const matrix = await aclService.getRolePermissions(societyId);
    res.json(matrix);
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/v1/acl/permissions — update permissions for a role (admin only) */
export async function updatePermissionsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updatePermissionsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
      return;
    }
    const societyId = getSocietyId(req);
    const updatedBy = req.user!.userId;
    const matrix = await aclService.updateRolePermissions(societyId, parsed.data, updatedBy);
    res.json(matrix);
  } catch (err) {
    next(err);
  }
}