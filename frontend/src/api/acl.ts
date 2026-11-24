import api from './axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export const PERMISSION_MODULES = [
  'billing', 'residents', 'flats', 'visitors', 'notices', 'complaints',
  'staff', 'assets', 'parking', 'expenses', 'income', 'invoices',
  'events', 'vendors', 'committee', 'helpers', 'settings', 'users', 'reports',
] as const

export type PermissionModule = typeof PERMISSION_MODULES[number]
export type AclRole = 'sub_admin' | 'member'

export type PermissionAction = 'canView' | 'canCreate' | 'canEdit' | 'canDelete' | 'canExport'

export interface PermissionEntry {
  module: PermissionModule
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
}

export interface AclMatrix {
  sub_admin: PermissionEntry[]
  member: PermissionEntry[]
}

export interface UpdatePermissionsPayload {
  role: AclRole
  permissions: PermissionEntry[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert an array of PermissionEntry to a quick-lookup map */
export function toPermissionMap(
  entries: PermissionEntry[]
): Record<PermissionModule, PermissionEntry> {
  const map = {} as Record<PermissionModule, PermissionEntry>
  for (const entry of entries) {
    map[entry.module] = entry
  }
  return map
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const aclApi = {
  /** GET /acl/permissions — returns the full ACL matrix for the current society */
  getPermissions: async (): Promise<AclMatrix> => {
    const res = await api.get('/acl/permissions')
    return res.data
  },

  /** PATCH /acl/permissions — update permissions for a role */
  updatePermissions: async (payload: UpdatePermissionsPayload): Promise<AclMatrix> => {
    const res = await api.patch('/acl/permissions', payload)
    return res.data
  },
}