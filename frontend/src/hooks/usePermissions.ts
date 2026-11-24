import { useAuth } from '../context/AuthContext'
import type { PermissionModule, PermissionAction } from '../api/acl'

/**
 * Hook to check if the current user has a specific permission.
 *
 * - 'admin' always returns true (no lookup needed)
 * - 'sub_admin' and 'member' check the permissions loaded into AuthContext
 * - All other roles return false for admin-panel permissions
 *
 * Usage:
 *   const { hasPermission, isAdminOrSubAdmin } = usePermissions()
 *   if (hasPermission('billing', 'canView')) { ... }
 */
export function usePermissions() {
  const { user, permissions } = useAuth()

  const hasPermission = (module: PermissionModule, action: PermissionAction): boolean => {
    if (!user) return false
    // Admin always has full access
    if (user.role === 'admin') return true
    // Non-panel roles never have admin panel permissions
    if (user.role === 'owner' || user.role === 'tenant' || user.role === 'security') return false
    // sub_admin / member — check loaded permissions
    return permissions?.[module]?.[action] ?? false
  }

  const canView = (module: PermissionModule) => hasPermission(module, 'canView')
  const canCreate = (module: PermissionModule) => hasPermission(module, 'canCreate')
  const canEdit = (module: PermissionModule) => hasPermission(module, 'canEdit')
  const canDelete = (module: PermissionModule) => hasPermission(module, 'canDelete')
  const canExport = (module: PermissionModule) => hasPermission(module, 'canExport')

  const isAdminOrSubAdmin = user?.role === 'admin' || user?.role === 'sub_admin'
  const isAdminPanelUser = user?.role === 'admin' || user?.role === 'sub_admin' || user?.role === 'member'

  return {
    hasPermission,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    isAdminOrSubAdmin,
    isAdminPanelUser,
  }
}