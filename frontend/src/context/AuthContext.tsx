import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AuthUser } from '../types'
import type { PermissionModule, PermissionAction, PermissionEntry } from '../api/acl'

// Flat permission lookup: { [module]: { canView, canCreate, ... } }
export type PermissionsMap = Partial<Record<PermissionModule, Record<PermissionAction, boolean>>>

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isSubAdmin: boolean
  isMember: boolean
  isAdminPanelUser: boolean  // admin | sub_admin | member
  isResident: boolean
  isGuard: boolean
  permissions: PermissionsMap
  login: (token: string, user: AuthUser, rememberMe?: boolean) => void
  logout: () => void
  setPermissions: (map: PermissionsMap) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function buildPermissionsMap(entries: PermissionEntry[]): PermissionsMap {
  const map: PermissionsMap = {}
  for (const e of entries) {
    map[e.module] = {
      canView: e.canView,
      canCreate: e.canCreate,
      canEdit: e.canEdit,
      canDelete: e.canDelete,
      canExport: e.canExport,
    }
  }
  return map
}

// Persist permissions to storage alongside user
function loadPermissionsFromStorage(): PermissionsMap {
  const raw = localStorage.getItem('permissions') ?? sessionStorage.getItem('permissions')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token') ?? sessionStorage.getItem('token')
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored =
      localStorage.getItem('user') ?? sessionStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [permissions, setPermissionsState] = useState<PermissionsMap>(
    () => loadPermissionsFromStorage()
  )

  const login = (newToken: string, newUser: AuthUser, rememberMe = false) => {
    setToken(newToken)
    setUser(newUser)
    // Clear both storages first so there's never a stale copy in the other one
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('permissions')

    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('token', newToken)
    storage.setItem('user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setPermissionsState({})
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('permissions')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('permissions')
  }

  const setPermissions = (map: PermissionsMap) => {
    setPermissionsState(map)
    // Persist so permissions survive a page refresh
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage
    storage.setItem('permissions', JSON.stringify(map))
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === 'admin'
  const isSubAdmin = user?.role === 'sub_admin'
  const isMember = user?.role === 'member'
  const isAdminPanelUser = isAdmin || isSubAdmin || isMember
  const isResident = user?.role === 'owner' || user?.role === 'tenant'
  const isGuard = user?.role === 'security'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isAdmin,
      isSubAdmin,
      isMember,
      isAdminPanelUser,
      isResident,
      isGuard,
      permissions,
      login,
      logout,
      setPermissions,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

// Export helpers for external use
export { buildPermissionsMap }