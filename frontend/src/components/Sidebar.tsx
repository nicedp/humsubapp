import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermissions } from '../hooks/usePermissions'
import type { PermissionModule } from '../api/acl'

interface NavItem {
  to: string
  label: string
  icon: string
  module?: PermissionModule  // if set, item is hidden when user lacks canView for this module
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const adminNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠' },
      { to: '/admin/alerts',    label: 'Alerts',    icon: '🔔' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/admin/billing',           label: 'Billing',         icon: '💰', module: 'billing' },
      { to: '/admin/expenses',          label: 'Expenses',        icon: '💸', module: 'expenses' },
      { to: '/admin/income',            label: 'Other Income',    icon: '💵', module: 'income' },
      { to: '/admin/invoices',          label: 'Invoices',        icon: '🧾', module: 'invoices' },
      { to: '/admin/finance',           label: 'Finance Ledger',  icon: '📊', module: 'billing' },
      { to: '/admin/monthly-report',    label: 'Monthly Report',  icon: '🖨️', module: 'reports' },
      { to: '/admin/expense-analytics', label: 'Analytics',       icon: '📈', module: 'reports' },
    ],
  },
  {
    title: 'Community',
    items: [
      { to: '/admin/residents',  label: 'Residents',  icon: '👥', module: 'residents' },
      { to: '/admin/properties', label: 'Properties', icon: '🏘️', module: 'flats' },
      { to: '/admin/visitors',   label: 'Visitors',   icon: '🚶', module: 'visitors' },
      { to: '/admin/notices',    label: 'Notices',    icon: '📢', module: 'notices' },
      { to: '/admin/complaints', label: 'Complaints', icon: '📝', module: 'complaints' },
      { to: '/admin/events',     label: 'Events',     icon: '🎉', module: 'events' },
      { to: '/admin/committee',  label: 'Committee',  icon: '🏛️', module: 'committee' },
    ],
  },
  {
    title: 'Management',
    items: [
      { to: '/admin/parking', label: 'Parking',     icon: '🚗', module: 'parking' },
      { to: '/admin/assets',  label: 'Assets',      icon: '🔧', module: 'assets' },
      { to: '/admin/helpers', label: 'Helpers',     icon: '🛠️', module: 'helpers' },
      { to: '/admin/staff',   label: 'Staff',       icon: '👷', module: 'staff' },
      { to: '/admin/vendors', label: 'Vendors & AMC', icon: '🔩', module: 'vendors' },
    ],
  },
  {
    title: 'System',
    items: [
      { to: '/admin/users',        label: 'Users',          icon: '🔑', module: 'users' },
      { to: '/admin/settings',     label: 'Settings',       icon: '⚙️', module: 'settings' },
      { to: '/admin/acl-settings', label: 'Access Control', icon: '🛡️' },  // admin-only, no module guard needed
      { to: '/admin/notes',        label: 'Notes',          icon: '📝' },
    ],
  },
]

const residentNavGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { to: '/resident/dashboard',     label: 'Dashboard',     icon: '🏠' },
      { to: '/resident/notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { to: '/resident/bills', label: 'My Bills', icon: '💰' },
      { to: '/resident/pay',   label: 'Pay Now',  icon: '💳' },
    ],
  },
  {
    title: 'Community',
    items: [
      { to: '/resident/notices',    label: 'Notices',    icon: '📢' },
      { to: '/resident/complaints', label: 'Complaints', icon: '📝' },
      { to: '/resident/directory',  label: 'Directory',  icon: '📋' },
      { to: '/resident/visitors',   label: 'Visitors',   icon: '🚶' },
      { to: '/resident/helpers',    label: 'Helpers',    icon: '🛠️' },
      { to: '/resident/committee',  label: 'Committee',  icon: '🏛️' },
    ],
  },
  {
    title: 'My Account',
    items: [
      { to: '/resident/profile',           label: 'My Profile', icon: '👤' },
      { to: '/resident/security-settings', label: 'Security',   icon: '🔒' },
      { to: '/resident/notes',             label: 'Notes',      icon: '📝' },
    ],
  },
]

const guardNavGroups: NavGroup[] = [
  {
    title: 'Gate',
    items: [
      { to: '/guard/visitor-entry', label: 'Visitor Entry', icon: '🚶' },
      { to: '/guard/dashboard',     label: 'Dashboard',     icon: '🏠' },
      { to: '/guard/notes',         label: 'Notes',         icon: '📝' },
    ],
  },
]

// Shared nav link class builder
const linkClass = (isActive: boolean) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
  }`

interface SidebarContentProps {
  groups: NavGroup[]
  userRole: string
  username?: string
  onNavClick?: () => void
}

function SidebarContent({ groups, userRole, username, onNavClick }: SidebarContentProps) {
  const { canView } = usePermissions()
  const isAdminPanel = userRole === 'admin' || userRole === 'sub_admin' || userRole === 'member'

  const roleLabel: Record<string, string> = {
    admin: 'Admin Portal',
    sub_admin: 'Sub-Admin Portal',
    member: 'Member Portal',
    owner: 'Resident Portal',
    tenant: 'Resident Portal',
    security: 'Security Portal',
  }

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-700 flex-shrink-0">
        <h1 className="text-base font-bold text-white">🏘️ Society Portal</h1>
        <p className="text-xs text-blue-400 mt-0.5 font-medium">{roleLabel[userRole] ?? userRole}</p>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {groups.map((group) => {
          // Filter items: if item has a module, sub_admin/member must have canView
          const visibleItems = group.items.filter((item) => {
            if (!item.module) return true  // no guard — always visible
            if (!isAdminPanel) return true // resident/guard groups don't use module guards
            if (userRole === 'admin') return true // admin sees everything
            return canView(item.module)
          })
          if (visibleItems.length === 0) return null
          return (
            <div key={group.title} className="mb-1">
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                {group.title}
              </p>
              <ul className="space-y-0.5 px-2">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={onNavClick}
                      className={({ isActive }) => linkClass(isActive)}
                    >
                      <span className="text-sm leading-none">{item.icon}</span>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-gray-700 flex-shrink-0">
        <p className="text-xs text-gray-500 truncate">@{username}</p>
      </div>
    </>
  )
}

export default function Sidebar() {
  const { user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  let groups: NavGroup[] = []
  if (user?.role === 'admin' || user?.role === 'sub_admin' || user?.role === 'member') groups = adminNavGroups
  else if (user?.role === 'owner' || user?.role === 'tenant') groups = residentNavGroups
  else if (user?.role === 'security') groups = guardNavGroups

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 bg-gray-900 text-white flex-col h-full flex-shrink-0">
        <SidebarContent
          groups={groups}
          userRole={user?.role ?? ''}
          username={user?.username}
        />
      </aside>

      {/* ── Mobile: hamburger button ── */}
      <div className="md:hidden fixed top-0 left-0 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="m-3 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
          aria-label="Open menu"
        >
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white mb-1" />
          <span className="block w-5 h-0.5 bg-white" />
        </button>
      </div>

      {/* ── Mobile: drawer overlay ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile: drawer panel ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h1 className="text-base font-bold text-white">🏘️ Society Portal</h1>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-gray-400 hover:text-white text-xl leading-none"
            aria-label="Close menu"
          >
            ×
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          <SidebarContent
            groups={groups}
            userRole={user?.role ?? ''}
            username={user?.username}
            onNavClick={() => setMobileOpen(false)}
          />
        </nav>
      </aside>
    </>
  )
}