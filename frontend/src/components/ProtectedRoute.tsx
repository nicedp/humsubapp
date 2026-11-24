import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth, buildPermissionsMap } from '../context/AuthContext'
import { aclApi } from '../api/acl'
import type { AppRole } from '../types'

interface ProtectedRouteProps {
  allowedRoles: AppRole[]
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, setPermissions, permissions } = useAuth()
  const [aclLoaded, setAclLoaded] = useState(false)
  const [aclError, setAclError] = useState(false)

  const needsAcl = user?.role === 'sub_admin' || user?.role === 'member'

  useEffect(() => {
    if (!needsAcl) {
      setAclLoaded(true)
      return
    }
    // If permissions are already loaded (e.g. from storage) skip fetch
    if (Object.keys(permissions).length > 0) {
      setAclLoaded(true)
      return
    }
    // Load ACL from backend
    aclApi.getPermissions().then((matrix) => {
      const roleKey = user!.role as 'sub_admin' | 'member'
      const map = buildPermissionsMap(matrix[roleKey] ?? [])
      setPermissions(map)
      setAclLoaded(true)
    }).catch(() => {
      // Non-fatal — proceed with empty permissions
      setAclError(true)
      setAclLoaded(true)
    })
  }, [user?.role]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to appropriate home based on role
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'sub_admin' || user?.role === 'member') return <Navigate to="/admin/dashboard" replace />
    if (user?.role === 'owner' || user?.role === 'tenant') return <Navigate to="/resident/dashboard" replace />
    if (user?.role === 'security') return <Navigate to="/guard/visitor-entry" replace />
    return <Navigate to="/login" replace />
  }

  // Wait for ACL to load before rendering admin panel for sub_admin/member
  if (needsAcl && !aclLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading permissions...</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}