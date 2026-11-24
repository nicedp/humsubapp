import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { flatsApi } from '../../api/flats'
import { residentsApi, BulkResidentItem, BulkResidentResult } from '../../api/residents'
import { Flat } from '../../types'
import FlatSearchSelect from '../../components/FlatSearchSelect'

// ── Row state ─────────────────────────────────────────────────────────────────
interface ResidentRow {
  name: string
  email: string
  phone: string
  flatId: string
  residentType: 'owner' | 'tenant'
  moveInDate: string
  username: string
  password: string
  status: 'idle' | 'saving' | 'saved' | 'error'
  errorMsg?: string
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

function emptyRow(): ResidentRow {
  return {
    name: '',
    email: '',
    phone: '',
    flatId: '',
    residentType: 'owner',
    moveInDate: TODAY,
    username: '',
    password: '',
    status: 'idle',
  }
}

const INITIAL_ROWS = 5

export default function BulkResidentEntry() {
  const navigate = useNavigate()

  // Fetch all flats for the dropdown
  const { data: flatsData } = useQuery({
    queryKey: ['flats-for-bulk-residents'],
    queryFn: () => flatsApi.list({ limit: 500 }),
    staleTime: 60_000,
  })
  const flats: Flat[] = flatsData?.data ?? []

  // ── Row state ───────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<ResidentRow[]>(() =>
    Array.from({ length: INITIAL_ROWS }, emptyRow)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<BulkResidentResult | null>(null)

  // ── Cell change handler ─────────────────────────────────────────────────────
  function updateRow(index: number, field: keyof ResidentRow, value: string) {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, status: 'idle', errorMsg: undefined }
      return next
    })
  }

  function addRows(count: number) {
    setRows(prev => [...prev, ...Array.from({ length: count }, emptyRow)])
  }

  function clearAll() {
    if (!confirm('Clear all rows? This cannot be undone.')) return
    setRows(Array.from({ length: INITIAL_ROWS }, emptyRow))
    setResult(null)
  }

  // ── Computed ────────────────────────────────────────────────────────────────
  const nonEmptyRows = useMemo(
    () => rows.filter(r => r.name.trim() !== ''),
    [rows]
  )

  const validRows = useMemo(
    () => nonEmptyRows.filter(r => {
      const hasLogin = r.username.trim() !== '' || r.password.trim() !== ''
      if (hasLogin && (r.username.trim() === '' || r.password.trim() === '')) return false
      return r.name.trim() && r.phone.trim() && r.flatId
    }),
    [nonEmptyRows]
  )

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSaveAll() {
    if (validRows.length === 0) {
      toast.error('No valid rows to save. Fill in Name, Phone and Flat.')
      return
    }

    // Pre-validate rows
    const rowsWithValidation = rows.map(r => {
      if (r.name.trim() === '') return r
      if (!r.phone.trim()) return { ...r, status: 'error' as const, errorMsg: 'Phone required' }
      if (!r.flatId) return { ...r, status: 'error' as const, errorMsg: 'Flat required' }
      const hasLogin = r.username.trim() !== '' || r.password.trim() !== ''
      if (hasLogin && r.username.trim() === '') return { ...r, status: 'error' as const, errorMsg: 'Username required when password is set' }
      if (hasLogin && r.password.trim() === '') return { ...r, status: 'error' as const, errorMsg: 'Password required when username is set' }
      return r
    })

    const hasValidationErrors = rowsWithValidation.some(r => r.status === 'error')
    if (hasValidationErrors) {
      setRows(rowsWithValidation)
      toast.error('Fix validation errors before saving')
      return
    }

    setIsSaving(true)
    setResult(null)

    const payload: BulkResidentItem[] = validRows.map(r => ({
      name: r.name.trim(),
      ...(r.email.trim() ? { email: r.email.trim() } : {}),
      phone: r.phone.trim(),
      flatId: r.flatId,
      residentType: r.residentType,
      moveInDate: r.moveInDate || undefined,
      ...(r.username.trim() && r.password.trim() ? { username: r.username.trim(), password: r.password.trim() } : {}),
    }))

    try {
      const res = await residentsApi.bulkCreate(payload)
      setResult(res)

      let payloadIdx = 0
      setRows(prev =>
        prev.map(r => {
          if (r.name.trim() === '') return r
          const rowResult = res.rows[payloadIdx++]
          if (!rowResult) return r
          return {
            ...r,
            status: rowResult.status === 'created' ? 'saved' : 'error',
            errorMsg: rowResult.reason,
          }
        })
      )

      if (res.created > 0) {
        toast.success(`${res.created} resident${res.created !== 1 ? 's' : ''} saved successfully!`)
      }
      if (res.errors > 0) {
        toast.error(`${res.errors} row${res.errors !== 1 ? 's' : ''} failed — check error indicators`)
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  function StatusCell({ row }: { row: ResidentRow }) {
    if (row.status === 'saving') return <span className="text-blue-500 text-sm">⋯</span>
    if (row.status === 'saved') return <span className="text-green-600 text-sm" title="Saved">✓</span>
    if (row.status === 'error') return (
      <span className="text-red-500 text-sm cursor-help" title={row.errorMsg ?? 'Error'}>✕</span>
    )
    return null
  }

  const allSaved = result !== null && result.errors === 0 && result.created > 0


  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/residents')}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            title="Back to Residents"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Resident Entry</h1>
            <p className="text-sm text-gray-500 mt-0.5">Add multiple residents at once — spreadsheet style</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            disabled={isSaving}
            className="px-3 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Clear All
          </button>
          <button
            onClick={() => addRows(5)}
            disabled={isSaving}
            className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            + Add 5 Rows
          </button>
          <button
            onClick={handleSaveAll}
            disabled={isSaving || validRows.length === 0}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {isSaving ? 'Saving...' : `Save All (${validRows.length})`}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {allSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-800 font-medium">
            ✅ {result.created} resident{result.created !== 1 ? 's' : ''} saved successfully!
          </p>
          <button
            onClick={() => navigate('/admin/residents')}
            className="text-sm text-green-700 font-medium hover:underline"
          >
            Go to Residents →
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <strong>Tips:</strong> Rows with blank Name are ignored. Username + Password are optional — leave both empty to skip login creation.
        Tab between cells for fast entry. Max 100 rows per save.
      </div>

      {/* Spreadsheet table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-500 w-8">#</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[180px]">
                  Name <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[200px]">
                  Email <span className="text-gray-400 text-xs font-normal">(optional)</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[140px]">
                  Phone <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[160px]">
                  Flat <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[120px]">Type</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[150px]">Move-in Date</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[150px]">Username</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[150px]">Password</th>
                <th className="px-3 py-3 text-center font-medium text-gray-500 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    row.status === 'saved' ? 'bg-green-50/60' :
                    row.status === 'error' ? 'bg-red-50/60' :
                    row.name.trim() ? 'hover:bg-gray-50/60' : 'bg-white'
                  }`}
                >
                  <td className="px-3 py-2 text-xs text-gray-400 text-center">{idx + 1}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.name}
                      onChange={e => updateRow(idx, 'name', e.target.value)}
                      placeholder="Full name"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="email"
                      value={row.email}
                      onChange={e => updateRow(idx, 'email', e.target.value)}
                      placeholder="email@example.com"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="tel"
                      value={row.phone}
                      onChange={e => updateRow(idx, 'phone', e.target.value)}
                      placeholder="Enter Mobile Number"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <FlatSearchSelect
                      options={flats}
                      value={row.flatId}
                      onChange={id => updateRow(idx, 'flatId', id)}
                      disabled={row.status === 'saved' || isSaving}
                      placeholder="— Select flat —"
                      compact
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={row.residentType}
                      onChange={e => updateRow(idx, 'residentType', e.target.value)}
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    >
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={row.moveInDate}
                      onChange={e => updateRow(idx, 'moveInDate', e.target.value)}
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.username}
                      onChange={e => updateRow(idx, 'username', e.target.value)}
                      placeholder="Optional"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="password"
                      value={row.password}
                      onChange={e => updateRow(idx, 'password', e.target.value)}
                      placeholder="Optional"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <StatusCell row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add rows footer */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-2">
          <button onClick={() => addRows(1)} disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40">
            + Add Row
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => addRows(5)} disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40">
            + Add 5 Rows
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => addRows(10)} disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40">
            + Add 10 Rows
          </button>
        </div>
      </div>

      {/* Sticky Summary Bar */}
      <div className="sticky bottom-4 z-10">
        <div className="bg-gray-900 text-white rounded-xl shadow-xl px-5 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{rows.length}</p>
              <p className="text-xs text-gray-400">Total Rows</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{nonEmptyRows.length}</p>
              <p className="text-xs text-gray-400">Filled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{validRows.length}</p>
              <p className="text-xs text-gray-400">Valid</p>
            </div>
            {result && result.errors > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{result.errors}</p>
                <p className="text-xs text-gray-400">Errors</p>
              </div>
            )}
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving || validRows.length === 0}
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : `👥 Save ${validRows.length} Resident${validRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}