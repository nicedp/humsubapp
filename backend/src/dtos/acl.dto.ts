import { z } from 'zod';

// All 19 permission modules
export const PERMISSION_MODULES = [
  'billing', 'residents', 'flats', 'visitors', 'notices', 'complaints',
  'staff', 'assets', 'parking', 'expenses', 'income', 'invoices',
  'events', 'vendors', 'committee', 'helpers', 'settings', 'users', 'reports',
] as const;

export type PermissionModuleType = typeof PERMISSION_MODULES[number];

// The roles that can have ACL permissions configured
export const ACL_ROLES = ['sub_admin', 'member'] as const;
export type AclRole = typeof ACL_ROLES[number];

// Shape of a single permission row
const permissionRowSchema = z.object({
  module: z.enum(PERMISSION_MODULES),
  canView: z.boolean().default(false),
  canCreate: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  canExport: z.boolean().default(false),
});

// PATCH /acl/permissions — update ACL matrix for a role
export const updatePermissionsSchema = z.object({
  role: z.enum(ACL_ROLES),
  permissions: z.array(permissionRowSchema).min(1).max(19),
});

export type UpdatePermissionsDto = z.infer<typeof updatePermissionsSchema>;
export type PermissionRowDto = z.infer<typeof permissionRowSchema>;

// Shape returned to the frontend for a single permission entry
export interface PermissionEntry {
  module: PermissionModuleType;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// Full ACL matrix shape for a society
export interface AclMatrix {
  sub_admin: PermissionEntry[];
  member: PermissionEntry[];
}