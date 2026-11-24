
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { flatsApi } from '../../api/flats'
import { blocksApi } from '../../api/blocks'
import { residentsApi } from '../../api/residents'
import { Flat, Block, Resident } from '../../types'
import { PROPERTY_TYPE_LABELS } from '../../constants/labels'
import Pagination from '../../components/Pagination'

// ── Per-row state ──────────────────────────────────────────────────────────────
type RowStatus = 'idle' | 'saving' | 'saved' | 'error'

interface FlatRow {
  flat: Flat
  existingResident: Resident | null
  existingLoaded: boolean   // true once we've attempted the fetch
  // Form fields
  name: string
  phone: string
  email: string
  residentType: 'owner' | 'tenant'
  moveInDate: string
  username: string
  password: string
  // UI state
  status: RowStatus
  errorMsg?: string
  isExpanded: boolean
}

const TODAY = format(new Date(), 'yyyy-MM-dd')
const PAGE_LIMIT = 50

function initRow(flat: Flat): FlatRow {
  return {
    flat,
    existingResident: null,
    existingLoaded: false,
    name: '',
    phone: '',
    email: '',
    residentType: 'owner',
    moveInDate: TODAY,
    username: '',
    password: '',
    status: 'idle',
    // Vacant flats default to expanded; occupied start collapsed (resident loads on expand)
    isExpanded: flat.status === 'vacant',
  }
}

function populateFromResident(row: FlatRow, r: Resident): FlatRow {
  return {
    ...row,
    existingResident: r,
    existingLoaded: true,
    name: r.name,
    phone: r.phone,
    email: r.email ?? '',
    residentType: r.residentType,
    moveInDate: r.moveInDate ? r.moveInDate.split('T')[0] : TODAY,
    username: r.username ?? '',
    password: '',
    status: 'idle',
  }
}

function floorLabel(f: Flat): string {
  if (f.floor === null || f.floor === undefined) return '—'
  if (f.floor === 0) return 'Ground'
  if (f.floor === -1) return 'Basement'
  return `Floor ${f.floor}`
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function PropertyResidentSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [blocks, setBlocks] = useState<Block[]>([])
  const [filterBlock, setFilterBlock] = useState(searchParams.get('blockId') ?? '')
  const [filterStatus, setFilterStatus] = useState<'' | 'vacant' | 'occupied'>('')
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0)

  const [rows, setRows] = useState<FlatRow[]>([])
  const [loading, setLoading] = useState(false)
  const [savingAll, setSavingAll] = useState(false)

  // ── Load blocks once ─────────────────────────────────────────────────────────
  useEffect(() => {
    blocksApi.list().then(setBlocks).catch(() => {})
  }, [])

  // ── Load one page of flats ───────────────────────────────────────────────────
  const loadFlats = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { limit: PAGE_LIMIT, skip }
      if (filterBlock) params.blockId = filterBlock
      if (filterStatus) params.status = filterStatus
      if (search) params.search = search
      const res = await flatsApi.list(params as any)
      setTotal(res.total)
      setRows(res.data.map(initRow))
    } catch {
      toast.error('Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [skip, filterBlock, filterStatus, search])

  useEffect(() => { loadFlats() }, [loadFlats])

  // Reset to page 0 when filters change
  useEffect(() => { setSkip(0) }, [filterBlock, filterStatus, search])

  // ── Stats for current page ───────────────────────────────────────────────────
  const vacantCount = useMemo(() => rows.filter(r => r.flat.status === 'vacant').length, [rows])
  const occupiedCount = useMemo(() => rows.filter(r => r.flat.status === 'occupied').length, [rows])
  const pendingRows = useMemo(
    () => rows.filter(r => r.flat.status === 'vacant' && r.name.trim() && r.phone.trim() && r.status !== 'saved'),
    [rows]
  )
  const savedCount = useMemo(() => rows.filter(r => r.status === 'saved').length, [rows])

  // ── Row updater ──────────────────────────────────────────────────────────────
  function updateRow(flatId: string, field: keyof FlatRow, value: string) {
    setRows(prev => prev.map(r =>
      r.flat.id !== flatId ? r : { ...r, [field]: value, status: 'idle', errorMsg: undefined }
    ))
  }

  // ── Toggle expand — lazy-loads resident for occupied flats ───────────────────
  async function toggleExpand(flatId: string) {
    const row = rows.find(r => r.flat.id === flatId)
    if (!row) return

    // If occupied and resident not yet loaded, fetch now
    if (row.flat.status === 'occupied' && !row.existingLoaded && !row.isExpanded) {
      // Optimistically expand first so user sees something
      setRows(prev => prev.map(r =>
        r.flat.id !== flatId ? r : { ...r, isExpanded: true }
      ))
      try {
        const res = await residentsApi.list({ flatId, limit: 1 })
        setRows(prev => prev.map(r => {
          if (r.flat.id !== flatId) return r
          if (res.data.length > 0) return populateFromResident(r, res.data[0])
          return { ...r, existingLoaded: true }
        }))
      } catch {
        setRows(prev => prev.map(r =>
          r.flat.id !== flatId ? r : { ...r, existingLoaded: true }
        ))
      }
      return
    }

    setRows(prev => prev.map(r =>
      r.flat.id !== flatId ? r : { ...r, isExpanded: !r.isExpanded }
    ))
  }

  function setRowStatus(flatId: string, status: RowStatus, errorMsg?: string) {
    setRows(prev => prev.map(r =>
      r.flat.id !== flatId ? r : { ...r, status, errorMsg }
    ))
  }

  // ── Save single row ──────────────────────────────────────────────────────────
  async function saveRow(row: FlatRow): Promise<void> {
    if (!row.name.trim()) { toast.error(`${row.flat.flatNumber}: Name is required`); return }
    if (!row.phone.trim()) { toast.error(`${row.flat.flatNumber}: Phone is required`); return }
    const hasUser = row.username.trim() !== '' || row.password.trim() !== ''
    if (hasUser && !row.username.trim()) { toast.error(`${row.flat.flatNumber}: Username required when password is set`); return }
    if (hasUser && !row.password.trim() && !row.existingResident) { toast.error(`${row.flat.flatNumber}: Password required for new login`); return }

    setRowStatus(row.flat.id, 'saving')
    try {
      if (row.existingResident) {
        await residentsApi.update(row.existingResident.id, {
          name: row.name.trim(),
          phone: row.phone.trim(),
          ...(row.email.trim() ? { email: row.email.trim() } : {}),
          residentType: row.residentType,
          moveInDate: row.moveInDate || undefined,
        } as any)
      } else {
        const created = await residentsApi.create({
          name: row.name.trim(),
          phone: row.phone.trim(),
          ...(row.email.trim() ? { email: row.email.trim() } : {}),
          flatId: row.flat.id,
          residentType: row.residentType,
          moveInDate: row.moveInDate || undefined,
          ...(hasUser ? { username: row.username.trim(), password: row.password.trim() } : {}),
        } as any)
        setRows(prev => prev.map(r => {
          if (r.flat.id !== row.flat.id) return r
          return {
            ...r,
            existingResident: created,
            existingLoaded: true,
            flat: { ...r.flat, status: 'occupied' as const, ownerName: created.name },
            password: '',
          }
        }))
      }
      setRowStatus(row.flat.id, 'saved')
      toast.success(`✓ ${row.name.trim()} saved`)
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Save failed'
      setRowStatus(row.flat.id, 'error', msg)
      toast.error(msg)
      throw e
    }
  }

  // ── Save all filled vacant rows on current page ──────────────────────────────
  async function saveAllVacant() {
    const toSave = rows.filter(r =>
      r.flat.status === 'vacant' && r.name.trim() && r.phone.trim() && r.status !== 'saved'
    )
    if (toSave.length === 0) { toast.error('No filled vacant rows to save'); return }
    setSavingAll(true)
    for (const row of toSave) {
      try { await saveRow(row) } catch { /* per-row toast already shown */ }
    }
    setSavingAll(false)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/properties')}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            title="Back to Properties"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🏘️ Property Resident Setup</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Assign or update residents — vacant rows are ready to fill, occupied rows load on expand
            </p>
          </div>
        </div>
        {pendingRows.length > 0 && (
          <button
            onClick={saveAllVacant}
            disabled={savingAll}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {savingAll ? 'Saving…' : `👥 Save All Filled (${pendingRows.length})`}
          </button>
        )}
      </div>

      {/* KPI strip — page-level counts */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total (all pages)</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-center">
          <p className="text-2xl font-bold text-gray-600">{rows.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">This page</p>
        </div>
        <div
          className={`rounded-xl border px-4 py-3 text-center cursor-pointer transition hover:ring-2 ring-green-300 ${
            filterStatus === 'occupied' ? 'bg-green-50 border-green-400 ring-2' : 'bg-white border-gray-200'
          }`}
          onClick={() => setFilterStatus(v => v === 'occupied' ? '' : 'occupied')}
        >
          <p className="text-2xl font-bold text-green-700">{occupiedCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Occupied (page)</p>
        </div>
        <div
          className={`rounded-xl border px-4 py-3 text-center cursor-pointer transition hover:ring-2 ring-amber-300 ${
            filterStatus === 'vacant' ? 'bg-amber-50 border-amber-400 ring-2' : 'bg-white border-gray-200'
          }`}
          onClick={() => setFilterStatus(v => v === 'vacant' ? '' : 'vacant')}
        >
          <p className="text-2xl font-bold text-amber-600">{vacantCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Vacant (page)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search flat number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <select
          value={filterBlock}
          onChange={e => setFilterBlock(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Blocks</option>
          {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as '' | 'vacant' | 'occupied')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="">All Status</option>
          <option value="vacant">🟡 Vacant</option>
          <option value="occupied">🟢 Occupied</option>
        </select>
        {(filterBlock || filterStatus || search) && (
          <button
            onClick={() => { setFilterBlock(''); setFilterStatus(''); setSearch('') }}
            className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
          >
            Clear filters ×
          </button>
        )}
      </div>

      {/* Info tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-800">
        <strong>Tip:</strong> Vacant properties expand automatically — fill in details and click <strong>Save</strong>.
        Occupied properties load resident info when you click <strong>Edit</strong> (lazy-loaded).
        Showing <strong>{PAGE_LIMIT} per page</strong>.
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <p className="text-4xl mb-3">⏳</p>
          <p className="text-sm">Loading properties…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-5xl mb-3">🏘️</p>
          <p className="font-semibold text-gray-700">No properties found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map(row => (
            <PropertyRow
              key={row.flat.id}
              row={row}
              isSavingAll={savingAll}
              onUpdate={updateRow}
              onToggleExpand={toggleExpand}
              onSave={saveRow}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > PAGE_LIMIT && (
        <Pagination skip={skip} limit={PAGE_LIMIT} total={total} onPageChange={setSkip} />
      )}

      {/* Sticky bottom bar */}
      {(pendingRows.length > 0 || savedCount > 0) && (
        <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="px-6 pb-4">
            <div className="bg-gray-900 text-white rounded-xl shadow-2xl px-5 py-3.5 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-6">
                {pendingRows.length > 0 && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-amber-400">{pendingRows.length}</p>
                    <p className="text-xs text-gray-400">Ready to save</p>
                  </div>
                )}
                {savedCount > 0 && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-400">{savedCount}</p>
                    <p className="text-xs text-gray-400">Saved this page</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {savedCount > 0 && (
                  <button
                    onClick={() => navigate('/admin/residents')}
                    className="px-4 py-2 text-sm text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                  >
                    Go to Residents →
                  </button>
                )}
                {pendingRows.length > 0 && (
                  <button
                    onClick={saveAllVacant}
                    disabled={savingAll}
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors"
                  >
                    {savingAll ? 'Saving…' : `👥 Save ${pendingRows.length} Resident${pendingRows.length !== 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PropertyRow sub-component ──────────────────────────────────────────────────
interface PropertyRowProps {
  row: FlatRow
  isSavingAll: boolean
  onUpdate: (flatId: string, field: keyof FlatRow, value: string) => void
  onToggleExpand: (flatId: string) => void
  onSave: (row: FlatRow) => Promise<void>
}

function PropertyRow({ row, isSavingAll, onUpdate, onToggleExpand, onSave }: PropertyRowProps) {
  const { flat, existingResident, existingLoaded, status, errorMsg, isExpanded } = row
  const isOccupied = flat.status === 'occupied'
  const isSaving = status === 'saving' || isSavingAll
  const canSave = row.name.trim() !== '' && row.phone.trim() !== '' && status !== 'saved'

  return (
    <div className={`bg-white rounded-xl border transition-all ${
      status === 'saved'
        ? 'border-green-300 bg-green-50/40'
        : status === 'error'
        ? 'border-red-300 bg-red-50/30'
        : isOccupied
        ? 'border-gray-200'
        : 'border-amber-200'
    }`}>
      {/* Row header */}
      <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
        {/* Status pip */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
          status === 'saved' ? 'bg-green-500' :
          status === 'error' ? 'bg-red-500' :
          isOccupied ? 'bg-green-400' : 'bg-amber-400'
        }`} />

        {/* Flat info */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-[120px]">
          <span className="font-semibold text-gray-800 text-sm">{flat.flatNumber}</span>
          {flat.blockName && (
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{flat.blockName}</span>
          )}
          <span className="text-xs text-gray-400">{floorLabel(flat)}</span>
        </div>

        {/* Type badge */}
        <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
          {PROPERTY_TYPE_LABELS[flat.type] ?? flat.type}
        </span>

        {/* Resident preview */}
        <div className="flex-1 min-w-0">
          {isOccupied ? (
            isExpanded && existingLoaded ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-700">{row.name || flat.ownerName || '—'}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  row.residentType === 'owner' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                }`}>{row.residentType}</span>
                {row.phone && <span className="text-xs text-gray-400">{row.phone}</span>}
              </div>
            ) : (
              <span className="text-sm text-gray-600">{flat.ownerName ?? <span className="text-gray-400 italic text-xs">Occupied — click Edit to view</span>}</span>
            )
          ) : (
            row.name.trim()
              ? <span className="text-sm text-gray-600">{row.name}</span>
              : <span className="text-xs text-amber-600 font-medium">Vacant — fill details below</span>
          )}
        </div>

        {/* Status badge */}
        <div className="flex-shrink-0 text-xs font-medium">
          {status === 'saved' && <span className="text-green-600">✓ Saved</span>}
          {status === 'error' && <span className="text-red-500">✕ Error</span>}
          {status === 'saving' && <span className="text-blue-500">Saving…</span>}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggleExpand(flat.id)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
              isExpanded
                ? 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                : isOccupied
                ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
          >
            {isExpanded ? '▲ Collapse' : isOccupied ? 'Edit' : '▼ Fill Details'}
          </button>

          {isExpanded && (
            <button
              onClick={() => onSave(row)}
              disabled={!canSave || isSaving}
              className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              {status === 'saving' ? '…' : isOccupied ? 'Update' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <div className="px-4 pb-2">
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">{errorMsg}</p>
        </div>
      )}

      {/* Expanded form */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-4">
          {/* Loading spinner for occupied flats while resident is being fetched */}
          {isOccupied && !existingLoaded ? (
            <div className="py-4 text-center text-gray-400 text-sm">Loading resident info…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={row.name}
                    onChange={e => onUpdate(flat.id, 'name', e.target.value)}
                    placeholder="e.g. Enter Full Name"
                    disabled={isSaving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={row.phone}
                    onChange={e => onUpdate(flat.id, 'phone', e.target.value)}
                    placeholder="Enter Mobile Number"
                    disabled={isSaving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={row.email}
                    onChange={e => onUpdate(flat.id, 'email', e.target.value)}
                    placeholder="optional"
                    disabled={isSaving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                  <select
                    value={row.residentType}
                    onChange={e => onUpdate(flat.id, 'residentType', e.target.value)}
                    disabled={isSaving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  >
                    <option value="owner">Owner</option>
                    <option value="tenant">Tenant</option>
                  </select>
                </div>

                {/* Move-in Date */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Move-in Date</label>
                  <input
                    type="date"
                    value={row.moveInDate}
                    onChange={e => onUpdate(flat.id, 'moveInDate', e.target.value)}
                    disabled={isSaving}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  />
                </div>

                {/* Credentials — only for new (vacant) residents */}
                {!existingResident && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Username <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={row.username}
                        onChange={e => onUpdate(flat.id, 'username', e.target.value)}
                        placeholder="For portal login"
                        disabled={isSaving}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Password <span className="text-gray-400 text-xs font-normal">(if username set)</span>
                      </label>
                      <input
                        type="password"
                        value={row.password}
                        onChange={e => onUpdate(flat.id, 'password', e.target.value)}
                        placeholder="Min 6 characters"
                        disabled={isSaving}
                        className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                      />
                    </div>
                  </>
                )}

                {/* Existing login badge — for occupied/existing residents */}
                {existingResident && existingResident.username && (
                  <div className="flex items-end pb-1">
                    <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-1 rounded-lg">
                      🔑 Portal login: <strong>{existingResident.username}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Row-level save button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onSave(row)}
                  disabled={!canSave || isSaving}
                  className="px-5 py-1.5 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {status === 'saving' ? 'Saving…' : isOccupied ? '✓ Update Resident' : '✓ Save Resident'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
