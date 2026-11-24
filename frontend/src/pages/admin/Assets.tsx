import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { assetsApi } from '../../api/assets'
import { Asset } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 20

const emptyForm = { name: '', type: 'lift' as Asset['type'], status: 'operational' as Asset['status'], location: '', lastServiceDate: '', nextServiceDue: '', notes: '' }

export default function AdminAssets() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editAsset, setEditAsset] = useState<Asset | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [skip, setSkip] = useState(0)

  const queryParams = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(typeFilter && { type: typeFilter }),
    ...(statusFilter && { status: statusFilter }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['assets', queryParams],
    queryFn: () => assetsApi.list(queryParams),
  })

  const createMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => assetsApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); closeModal(); toast.success('Asset created') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const updateMutation = useMutation({
    mutationFn: (payload: typeof emptyForm) => assetsApi.update(editAsset!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); closeModal(); toast.success('Asset updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); toast.success('Asset deleted') },
    onError: () => toast.error('Failed to delete asset'),
  })

  const openCreate = () => { setEditAsset(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (a: Asset) => {
    setEditAsset(a)
    setForm({
      name: a.name, type: a.type, status: a.status, location: a.location ?? '',
      lastServiceDate: a.lastServiceDate ? a.lastServiceDate.slice(0, 10) : '',
      nextServiceDue: a.nextServiceDue ? a.nextServiceDue.slice(0, 10) : '',
      notes: a.notes ?? '',
    })
    setError(''); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditAsset(null); setForm(emptyForm); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (editAsset) updateMutation.mutate(form)
    else createMutation.mutate(form)
  }

  const assets = data?.data ?? []
  const total = data?.total ?? 0
  const now = new Date()
  const hasFilters = !!search || !!typeFilter || !!statusFilter
  const resetFilters = () => { setSearch(''); setTypeFilter(''); setStatusFilter(''); setSkip(0) }

  const statusColor = (s: string) => {
    if (s === 'operational') return 'bg-green-100 text-green-700'
    if (s === 'under_maintenance') return 'bg-yellow-100 text-yellow-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assets</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total assets</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add Asset
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => { setStatusFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${!statusFilter ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div
          onClick={() => { setStatusFilter('operational'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${statusFilter === 'operational' ? 'border-green-400 ring-2 ring-green-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Operational</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{statusFilter === 'operational' ? total : assets.filter((a) => a.status === 'operational').length}</p>
        </div>
        <div
          onClick={() => { setStatusFilter('under_maintenance'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${statusFilter === 'under_maintenance' ? 'border-yellow-400 ring-2 ring-yellow-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Maintenance</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{statusFilter === 'under_maintenance' ? total : assets.filter((a) => a.status === 'under_maintenance').length}</p>
        </div>
        <div
          onClick={() => { setStatusFilter('out_of_service'); setSkip(0) }}
          className={`bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all ${statusFilter === 'out_of_service' ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-100'}`}
        >
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Out of Service</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{statusFilter === 'out_of_service' ? total : assets.filter((a) => a.status === 'out_of_service').length}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSkip(0) }}
          className="flex-1 min-w-[200px] max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Types</option>
          <option value="lift">Lift</option>
          <option value="borewell">Borewell</option>
          <option value="water_tank">Water Tank</option>
          <option value="generator">Generator</option>
          <option value="other">Other</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Statuses</option>
          <option value="operational">Operational</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="out_of_service">Out of Service</option>
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
              <tr>{['Name', 'Type', 'Location', 'Status', 'Last Service', 'Next Due', 'Actions'].map((h) => (
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
              <tr>{['Name', 'Type', 'Location', 'Status', 'Last Service', 'Next Due', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {assets.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">🔧</div>
                  <p className="text-gray-500 font-medium">{hasFilters ? 'No assets match your filters' : 'No assets registered'}</p>
                  <p className="text-gray-400 text-xs mt-1">{hasFilters ? 'Try adjusting your filters' : 'Add assets like lifts, borewells, and generators'}</p>
                </td></tr>
              ) : assets.map((a) => {
                const isDueSoon = a.nextServiceDue && Math.ceil((new Date(a.nextServiceDue).getTime() - now.getTime()) / 86400000) <= 7
                return (
                  <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${isDueSoon ? 'bg-yellow-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                    <td className="px-4 py-3 capitalize text-gray-600">{a.type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-gray-600">{a.location ?? '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>{a.status.replace(/_/g, ' ')}</span></td>
                    <td className="px-4 py-3 text-gray-600">{a.lastServiceDate ? format(new Date(a.lastServiceDate), 'dd MMM yyyy') : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.nextServiceDue ? <span className={isDueSoon ? 'text-orange-600 font-medium' : ''}>{format(new Date(a.nextServiceDue), 'dd MMM yyyy')}</span> : '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => { if (confirm(`Delete ${a.name}?`)) deleteMutation.mutate(a.id) }} className="text-red-500 hover:underline text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editAsset ? 'Edit Asset' : 'Add Asset'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Asset['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {['lift', 'borewell', 'water_tank', 'generator', 'other'].map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Asset['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="operational">Operational</option>
                    <option value="under_maintenance">Under Maintenance</option>
                    <option value="out_of_service">Out of Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Service</label>
                  <input type="date" value={form.lastServiceDate} onChange={(e) => setForm({ ...form, lastServiceDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Due</label>
                  <input type="date" value={form.nextServiceDue} onChange={(e) => setForm({ ...form, nextServiceDue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editAsset ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}