import { useState, useCallback } from 'react'
import { eventsApi, BulkContributionResult } from '../../../api/events'

const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque']

interface RowState {
  contributorName: string
  amount: string
  paymentMode: string
  paidOn: string
  notes: string
  status: 'idle' | 'saving' | 'saved' | 'error'
  errorMsg?: string
}

function emptyRow(): RowState {
  return { contributorName: '', amount: '', paymentMode: 'cash', paidOn: '', notes: '', status: 'idle' }
}

const MIN_ROWS = 5

interface Props {
  eventId: string
  eventName: string
  onClose: () => void
  onSaved: () => void
}

export default function BulkContributionModal({ eventId, eventName, onClose, onSaved }: Props) {
  const [rows, setRows] = useState<RowState[]>(() => Array.from({ length: MIN_ROWS }, emptyRow))
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<BulkContributionResult | null>(null)

  const updateRow = useCallback((idx: number, field: keyof RowState, value: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r))
  }, [])

  const addRow = () => setRows(prev => [...prev, emptyRow()])

  const removeRow = (idx: number) => {
    setRows(prev => prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx))
  }

  // valid = has name + valid positive amount + not yet saved
  const validRows = rows.filter(r => r.status !== 'saved' && r.contributorName.trim() && parseFloat(r.amount) > 0)

  const totalAmount = validRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)

  const handleSave = async () => {
    if (validRows.length === 0) return
    setSaving(true)
    try {
      const payload = rows
        .map((r, i) => ({ ...r, _idx: i }))
        .filter(r => r.status !== 'saved' && r.contributorName.trim() && parseFloat(r.amount) > 0)
        .map(r => ({
          _idx: r._idx,
          contributorName: r.contributorName.trim(),
          amount: parseFloat(r.amount),
          paymentMode: r.paymentMode,
          paidOn: r.paidOn || undefined,
          notes: r.notes.trim() || undefined,
        }))

      const res = await eventsApi.bulkAddContributions(
        eventId,
        payload.map(({ _idx: _, ...rest }) => rest),
      )
      setResult(res)

      // Map result rows back to original row indices
      setRows(prev => {
        const updated = [...prev]
        let payloadIdx = 0
        for (let i = 0; i < updated.length; i++) {
          if (updated[i].status !== 'saved' && updated[i].contributorName.trim() && parseFloat(updated[i].amount) > 0) {
            const row = res.rows[payloadIdx]
            if (row) {
              updated[i] = {
                ...updated[i],
                status: row.status === 'created' ? 'saved' : 'error',
                errorMsg: row.reason,
              }
            }
            payloadIdx++
          }
        }
        return updated
      })

      if (res.errors === 0) {
        onSaved()
      }
    } catch {
      // network-level failure
    } finally {
      setSaving(false)
    }
  }

  const savedCount = rows.filter(r => r.status === 'saved').length
  const errorCount = rows.filter(r => r.status === 'error').length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">⚡ Bulk Contributions</h3>
            <p className="text-xs text-gray-500 mt-0.5">{eventName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        {/* Result banner */}
        {result && (
          <div className={`mx-6 mt-4 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${result.errors === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {result.errors === 0
              ? `✅ All ${result.created} contributions saved successfully!`
              : `⚠️ ${result.created} saved, ${result.errors} failed — fix the highlighted rows and save again.`}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto px-6 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="pb-2 pr-2 font-semibold w-8">#</th>
                <th className="pb-2 pr-2 font-semibold min-w-[180px]">Contributor Name *</th>
                <th className="pb-2 pr-2 font-semibold w-28">Amount ₹ *</th>
                <th className="pb-2 pr-2 font-semibold w-32">Payment Mode</th>
                <th className="pb-2 pr-2 font-semibold w-36">Date Paid</th>
                <th className="pb-2 pr-2 font-semibold min-w-[140px]">Notes</th>
                <th className="pb-2 font-semibold w-10">St.</th>
                <th className="pb-2 font-semibold w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const isSaved = row.status === 'saved'
                const isError = row.status === 'error'
                const rowBg = isSaved ? 'bg-green-50' : isError ? 'bg-red-50' : ''
                return (
                  <tr key={idx} className={`${rowBg} border-b last:border-0`}>
                    <td className="py-1.5 pr-2 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={row.contributorName}
                        onChange={e => updateRow(idx, 'contributorName', e.target.value)}
                        disabled={isSaved}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      {isError && row.errorMsg && (
                        <p className="text-red-500 text-xs mt-0.5">{row.errorMsg}</p>
                      )}
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={row.amount}
                        onChange={e => updateRow(idx, 'amount', e.target.value)}
                        disabled={isSaved}
                        type="number"
                        min="1"
                        placeholder="500"
                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <select
                        value={row.paymentMode}
                        onChange={e => updateRow(idx, 'paymentMode', e.target.value)}
                        disabled={isSaved}
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={row.paidOn}
                        onChange={e => updateRow(idx, 'paidOn', e.target.value)}
                        disabled={isSaved}
                        type="date"
                        className="w-full border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="py-1.5 pr-2">
                      <input
                        value={row.notes}
                        onChange={e => updateRow(idx, 'notes', e.target.value)}
                        disabled={isSaved}
                        placeholder="Optional"
                        className="w-full border rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      />
                    </td>
                    <td className="py-1.5 text-center text-lg">
                      {row.status === 'saving' && <span className="text-gray-400 text-xs">⋯</span>}
                      {row.status === 'saved' && <span className="text-green-500">✓</span>}
                      {row.status === 'error' && <span className="text-red-500">✕</span>}
                    </td>
                    <td className="py-1.5 text-center">
                      {!isSaved && (
                        <button
                          onClick={() => removeRow(idx)}
                          className="text-gray-300 hover:text-red-400 text-lg leading-none"
                          title="Remove row"
                        >×</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Add row */}
        <div className="px-6 pt-3">
          <button onClick={addRow}
            className="text-orange-500 hover:text-orange-700 text-sm font-medium flex items-center gap-1">
            + Add Row
          </button>
        </div>

        {/* Sticky summary bar */}
        <div className="sticky bottom-0 bg-gray-900 text-white rounded-b-2xl px-6 py-3 flex items-center justify-between mt-4">
          <div className="flex items-center gap-6 text-sm">
            <span>
              <span className="text-gray-400">Rows: </span>
              <span className="font-semibold">{validRows.length} pending</span>
              {savedCount > 0 && <span className="text-green-400 ml-2">· {savedCount} saved</span>}
              {errorCount > 0 && <span className="text-red-400 ml-2">· {errorCount} failed</span>}
            </span>
            <span>
              <span className="text-gray-400">Total: </span>
              <span className="font-semibold text-green-300">₹{totalAmount.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="border border-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
              {result?.errors === 0 ? 'Close' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || validRows.length === 0}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
              {saving ? '⋯ Saving…' : `💾 Save ${validRows.length} Contribution${validRows.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
