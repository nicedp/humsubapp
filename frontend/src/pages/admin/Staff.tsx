import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { staffApi } from '../../api/staff'
import { Staff } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 20

const emptyForm = { name: '', role: 'security_guard', phone: '', shift: 'morning', username: '', password: '' }

export default function AdminStaff() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [editStaff, setEditStaff] = useState<Staff | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [skip, setSkip] = useState(0)

  const queryParams = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(roleFilter && { role: roleFilter }),
    ...(activeFilter !== '' && { isActive: activeFilter === 'true' }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['staff', queryParams],
    queryFn: () => staffApi.list(queryParams),
  })

  const createMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => staffApi.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); closeModal(); toast.success('Staff member added') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const updateMutation = useMutation({
    mutationFn: (p: Partial<typeof emptyForm>) => staffApi.update(editStaff!.id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); closeModal(); toast.success('Staff member updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => staffApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); toast.success('Staff member removed') },
    onError: () => toast.error('Failed to delete staff member'),
  })

  const openCreate = () => { setEditStaff(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (s: Staff) => {
    setEditStaff(s)
    setForm({ name: s.name, role: s.role, phone: s.phone ?? '', shift: s.shift ?? 'morning', username: '', password: '' })
    setError(''); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditStaff(null); setForm(emptyForm); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (editStaff) updateMutation.mutate(form)
    else createMutation.mutate(form)
  }

  const staff = data?.data ?? []
  const total = data?.total ?? 0
  const hasFilters = !!search || !!roleFilter || activeFilter !== ''
  const resetFilters = () => { setSearch(''); setRoleFilter(''); setActiveFilter(''); setSkip(0) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-sm text-gray-500 mt-1">{total} staff members</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/staff-bulk-entry')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            ⚡ Bulk Entry
          </button>
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Add Staff</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => { setActiveFilter(''); setRoleFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${!activeFilter && !roleFilter ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div
          onClick={() => { setActiveFilter('true'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${activeFilter === 'true' ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{activeFilter === 'true' ? total : staff.filter((s) => s.isActive).length}</p>
        </div>
        <div
          onClick={() => { setRoleFilter('security_guard'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${roleFilter === 'security_guard' ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Security Guards</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{roleFilter === 'security_guard' ? total : staff.filter((s) => s.role === 'security_guard').length}</p>
        </div>
        <div
          onClick={() => { setActiveFilter('false'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${activeFilter === 'false' ? 'border-gray-400 ring-2 ring-gray-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Inactive</p>
          <p className="text-2xl font-bold text-gray-500 mt-1">{activeFilter === 'false' ? total : staff.filter((s) => !s.isActive).length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSkip(0) }}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Roles</option>
          <option value="security_guard">Security Guard</option>
          <option value="cleaner">Cleaner</option>
          <option value="maintenance">Maintenance</option>
          <option value="other">Other</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {hasFilters && (
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Clear Filters
          </button>
        )}
        {hasFilters && (
          <span className="text-sm text-gray-500">{total} result{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Role', 'Phone', 'Shift', 'Join Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Role', 'Phone', 'Shift', 'Join Date', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {staff.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">👷</div>
                  <p className="text-gray-500 font-medium">{hasFilters ? 'No staff match your filters' : 'No staff members yet'}</p>
                  <p className="text-gray-400 text-xs mt-1">{hasFilters ? 'Try adjusting your filters' : 'Add staff to get started'}</p>
                </td></tr>
              ) : staff.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{s.role.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{s.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{s.shift ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(s.joinDate), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => { if (confirm(`Delete ${s.name}?`)) deleteMutation.mutate(s.id) }} className="text-red-500 hover:underline text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="security_guard">Security Guard</option>
                    <option value="cleaner">Cleaner</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <select value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                {!editStaff && form.role === 'security_guard' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Username</label>
                      <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label>
                      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Optional" />
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editStaff ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}