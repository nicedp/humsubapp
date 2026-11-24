import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  bulkCreateHelpers,
  BulkHelperItem,
  BulkHelperResult,
} from '../../api/helpers'
import {
  HELPER_CATEGORIES,
  HELPER_CATEGORY_LABELS,
  HELPER_CATEGORY_ICONS,
} from '../../constants/labels'

// ── Row state ─────────────────────────────────────────────────────────────────
interface HelperRow {
  name: string
  phone: string
  alternatePhone: string
  email: string
  category: string
  description: string
  isActive: boolean
  status: 'idle' | 'saving' | 'saved' | 'error'
  errorMsg?: string
}

function emptyRow(): HelperRow {
  return {
    name: '',
    phone: '',
    alternatePhone: '',
    email: '',
    category: HELPER_CATEGORIES[0] ?? 'electrician',
    description: '',
    isActive: true,
    status: 'idle',
  }
}

const INITIAL_ROWS = 5

export default function BulkHelperEntry() {
  const navigate = useNavigate()

  const [rows, setRows] = useState<HelperRow[]>(() =>
    Array.from({ length: INITIAL_ROWS }, emptyRow)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<BulkHelperResult | null>(null)

  function updateRow(index: number, field: keyof HelperRow, value: string | boolean) {
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

  const nonEmptyRows = useMemo(
    () => rows.filter(r => r.name.trim() !== ''),
    [rows]
  )

  const validRows = useMemo(
    () => nonEmptyRows.filter(r => r.name.trim() && r.phone.trim() && r.category),
    [nonEmptyRows]
  )

  async function handleSaveAll() {
    if (validRows.length === 0) {
      toast.error('No valid rows to save. Fill in Name, Phone and Category.')
      return
    }

    const rowsWithValidation = rows.map(r => {
      if (r.name.trim() === '') return r
      if (!r.phone.trim()) return { ...r, status: 'error' as const, errorMsg: 'Phone required' }
      if (!r.category) return { ...r, status: 'error' as const, errorMsg: 'Category required' }
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

    const payload: BulkHelperItem[] = validRows.map(r => ({
      name: r.name.trim(),
      phone: r.phone.trim(),
      alternatePhone: r.alternatePhone.trim() || undefined,
      email: r.email.trim() || undefined,
      category: r.category,
      description: r.description.trim() || undefined,
      isActive: r.isActive,
    }))

    try {
      const res = await bulkCreateHelpers(payload)
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
        toast.success(`${res.created} helper${res.created !== 1 ? 's' : ''} saved successfully!`)
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

  function StatusCell({ row }: { row: HelperRow }) {
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
            onClick={() => navigate('/admin/helpers')}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            title="Back to Helpers"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Helper Entry</h1>
            <p className="text-sm text-gray-500 mt-0.5">Add multiple helpers at once — spreadsheet style</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearAll} disabled={isSaving}
            className="px-3 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 disabled:opacity-40">
            Clear All
          </button>
          <button onClick={() => addRows(5)} disabled={isSaving}
            className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40">
            + Add 5 Rows
          </button>
          <button onClick={handleSaveAll} disabled={isSaving || validRows.length === 0}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
            {isSaving ? 'Saving...' : `Save All (${validRows.length})`}
          </button>
        </div>
      </div>

      {/* Success banner */}
      {allSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-green-800 font-medium">
            ✅ {result.created} helper{result.created !== 1 ? 's' : ''} saved successfully!
          </p>
          <button onClick={() => navigate('/admin/helpers')}
            className="text-sm text-green-700 font-medium hover:underline">
            Go to Helpers →
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <strong>Tips:</strong> Rows with blank Name are ignored. Name, Phone and Category are required per row.
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
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[160px]">
                  Category <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[140px]">
                  Phone <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[140px]">Alt. Phone</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[180px]">Email</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[200px]">Description</th>
                <th className="px-3 py-3 text-center font-medium text-gray-600 min-w-[80px]">Active</th>
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
                    <input type="text" value={row.name}
                      onChange={e => updateRow(idx, 'name', e.target.value)}
                      placeholder="Helper's name"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={row.category}
                      onChange={e => updateRow(idx, 'category', e.target.value)}
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50">
                      {HELPER_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {HELPER_CATEGORY_ICONS[cat]} {HELPER_CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="tel" value={row.phone}
                      onChange={e => updateRow(idx, 'phone', e.target.value)}
                      placeholder="Enter Mobile Number"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="tel" value={row.alternatePhone}
                      onChange={e => updateRow(idx, 'alternatePhone', e.target.value)}
                      placeholder="Optional"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="email" value={row.email}
                      onChange={e => updateRow(idx, 'email', e.target.value)}
                      placeholder="email@example.com"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="text" value={row.description}
                      onChange={e => updateRow(idx, 'description', e.target.value)}
                      placeholder="Notes, area served…"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-gray-50"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input type="checkbox" checked={row.isActive}
                      onChange={e => updateRow(idx, 'isActive', e.target.checked)}
                      disabled={row.status === 'saved' || isSaving}
                      className="rounded accent-indigo-600"
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
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40">
            + Add Row
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => addRows(5)} disabled={isSaving}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40">
            + Add 5 Rows
          </button>
          <span className="text-gray-300">|</span>
          <button onClick={() => addRows(10)} disabled={isSaving}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40">
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
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : `🔧 Save ${validRows.length} Helper${validRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}