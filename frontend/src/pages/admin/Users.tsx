import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usersApi } from '../../api/users'
import { AdminUser } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 20

const emptyForm = {
  username: '',
  password: '',
  role: 'security' as 'admin' | 'security',
}

const emptyEditForm = {
  password: '',
  role: 'security' as 'admin' | 'security',
  isActive: true,
}

export default function AdminUsers() {
  const qc = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [error, setError] = useState('')

  // Filters + pagination
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | ''>('')
  const [skip, setSkip] = useState(0)

  const queryParams = {
    skip,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
    ...(activeFilter !== '' ? { isActive: activeFilter === 'true' } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', queryParams],
    queryFn: () => usersApi.list(queryParams),
  })

  // Stats — unfiltered totals
  const { data: allData } = useQuery({
    queryKey: ['admin-users', 'stats'],
    queryFn: () => usersApi.list({ limit: 500 }),
  })

  const createMutation = useMutation({
    mutationFn: () => usersApi.create({ username: form.username, password: form.password, role: form.role }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); closeCreateModal(); toast.success('User created') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error creating user'; setError(msg); toast.error(msg) },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { password?: string; isActive?: boolean; role?: 'admin' | 'security' }) =>
      usersApi.update(editUser!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); closeEditModal(); toast.success('User updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error updating user'; setError(msg); toast.error(msg) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast.success('User deleted') },
    onError: () => toast.error('Failed to delete user'),
  })

  const openCreateModal = () => { setForm(emptyForm); setError(''); setShowCreateModal(true) }
  const closeCreateModal = () => { setShowCreateModal(false); setForm(emptyForm); setError('') }

  const openEditModal = (u: AdminUser) => {
    setEditUser(u)
    setEditForm({ password: '', role: u.role, isActive: u.isActive })
    setError('')
  }
  const closeEditModal = () => { setEditUser(null); setEditForm(emptyEditForm); setError('') }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.username.trim() || !form.password.trim()) { setError('Username and password are required'); return }
    createMutation.mutate()
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const payload: { password?: string; isActive?: boolean; role?: 'admin' | 'security' } = {
      role: editForm.role,
      isActive: editForm.isActive,
    }
    if (editForm.password.trim()) payload.password = editForm.password
    updateMutation.mutate(payload)
  }

  const clearFilters = () => { setSearch(''); setRoleFilter(''); setActiveFilter(''); setSkip(0) }
  const handleFilterChange = (fn: () => void) => { fn(); setSkip(0) }

  const users = data?.data ?? []
  const total = data?.total ?? 0

  // Stats
  const allUsers = allData?.data ?? []
  const totalUsers = allData?.total ?? 0
  const activeCount = allUsers.filter((u) => u.isActive).length
  const adminCount = allUsers.filter((u) => u.role === 'admin').length
  const securityCount = allUsers.filter((u) => u.role === 'security').length

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    security: 'bg-yellow-100 text-yellow-700',
    owner: 'bg-blue-100 text-blue-700',
    tenant: 'bg-purple-100 text-purple-700',
  }

  const statCards = [
    { label: 'Total Users', value: totalUsers, color: 'blue', roleKey: '' },
    { label: 'Admins', value: adminCount, color: 'red', roleKey: 'admin' },
    { label: 'Security Guards', value: securityCount, color: 'yellow', roleKey: 'security' },
    { label: 'Active', value: activeCount, color: 'green', roleKey: '' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">{totalUsers} system users</p>
        </div>
        <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + New User
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            red: 'bg-red-50 text-red-700 border-red-200',
            yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            green: 'bg-green-50 text-green-700 border-green-200',
          }
          const activeRing: Record<string, string> = {
            blue: 'ring-2 ring-blue-400 border-blue-400',
            red: 'ring-2 ring-red-400 border-red-400',
            yellow: 'ring-2 ring-yellow-400 border-yellow-400',
            green: 'ring-2 ring-green-400 border-green-400',
          }
          // "Active" card toggles isActive filter; role cards toggle roleFilter
          const isActiveCard = idx === 3
          const isCardActive = isActiveCard
            ? activeFilter === 'true'
            : card.roleKey ? roleFilter === card.roleKey : roleFilter === '' && activeFilter === ''

          const handleCardClick = () => {
            if (isActiveCard) {
              handleFilterChange(() => setActiveFilter(activeFilter === 'true' ? '' : 'true'))
            } else if (card.roleKey) {
              handleFilterChange(() => setRoleFilter(roleFilter === card.roleKey ? '' : card.roleKey))
            } else {
              handleFilterChange(() => { setRoleFilter(''); setActiveFilter('') })
            }
          }

          return (
            <button
              key={card.label}
              onClick={handleCardClick}
              className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${colorMap[card.color]} ${isCardActive ? activeRing[card.color] : 'hover:shadow-sm'}`}
            >
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm font-medium mt-0.5">{card.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by username…"
          value={search}
          onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={roleFilter}
          onChange={(e) => handleFilterChange(() => setRoleFilter(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="security">Security</option>
          <option value="owner">Owner</option>
          <option value="tenant">Tenant</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => handleFilterChange(() => setActiveFilter(e.target.value as 'true' | 'false' | ''))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {(search || roleFilter || activeFilter) && (
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">{total} user{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Username', 'Role', 'Status', 'Resident / Staff Link', 'Created', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Username', 'Role', 'Status', 'Resident / Staff Link', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">🔑</div>
                  <p className="text-gray-500 font-medium">
                    {search || roleFilter || activeFilter ? 'No users match your filters' : 'No users found'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {search || roleFilter || activeFilter ? 'Try clearing the filters' : 'Create a new admin or security user above'}
                  </p>
                </td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 font-mono">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.residentId ? <span className="text-blue-600">Resident linked</span>
                      : u.staffId ? <span className="text-yellow-600">Staff linked</span>
                      : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(u.createdAt), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(u)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button
                        onClick={() => { if (confirm(`Delete user "${u.username}"? This cannot be undone.`)) deleteMutation.mutate(u.id) }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />
      )}

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">New System User</h2>
            <p className="text-sm text-gray-500 mb-4">
              Create an <strong>admin</strong> or <strong>security</strong> user account. For resident accounts, use the Residents page to add a resident with a login.
            </p>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  placeholder="e.g. guard2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'security' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="security">Security Guard</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeCreateModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400">
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Edit User</h2>
            <p className="text-sm text-gray-500 mb-4 font-mono">{editUser.username}</p>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'security' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="security">Security Guard</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">Account active</label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}