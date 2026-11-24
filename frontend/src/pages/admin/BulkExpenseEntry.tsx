import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { expensesApi, ExpenseCategoryItem, BulkExpenseResult } from '../../api/expenses'

// ── Row state ─────────────────────────────────────────────────────────────────
interface ExpenseRow {
  title: string
  paidOn: string
  amount: string       // kept as string for input; parsed on submit
  category: string
  vendor: string
  notes: string
  status: 'idle' | 'saving' | 'saved' | 'error'
  errorMsg?: string
}

const TODAY = format(new Date(), 'yyyy-MM-dd')

function emptyRow(defaultCategory: string): ExpenseRow {
  return {
    title: '',
    paidOn: TODAY,
    amount: '',
    category: defaultCategory,
    vendor: '',
    notes: '',
    status: 'idle',
  }
}

const INITIAL_ROWS = 5

// ── Badge colour helper (cycles by category index) ───────────────────────────
const BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-gray-100 text-gray-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-red-100 text-red-700',
  'bg-teal-100 text-teal-700',
]

export default function BulkExpenseEntry() {
  const navigate = useNavigate()

  // ── Fetch active categories ─────────────────────────────────────────────────
  const { data: allCategories = [] } = useQuery<ExpenseCategoryItem[]>({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.categories.list(),
    staleTime: 60_000,
  })
  const categories = allCategories.filter(c => c.isActive)

  // ── Row state ───────────────────────────────────────────────────────────────
  const defaultCat = categories[0]?.slug ?? ''
  const [rows, setRows] = useState<ExpenseRow[]>(() =>
    Array.from({ length: INITIAL_ROWS }, () => emptyRow(''))
  )

  // Once categories load, fill in the default category for idle empty rows
  useEffect(() => {
    if (!defaultCat) return
    setRows(prev =>
      prev.map(r => r.category === '' && r.status === 'idle' ? { ...r, category: defaultCat } : r)
    )
  }, [defaultCat])

  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<BulkExpenseResult | null>(null)

  // ── Cell change handler ─────────────────────────────────────────────────────
  function updateRow(index: number, field: keyof ExpenseRow, value: string) {
    setRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value, status: 'idle', errorMsg: undefined }
      return next
    })
  }

  // ── Add more rows ───────────────────────────────────────────────────────────
  function addRows(count: number) {
    setRows(prev => [...prev, ...Array.from({ length: count }, () => emptyRow(defaultCat))])
  }

  // ── Clear all rows ──────────────────────────────────────────────────────────
  function clearAll() {
    if (!confirm('Clear all rows? This cannot be undone.')) return
    setRows(Array.from({ length: INITIAL_ROWS }, () => emptyRow(defaultCat)))
    setResult(null)
  }

  // ── Computed: non-empty rows + totals ───────────────────────────────────────
  const nonEmptyRows = useMemo(
    () => rows.filter(r => r.title.trim() !== ''),
    [rows]
  )

  const totalAmount = useMemo(
    () => nonEmptyRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [nonEmptyRows]
  )

  const validRows = useMemo(
    () => nonEmptyRows.filter(r => {
      const amt = parseFloat(r.amount)
      return r.title.trim() && r.paidOn && !isNaN(amt) && amt > 0 && r.category
    }),
    [nonEmptyRows]
  )

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSaveAll() {
    if (validRows.length === 0) {
      toast.error('No valid rows to save. Fill in Title, Date, Amount and Category.')
      return
    }

    // Mark rows with validation errors before submitting
    const rowsWithValidation = rows.map(r => {
      if (r.title.trim() === '') return r // blank row — skip
      const amt = parseFloat(r.amount)
      if (!r.paidOn) return { ...r, status: 'error' as const, errorMsg: 'Date required' }
      if (isNaN(amt) || amt <= 0) return { ...r, status: 'error' as const, errorMsg: 'Invalid amount' }
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

    const payload = validRows.map(r => ({
      title: r.title.trim(),
      paidOn: r.paidOn,
      amount: parseFloat(r.amount),
      category: r.category,
      vendor: r.vendor.trim() || undefined,
      notes: r.notes.trim() || undefined,
    }))

    try {
      const res = await expensesApi.bulkCreate(payload)
      setResult(res)

      // Update row statuses based on result
      let payloadIdx = 0
      setRows(prev =>
        prev.map(r => {
          if (r.title.trim() === '') return r
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
        toast.success(`${res.created} expense${res.created !== 1 ? 's' : ''} saved successfully!`)
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

  // ── Row status indicator ────────────────────────────────────────────────────
  function StatusCell({ row }: { row: ExpenseRow }) {
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
            onClick={() => navigate('/admin/expenses')}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            title="Back to Expenses"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bulk Expense Entry</h1>
            <p className="text-sm text-gray-500 mt-0.5">Enter multiple expenses at once — spreadsheet style</p>
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
            ✅ {result.created} expense{result.created !== 1 ? 's' : ''} saved successfully!
          </p>
          <button
            onClick={() => navigate('/admin/expenses')}
            className="text-sm text-green-700 font-medium hover:underline"
          >
            Go to Expenses →
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
        <strong>Tips:</strong> Rows with blank Title are ignored. Tab between cells for fast entry. 
        Category slugs must match active categories. All amounts in ₹ (INR). Max 100 rows per save.
      </div>

      {/* Spreadsheet table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3 text-left font-medium text-gray-500 w-8">#</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[220px]">
                  Title <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[150px]">
                  Date <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[130px]">
                  Amount (₹) <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[160px]">
                  Category <span className="text-red-400">*</span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[160px]">Vendor</th>
                <th className="px-3 py-3 text-left font-medium text-gray-600 min-w-[200px]">Notes</th>
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
                    row.title.trim() ? 'hover:bg-gray-50/60' : 'bg-white'
                  }`}
                >
                  {/* Row number */}
                  <td className="px-3 py-2 text-xs text-gray-400 text-center">{idx + 1}</td>

                  {/* Title */}
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.title}
                      onChange={e => updateRow(idx, 'title', e.target.value)}
                      placeholder="Expense description"
                      disabled={row.status === 'saved' || isSaving}
                      className={`w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400 ${
                        row.status === 'error' && row.title.trim() ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </td>

                  {/* Date */}
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      value={row.paidOn}
                      onChange={e => updateRow(idx, 'paidOn', e.target.value)}
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>

                  {/* Amount */}
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.amount}
                      onChange={e => updateRow(idx, 'amount', e.target.value)}
                      placeholder="0.00"
                      disabled={row.status === 'saved' || isSaving}
                      className={`w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50 text-right ${
                        row.status === 'error' && row.title.trim() && (!row.amount || parseFloat(row.amount) <= 0)
                          ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                  </td>

                  {/* Category */}
                  <td className="px-2 py-1.5">
                    <select
                      value={row.category}
                      onChange={e => updateRow(idx, 'category', e.target.value)}
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    >
                      {categories.length === 0 && (
                        <option value="">Loading...</option>
                      )}
                      {categories.map((c, ci) => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </td>

                  {/* Vendor */}
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.vendor}
                      onChange={e => updateRow(idx, 'vendor', e.target.value)}
                      placeholder="Vendor name"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>

                  {/* Notes */}
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={row.notes}
                      onChange={e => updateRow(idx, 'notes', e.target.value)}
                      placeholder="Optional notes"
                      disabled={row.status === 'saved' || isSaving}
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-50"
                    />
                  </td>

                  {/* Status */}
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
          <button
            onClick={() => addRows(1)}
            disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40"
          >
            + Add Row
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => addRows(5)}
            disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40"
          >
            + Add 5 Rows
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => addRows(10)}
            disabled={isSaving}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-40"
          >
            + Add 10 Rows
          </button>
        </div>
      </div>

      {/* ── Sticky Summary Bar ──────────────────────────────────────────────── */}
      <div className="sticky bottom-4 z-10">
        <div className="bg-gray-900 text-white rounded-xl shadow-xl px-5 py-4 flex items-center justify-between flex-wrap gap-4">
          {/* Stats */}
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

          {/* Total Amount */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Amount</p>
              <p className="text-2xl font-bold text-yellow-300">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={handleSaveAll}
              disabled={isSaving || validRows.length === 0}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : `💾 Save ${validRows.length} Expense${validRows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}