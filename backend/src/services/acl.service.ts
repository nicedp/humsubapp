import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import {
  PERMISSION_MODULES,
  ACL_ROLES,
  AclRole,
  PermissionModuleType,
  PermissionEntry,
  AclMatrix,
  UpdatePermissionsDto,
} from '../dtos/acl.dto';

// ─── In-memory Cache ──────────────────────────────────────────────────────────
// Map key: `${societyId}_${role}` → permission map
const cache = new Map<string, Record<PermissionModuleType, PermissionEntry>>();

function cacheKey(societyId: number, role: AclRole): string {
  return `${societyId}_${role}`;
}

function invalidateCache(societyId: number, role: AclRole): void {
  cache.delete(cacheKey(societyId, role));
}

// ─── Default (all-false) permission entry ────────────────────────────────────
function defaultEntry(module: PermissionModuleType): PermissionEntry {
  return { module, canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false };
}

// ─── Load from DB + populate cache ───────────────────────────────────────────
async function loadRolePermissions(
  societyId: number,
  role: AclRole
): Promise<Record<PermissionModuleType, PermissionEntry>> {
  const rows = await (prisma as any).rolePermission.findMany({
    where: { societyId, role },
  });

  // Build a full map (all modules present — missing modules default to all-false)
  const map = {} as Record<PermissionModuleType, PermissionEntry>;
  for (const mod of PERMISSION_MODULES) {
    map[mod] = defaultEntry(mod);
  }
  for (const row of rows) {
    const mod = row.module as PermissionModuleType;
    map[mod] = {
      module: mod,
      canView: row.canView,
      canCreate: row.canCreate,
      canEdit: row.canEdit,
      canDelete: row.canDelete,
      canExport: row.canExport,
    };
  }
  cache.set(cacheKey(societyId, role), map);
  return map;
}

// ─── Public: checkPermission ──────────────────────────────────────────────────
/**
 * Returns true when the given role has the requested permission on a module.
 * admin always returns true (caller must short-circuit before calling this).
 */
export async function checkPermission(
  societyId: number,
  role: string,
  module: PermissionModuleType,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport'
): Promise<boolean> {
  if (role === 'admin') return true;
  if (!ACL_ROLES.includes(role as AclRole)) return false;

  const key = cacheKey(societyId, role as AclRole);
  let map = cache.get(key);
  if (!map) {
    map = await loadRolePermissions(societyId, role as AclRole);
  }
  return map[module]?.[action] ?? false;
}

// ─── Public: getRolePermissions ───────────────────────────────────────────────
/**
 * Get the full ACL matrix for a society (both roles).
 */
export async function getRolePermissions(societyId: number): Promise<AclMatrix> {
  const [subAdminMap, memberMap] = await Promise.all([
    (() => {
      const cached = cache.get(cacheKey(societyId, 'sub_admin'));
      return cached ? Promise.resolve(cached) : loadRolePermissions(societyId, 'sub_admin');
    })(),
    (() => {
      const cached = cache.get(cacheKey(societyId, 'member'));
      return cached ? Promise.resolve(cached) : loadRolePermissions(societyId, 'member');
    })(),
  ]);

  return {
    sub_admin: Object.values(subAdminMap),
    member: Object.values(memberMap),
  };
}

// ─── Public: updateRolePermissions ───────────────────────────────────────────
/**
 * Upsert permission rows for a role. Invalidates cache after update.
 */
export async function updateRolePermissions(
  societyId: number,
  dto: UpdatePermissionsDto,
  updatedBy: string
): Promise<AclMatrix> {
  const role = dto.role;

  // Build a map of submitted modules so we can upsert efficiently
  const submitted = new Map(dto.permissions.map((p) => [p.module, p]));

  // Ensure ALL modules are present in DB (upsert each)
  await Promise.all(
    PERMISSION_MODULES.map(async (mod) => {
      const perm = submitted.get(mod) ?? defaultEntry(mod);
      const existing = await (prisma as any).rolePermission.findUnique({
        where: { societyId_role_module: { societyId, role, module: mod } },
      });
      if (existing) {
        await (prisma as any).rolePermission.update({
          where: { societyId_role_module: { societyId, role, module: mod } },
          data: {
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canExport: perm.canExport,
            updatedBy,
          },
        });
      } else {
        await (prisma as any).rolePermission.create({
          data: {
            societyId,
            role,
            module: mod,
            canView: perm.canView,
            canCreate: perm.canCreate,
            canEdit: perm.canEdit,
            canDelete: perm.canDelete,
            canExport: perm.canExport,
            updatedBy,
          },
        });
      }
    })
  );

  // Invalidate cache for this role so next read reloads from DB
  invalidateCache(societyId, role);

  return getRolePermissions(societyId);
}

// ─── Public: ensureDefaultPermissions ────────────────────────────────────────
/**
 * Seed default permission rows for a new society (called by registerSociety).
 * Does NOT overwrite existing rows (upsert with DO NOTHING semantics).
 */
export async function ensureDefaultPermissions(societyId: number): Promise<void> {
  const defaults: Array<{
    role: AclRole;
    module: PermissionModuleType;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  }> = [
    // sub_admin
    { role: 'sub_admin', module: 'billing',    canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canExport: true },
    { role: 'sub_admin', module: 'residents',  canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canExport: true },
    { role: 'sub_admin', module: 'flats',      canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'visitors',   canView: true,  canCreate: true,  canEdit: false, canDelete: false, canExport: true },
    { role: 'sub_admin', module: 'notices',    canView: true,  canCreate: true,  canEdit: true,  canDelete: true,  canExport: false },
    { role: 'sub_admin', module: 'complaints', canView: true,  canCreate: false, canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'staff',      canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'assets',     canView: true,  canCreate: false, canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'parking',    canView: true,  canCreate: false, canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'expenses',   canView: true,  canCreate: true,  canEdit: false, canDelete: false, canExport: true },
    { role: 'sub_admin', module: 'income',     canView: true,  canCreate: true,  canEdit: false, canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'invoices',   canView: true,  canCreate: true,  canEdit: false, canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'events',     canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'vendors',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'committee',  canView: true,  canCreate: false, canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'helpers',    canView: true,  canCreate: true,  canEdit: true,  canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'reports',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: true },
    { role: 'sub_admin', module: 'settings',   canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'sub_admin', module: 'users',      canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    // member
    { role: 'member', module: 'billing',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'residents',  canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'flats',      canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'visitors',   canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'notices',    canView: true,  canCreate: true,  canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'complaints', canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'staff',      canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'assets',     canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'parking',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'expenses',   canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'income',     canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'invoices',   canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'events',     canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'vendors',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'committee',  canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'helpers',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'reports',    canView: true,  canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'settings',   canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
    { role: 'member', module: 'users',      canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false },
  ];

  for (const d of defaults) {
    const existing = await (prisma as any).rolePermission.findUnique({
      where: { societyId_role_module: { societyId, role: d.role, module: d.module } },
    });
    if (!existing) {
      await (prisma as any).rolePermission.create({
        data: { societyId, ...d },
      });
    }
  }
}