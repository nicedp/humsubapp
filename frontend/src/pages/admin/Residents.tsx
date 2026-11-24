import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { residentsApi } from '../../api/residents'
import { flatsApi } from '../../api/flats'
import { importApi, ImportResult } from '../../api/import'
import { Resident, Vehicle } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'
import ResidentModal, { ResidentForm } from '../../components/admin/residents/ResidentModal'
import ImportModal from '../../components/admin/residents/ImportModal'
import VehicleModal, { VehicleForm } from '../../components/admin/residents/VehicleModal'

const emptyResidentForm: ResidentForm = {
  name: '', email: '', phone: '', flatId: '',
  residentType: 'owner', username: '', password: '', moveInDate: '',
}
const emptyVehicleForm: VehicleForm = { vehicleType: 'car', vehicleNumber: '', make: '', model: '', color: '' }
const PAGE_SIZE = 20

export default function AdminResidents() {
  const qc = useQueryClient()
  const navigate = useNavigate()

  // ── Filter state ─────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | 'owner' | 'tenant'>('')
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('')
  const [vehicleFilter, setVehicleFilter] = useState<'' | 'has' | 'none'>('')
  const [skip, setSkip] = useState(0)
  const hasActiveFilters = !!(search || typeFilter || activeFilter || vehicleFilter)
  const resetFilters = () => { setSearch(''); setTypeFilter(''); setActiveFilter(''); setVehicleFilter(''); setSkip(0) }

  // ── Resident modal state ──────────────────────────────────────────
  const [showModal, setShowModal] = useState(false)
  const [editResident, setEditResident] = useState<Resident | null>(null)
  const [form, setForm] = useState<ResidentForm>({ ...emptyResidentForm })
  const [error, setError] = useState('')

  // ── Import modal state ────────────────────────────────────────────
  const [showImportModal, setShowImportModal] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  // ── Vehicle modal state ───────────────────────────────────────────
  const [vehicleResident, setVehicleResident] = useState<Resident | null>(null)
  const [showVehicleModal, setShowVehicleModal] = useState(false)
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null)
  const [vehicleForm, setVehicleForm] = useState<VehicleForm>({ ...emptyVehicleForm })
  const [vehicleError, setVehicleError] = useState('')
  const [showAddVehicle, setShowAddVehicle] = useState(false)

  // ── Queries ───────────────────────────────────────────────────────
  const queryParams = {
    skip, limit: PAGE_SIZE,
    ...(search && { search }),
    ...(typeFilter && { residentType: typeFilter as 'owner' | 'tenant' }),
    ...(activeFilter !== '' && { isActive: activeFilter === 'true' }),
  }
  const { data, isLoading } = useQuery({ queryKey: ['residents', queryParams], queryFn: () => residentsApi.list(queryParams) })
  const { data: summaryData } = useQuery({ queryKey: ['residents-summary'], queryFn: () => residentsApi.list({ limit: 200 }) })
  const { data: flatsData } = useQuery({ queryKey: ['flats-for-residents'], queryFn: () => flatsApi.list({ limit: 500 }) })
  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles', vehicleResident?.id],
    queryFn: () => residentsApi.getVehicles(vehicleResident!.id),
    enabled: !!vehicleResident,
  })

  const allResidents = summaryData?.data ?? []
  const totalResidents = summaryData?.total ?? 0
  const activeCount = allResidents.filter(r => r.isActive).length
  const ownerCount = allResidents.filter(r => r.residentType === 'owner').length
  const tenantCount = allResidents.filter(r => r.residentType === 'tenant').length
  const rawResidents = data?.data ?? []
  // Client-side vehicle filter (numCars + numBikes from list data)
  const residents = vehicleFilter === 'has'
    ? rawResidents.filter(r => (r.numCars + r.numBikes) > 0)
    : vehicleFilter === 'none'
    ? rawResidents.filter(r => (r.numCars + r.numBikes) === 0)
    : rawResidents
  const flats = flatsData?.data ?? []
  const vehicles = vehiclesData ?? []

  // ── Mutations ─────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (payload: ResidentForm) => residentsApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); closeModal(); toast.success('Resident added') },
    onError: (e: any) => { const msg = e?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ResidentForm>) => residentsApi.update(editResident!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); closeModal(); toast.success('Resident updated') },
    onError: (e: any) => { const msg = e?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => residentsApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); toast.success('Resident deactivated') },
    onError: () => toast.error('Failed to deactivate resident'),
  })
  const importMutation = useMutation({
    mutationFn: (file: File) => importApi.importResidents(file),
    onSuccess: (result) => {
      setImportResult(result)
      qc.invalidateQueries({ queryKey: ['residents'] }); qc.invalidateQueries({ queryKey: ['flats'] })
      result.errors === 0 ? toast.success(`Import complete: ${result.created} created, ${result.skipped} skipped`) : toast.error(`Import finished with ${result.errors} error(s)`)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Import failed'),
  })
  const addVehicleMutation = useMutation({
    mutationFn: (payload: VehicleForm) => residentsApi.addVehicle(vehicleResident!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles', vehicleResident?.id] }); setShowAddVehicle(false); setVehicleForm(emptyVehicleForm); setVehicleError(''); toast.success('Vehicle added') },
    onError: (e: any) => { const msg = e?.response?.data?.message ?? 'Error'; setVehicleError(msg); toast.error(msg) },
  })
  const updateVehicleMutation = useMutation({
    mutationFn: (payload: VehicleForm) => residentsApi.updateVehicle(vehicleResident!.id, editVehicle!.id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles', vehicleResident?.id] }); setEditVehicle(null); setVehicleForm(emptyVehicleForm); setVehicleError(''); toast.success('Vehicle updated') },
    onError: (e: any) => { const msg = e?.response?.data?.message ?? 'Error'; setVehicleError(msg); toast.error(msg) },
  })
  const deleteVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) => residentsApi.deleteVehicle(vehicleResident!.id, vehicleId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles', vehicleResident?.id] }); toast.success('Vehicle removed') },
    onError: () => toast.error('Failed to remove vehicle'),
  })

  // ── Handlers ─────────────────────────────────────────────────────
  const openCreate = () => { setSkip(0); setEditResident(null); setForm({ ...emptyResidentForm }); setError(''); setShowModal(true) }
  const openEdit = (r: Resident) => {
    setEditResident(r); setError('')
    setForm({ name: r.name, email: r.email ?? '', phone: r.phone, flatId: r.flatId, residentType: r.residentType, username: '', password: '', moveInDate: '' })
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditResident(null); setForm({ ...emptyResidentForm }); setError('') }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const payload: any = {
      ...form,
      ...(form.email.trim() ? { email: form.email.trim() } : { email: undefined }),
    }
    // Strip empty optional fields so backend Zod doesn't receive empty strings
    if (!payload.username?.trim()) delete payload.username
    if (!payload.password?.trim()) delete payload.password
    if (!payload.moveInDate?.trim()) delete payload.moveInDate
    editResident ? updateMutation.mutate(payload) : createMutation.mutate(payload)
  }

  const openVehicleModal = (r: Resident) => { setVehicleResident(r); setShowVehicleModal(true); setShowAddVehicle(false); setEditVehicle(null); setVehicleForm(emptyVehicleForm); setVehicleError('') }
  const closeVehicleModal = () => { setShowVehicleModal(false); setVehicleResident(null); setEditVehicle(null); setShowAddVehicle(false); setVehicleForm(emptyVehicleForm); setVehicleError('') }
  const openEditVehicle = (v: Vehicle) => { setEditVehicle(v); setVehicleForm({ vehicleType: v.vehicleType, vehicleNumber: v.vehicleNumber, make: v.make ?? '', model: v.model ?? '', color: v.color ?? '' }); setShowAddVehicle(true); setVehicleError('') }
  const handleVehicleSubmit = (e: React.FormEvent) => { e.preventDefault(); setVehicleError(''); editVehicle ? updateVehicleMutation.mutate(vehicleForm) : addVehicleMutation.mutate(vehicleForm) }
  const cancelVehicleForm = () => { setShowAddVehicle(false); setEditVehicle(null); setVehicleForm(emptyVehicleForm); setVehicleError('') }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setImportResult(null); importMutation.mutate(file); e.target.value = '' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
          <p className="text-sm text-gray-500 mt-1">{totalResidents} total residents</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setImportResult(null); setShowImportModal(true) }}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5">
            <span>⬆</span> Import CSV
          </button>
          <button
            onClick={() => navigate('/admin/resident-bulk-entry')}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            ⚡ Bulk Entry
          </button>
          <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            + Add Resident
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button onClick={() => { setTypeFilter(''); setActiveFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border shadow-sm p-4 text-left hover:shadow-md transition-shadow ${!typeFilter && !activeFilter ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-100'}`}>
          <p className="text-2xl font-bold text-gray-900">{totalResidents}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Residents</p>
        </button>
        <button onClick={() => { setActiveFilter('true'); setTypeFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border shadow-sm p-4 text-left hover:shadow-md transition-shadow ${activeFilter === 'true' && !typeFilter ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-100'}`}>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active</p>
        </button>
        <button onClick={() => { setTypeFilter('owner'); setActiveFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border shadow-sm p-4 text-left hover:shadow-md transition-shadow ${typeFilter === 'owner' ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-100'}`}>
          <p className="text-2xl font-bold text-blue-700">{ownerCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Owners</p>
        </button>
        <button onClick={() => { setTypeFilter('tenant'); setActiveFilter(''); setSkip(0) }}
          className={`bg-white rounded-xl border shadow-sm p-4 text-left hover:shadow-md transition-shadow ${typeFilter === 'tenant' ? 'border-purple-400 ring-1 ring-purple-200' : 'border-gray-100'}`}>
          <p className="text-2xl font-bold text-purple-700">{tenantCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Tenants</p>
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <input type="text" placeholder="Search name, email, flat..." value={search}
          onChange={e => { setSearch(e.target.value); setSkip(0) }}
          className="flex-1 min-w-[200px] max-w-xs px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value as '' | 'owner' | 'tenant'); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Types</option>
          <option value="owner">Owner</option>
          <option value="tenant">Tenant</option>
        </select>
        <select value={activeFilter} onChange={e => { setActiveFilter(e.target.value as '' | 'true' | 'false'); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select value={vehicleFilter} onChange={e => { setVehicleFilter(e.target.value as '' | 'has' | 'none'); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Vehicles</option>
          <option value="has">Has Vehicles</option>
          <option value="none">No Vehicles</option>
        </select>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            ✕ Clear
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">{residents.length} result{residents.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Flat', 'Type', 'Email', 'Phone', 'Vehicles', 'Move-In', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(9)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Name', 'Flat', 'Type', 'Email', 'Phone', 'Vehicles', 'Move-In', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {residents.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="text-gray-500 font-medium">No residents found</p>
                  <p className="text-gray-400 text-xs mt-1">{hasActiveFilters ? 'Try adjusting your filters' : 'Add a resident to get started'}</p>
                </td></tr>
              ) : residents.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    {r.userId && (
                      <div className="text-xs text-gray-400 mt-0.5">🔑 {r.username}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.flatNumber ?? r.flatId}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.residentType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {r.residentType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.email}</td>
                  <td className="px-4 py-3 text-gray-600">{r.phone}</td>
                  <td className="px-4 py-3">
                    {(r.numCars + r.numBikes) === 0 ? (
                      <span className="text-gray-400 text-xs">—</span>
                    ) : (
                      <button
                        onClick={() => openVehicleModal(r)}
                        className="flex flex-wrap gap-1 group"
                        title="Click to manage vehicles"
                      >
                        {r.numCars > 0 && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium group-hover:bg-blue-200">
                            🚗 {r.numCars}
                          </span>
                        )}
                        {r.numBikes > 0 && (
                          <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium group-hover:bg-green-200">
                            🏍️ {r.numBikes}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{format(new Date(r.moveInDate), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/residents/${r.id}`)} className="text-purple-600 hover:underline text-xs font-medium">View</button>
                      <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => openVehicleModal(r)} className="text-indigo-600 hover:underline text-xs">
                        Vehicles
                      </button>
                      {r.isActive && (
                        <button onClick={() => { if (confirm(`Deactivate ${r.name}?`)) deactivateMutation.mutate(r.id) }}
                          className="text-red-500 hover:underline text-xs">Deactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination skip={skip} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setSkip} />

      {/* Modals */}
      {showModal && (
        <ResidentModal
          editResident={editResident} form={form} flats={flats} error={error}
          isPending={createMutation.isPending || updateMutation.isPending}
          onChange={setForm} onSubmit={handleSubmit} onClose={closeModal}
        />
      )}
      {showImportModal && (
        <ImportModal
          isPending={importMutation.isPending} importResult={importResult}
          onFileChange={handleFileChange} onClose={() => { setShowImportModal(false); setImportResult(null) }}
        />
      )}
      {showVehicleModal && vehicleResident && (
        <VehicleModal
          resident={vehicleResident} vehicles={vehicles} vehiclesLoading={vehiclesLoading}
          editVehicle={editVehicle} vehicleForm={vehicleForm} vehicleError={vehicleError}
          showAddVehicle={showAddVehicle}
          addPending={addVehicleMutation.isPending} updatePending={updateVehicleMutation.isPending}
          onVehicleFormChange={setVehicleForm} onSubmit={handleVehicleSubmit}
          onEditVehicle={openEditVehicle}
          onDeleteVehicle={(id, num) => { if (confirm(`Remove vehicle ${num}?`)) deleteVehicleMutation.mutate(id) }}
          onShowAdd={() => { setShowAddVehicle(true); setEditVehicle(null); setVehicleForm(emptyVehicleForm) }}
          onCancelForm={cancelVehicleForm} onClose={closeVehicleModal}
        />
      )}
    </div>
  )
}