import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { parkingApi } from '../../api/parking'
import { flatsApi } from '../../api/flats'
import { ParkingSlot } from '../../types'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 20
const emptyForm = { slotNumber: '', flatId: '', vehicleNumber: '', vehicleType: '', isOccupied: false }

export default function AdminParking() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editSlot, setEditSlot] = useState<ParkingSlot | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  // Filters + pagination
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'occupied' | 'free' | ''>('')
  const [skip, setSkip] = useState(0)

  const queryParams = {
    skip,
    limit: PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(statusFilter === 'occupied' ? { isOccupied: true } : statusFilter === 'free' ? { isOccupied: false } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['parking', queryParams],
    queryFn: () => parkingApi.list(queryParams),
  })

  // Stats — always fetch all to get real totals
  const { data: allData } = useQuery({
    queryKey: ['parking', 'stats'],
    queryFn: () => parkingApi.list({ limit: 1000 }),
  })

  const { data: flatsData } = useQuery({ queryKey: ['flats', 'all'], queryFn: () => flatsApi.list({ limit: 200 }) })

  const createMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => parkingApi.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parking'] }); closeModal(); toast.success('Slot created') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const updateMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => parkingApi.update(editSlot!.id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parking'] }); closeModal(); toast.success('Slot updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => parkingApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parking'] }); toast.success('Slot deleted') },
    onError: () => toast.error('Failed to delete slot'),
  })

  const openCreate = () => { setEditSlot(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (s: ParkingSlot) => {
    setEditSlot(s)
    setForm({ slotNumber: s.slotNumber, flatId: s.flatId ?? '', vehicleNumber: s.vehicleNumber ?? '', vehicleType: s.vehicleType ?? '', isOccupied: s.isOccupied })
    setError(''); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditSlot(null); setForm(emptyForm); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (editSlot) updateMutation.mutate(form)
    else createMutation.mutate(form)
  }

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setSkip(0) }
  const handleFilterChange = (fn: () => void) => { fn(); setSkip(0) }

  const slots = data?.data ?? []
  const total = data?.total ?? 0
  const flats = flatsData?.data ?? []

  // Stats from unfiltered data
  const allSlots = allData?.data ?? []
  const totalSlots = allData?.total ?? 0
  const occupiedCount = allSlots.filter((s) => s.isOccupied).length
  const freeCount = totalSlots - occupiedCount

  const statCards = [
    { label: 'Total Slots', value: totalSlots, color: 'blue', filter: '' as const },
    { label: 'Occupied', value: occupiedCount, color: 'red', filter: 'occupied' as const },
    { label: 'Free', value: freeCount, color: 'green', filter: 'free' as const },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parking Slots</h1>
          <p className="text-sm text-gray-500 mt-1">{occupiedCount} / {totalSlots} occupied</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          + Add Slot
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const isActive = statusFilter === card.filter
          const colorMap: Record<string, string> = {
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            red: 'bg-red-50 text-red-700 border-red-200',
            green: 'bg-green-50 text-green-700 border-green-200',
          }
          const activeRing: Record<string, string> = {
            blue: 'ring-2 ring-blue-400 border-blue-400',
            red: 'ring-2 ring-red-400 border-red-400',
            green: 'ring-2 ring-green-400 border-green-400',
          }
          return (
            <button
              key={card.label}
              onClick={() => handleFilterChange(() => setStatusFilter(statusFilter === card.filter ? '' : card.filter))}
              className={`text-left p-4 rounded-xl border cursor-pointer transition-all ${colorMap[card.color]} ${isActive ? activeRing[card.color] : 'hover:shadow-sm'}`}
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
          placeholder="Search slot no., vehicle, flat…"
          value={search}
          onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleFilterChange(() => setStatusFilter(e.target.value as 'occupied' | 'free' | ''))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="occupied">Occupied</option>
          <option value="free">Free</option>
        </select>
        {(search || statusFilter) && (
          <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Clear
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">{total} slot{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Slot No.', 'Assigned Flat', 'Vehicle No.', 'Type', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Slot No.', 'Assigned Flat', 'Vehicle No.', 'Type', 'Status', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {slots.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">🅿️</div>
                  <p className="text-gray-500 font-medium">
                    {search || statusFilter ? 'No slots match your filters' : 'No parking slots configured'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {search || statusFilter ? 'Try clearing the filters' : 'Add parking slots to manage assignments'}
                  </p>
                </td></tr>
              ) : slots.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.slotNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{s.flatNumber ?? (s.flatId ? s.flatId.slice(0, 8) : '—')}</td>
                  <td className="px-4 py-3 text-gray-600">{s.vehicleNumber ?? '—'}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{s.vehicleType ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isOccupied ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {s.isOccupied ? 'Occupied' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => { if (confirm(`Delete slot ${s.slotNumber}?`)) deleteMutation.mutate(s.id) }} className="text-red-500 hover:underline text-xs">Delete</button>
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editSlot ? 'Edit Slot' : 'Add Slot'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slot Number</label>
                  <input required value={form.slotNumber} onChange={(e) => setForm({ ...form, slotNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. P-01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Flat</label>
                  <select value={form.flatId} onChange={(e) => setForm({ ...form, flatId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Unassigned</option>
                    {flats.map((f) => <option key={f.id} value={f.id}>{f.flatNumber}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
                  <input value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                  <select value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Select...</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="scooter">Scooter</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editSlot ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}