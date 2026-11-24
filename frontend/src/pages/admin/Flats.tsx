import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { flatsApi } from '../../api/flats'
import { Flat, PropertyType } from '../../types'
import Pagination from '../../components/Pagination'

const FLOOR_LABELS: Record<number, string> = {
  1: '1st Floor',
  2: '2nd Floor',
  3: '3rd Floor',
  4: '4th Floor',
  5: '5th Floor (Penthouse)',
}

const emptyForm: { flatNumber: string; floor: number; type: PropertyType; sqFt: number; status: 'vacant' | 'occupied' } = { flatNumber: '', floor: 1, type: 'flat', sqFt: 0, status: 'vacant' }
const PAGE_SIZE = 20

export default function AdminFlats() {
  const qc = useQueryClient()

  // ── Filter state (all server-side) ───────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'' | 'occupied' | 'vacant'>('')
  const [floorFilter, setFloorFilter] = useState<number | ''>('')
  const [typeFilter, setTypeFilter] = useState<'' | PropertyType>('')
  const [skip, setSkip] = useState(0)

  // ── Modal state ───────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editFlat, setEditFlat] = useState<Flat | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const resetFilters = () => {
    setSearch(''); setStatusFilter(''); setFloorFilter(''); setTypeFilter(''); setSkip(0)
  }

  const hasActiveFilters = search || statusFilter || floorFilter !== '' || typeFilter

  // ── Query ─────────────────────────────────────────────────────
  const queryParams = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(floorFilter !== '' && { floor: Number(floorFilter) }),
    ...(typeFilter && { type: typeFilter }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['flats', queryParams],
    queryFn: () => flatsApi.list(queryParams),
  })

  // Summary counts — fetch all without pagination for stat cards
  const { data: allData } = useQuery({
    queryKey: ['flats-summary'],
    queryFn: () => flatsApi.list({ limit: 200 }),
  })

  const allFlats = allData?.data ?? []
  const totalFlats = allData?.total ?? 0
  const occupiedCount = allFlats.filter((f) => f.status === 'occupied').length
  const vacantCount = allFlats.filter((f) => f.status === 'vacant').length
  const penthouses = allFlats.filter((f) => f.type === 'penthouse').length

  // ── Mutations ─────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => flatsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flats'] })
      closeModal()
      toast.success('Flat created')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'
      setError(msg); toast.error(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => flatsApi.update(editFlat!.id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flats'] })
      closeModal()
      toast.success('Flat updated')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'
      setError(msg); toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => flatsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['flats'] }); toast.success('Flat deleted') },
    onError: () => toast.error('Failed to delete flat'),
  })

  const flats = data?.data ?? []
  const total = data?.total ?? 0

  const openCreate = () => { setEditFlat(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (f: Flat) => {
    setEditFlat(f)
    setForm({ flatNumber: f.flatNumber, floor: f.floor ?? 1, type: f.type as PropertyType, sqFt: f.sqFt, status: f.status as 'vacant' | 'occupied' })
    setError('')
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditFlat(null); setForm(emptyForm); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (editFlat) updateMutation.mutate(form)
    else createMutation.mutate(form)
  }

  const handleFilterChange = () => setSkip(0)

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flats</h1>
          <p className="text-sm text-gray-500 mt-1">{totalFlats} total flats</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Add Flat
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => { setStatusFilter(''); setSkip(0) }}
          className={`rounded-xl p-4 text-left border transition-all ${!statusFilter ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
        >
          <p className="text-2xl font-bold text-gray-900">{totalFlats}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Flats</p>
        </button>
        <button
          onClick={() => { setStatusFilter('occupied'); setSkip(0) }}
          className={`rounded-xl p-4 text-left border transition-all ${statusFilter === 'occupied' ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
        >
          <p className="text-2xl font-bold text-green-700">{occupiedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Occupied</p>
        </button>
        <button
          onClick={() => { setStatusFilter('vacant'); setSkip(0) }}
          className={`rounded-xl p-4 text-left border transition-all ${statusFilter === 'vacant' ? 'border-orange-300 bg-orange-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
        >
          <p className="text-2xl font-bold text-orange-600">{vacantCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vacant</p>
        </button>
        <button
          onClick={() => { setTypeFilter(typeFilter === 'penthouse' ? '' : 'penthouse'); setSkip(0) }}
          className={`rounded-xl p-4 text-left border transition-all ${typeFilter === 'penthouse' ? 'border-purple-300 bg-purple-50' : 'border-gray-100 bg-white hover:bg-gray-50'}`}
        >
          <p className="text-2xl font-bold text-purple-700">{penthouses}</p>
          <p className="text-xs text-gray-500 mt-0.5">Penthouses</p>
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search flat number..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange() }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as '' | 'occupied' | 'vacant'); handleFilterChange() }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="occupied">Occupied</option>
            <option value="vacant">Vacant</option>
          </select>

          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => { setFloorFilter(e.target.value === '' ? '' : Number(e.target.value)); handleFilterChange() }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Floors</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{FLOOR_LABELS[n]}</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value as '' | PropertyType); handleFilterChange() }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="flat">Flat</option>
            <option value="penthouse">Penthouse</option>
            <option value="single">Single House</option>
            <option value="duplex">Duplex</option>
            <option value="triplex">Triplex</option>
            <option value="bungalow">Bungalow</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm text-gray-500 hover:text-red-600 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
            >
              ✕ Clear
            </button>
          )}

          <p className="text-xs text-gray-400 ml-auto">{total} result{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Flat No.', 'Floor', 'Type', 'Sq.Ft', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(8)].map((_, i) => (
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
                {['Flat No.', 'Floor', 'Type', 'Area (sq.ft)', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {flats.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center">
                  <div className="text-5xl mb-3">🏢</div>
                  <p className="text-gray-500 font-medium">No flats found</p>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} className="mt-2 text-sm text-blue-600 hover:underline">Clear filters</button>
                  )}
                </td></tr>
              ) : flats.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900 font-mono">{f.flatNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{f.floor != null ? (FLOOR_LABELS[f.floor] ?? `Floor ${f.floor}`) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${f.type === 'penthouse' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {f.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{f.sqFt.toLocaleString()} sq.ft</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${f.status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(f)} className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                      <button
                        onClick={() => { if (confirm(`Delete flat ${f.flatNumber}?`)) deleteMutation.mutate(f.id) }}
                        className="text-red-500 hover:underline text-xs font-medium"
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
      <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editFlat ? 'Edit Flat' : 'Add Flat'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat Number</label>
                  <input
                    required
                    value={form.flatNumber}
                    onChange={(e) => setForm({ ...form, flatNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. F1-01, PH-01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <select
                    value={form.floor}
                    onChange={(e) => setForm({ ...form, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{FLOOR_LABELS[n]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PropertyType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="penthouse">Penthouse</option>
                    <option value="single">Single House</option>
                    <option value="duplex">Duplex</option>
                    <option value="triplex">Triplex</option>
                    <option value="bungalow">Bungalow</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area (sq.ft)</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.sqFt || ''}
                    onChange={(e) => setForm({ ...form, sqFt: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editFlat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}