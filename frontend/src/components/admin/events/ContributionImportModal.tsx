import { useState, useRef } from 'react'
import { eventsApi, ImportContributionResult } from '../../../api/events'

interface Props {
  eventId: string
  eventName: string
  onClose: () => void
  onImported: () => void
}

const CSV_COLUMNS = ['contributorName', 'amount', 'paymentMode', 'paidOn', 'notes']

export default function ContributionImportModal({ eventId, eventName, onClose, onImported }: Props) {
  const [csvText, setCsvText] = useState('')
  const [fileName, setFileName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<ImportContributionResult | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const text = await file.text()
    setCsvText(text)
    setResult(null)
    setError('')
  }

  const handleImport = async () => {
    if (!csvText.trim()) { setError('Please select or paste a CSV file first.'); return }
    setIsPending(true)
    setError('')
    setResult(null)
    try {
      const res = await eventsApi.importContributions(eventId, csvText)
      setResult(res)
      if (res.imported > 0) onImported()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Import failed. Please check your CSV and try again.')
    } finally {
      setIsPending(false)
    }
  }

  const handleDownloadTemplate = () => {
    eventsApi.downloadContributionTemplate()
  }

  const statusIcon = (s: string) => {
    if (s === 'imported') return <span className="text-green-500 font-bold">✓</span>
    if (s === 'error') return <span className="text-red-500 font-bold">✕</span>
    return <span className="text-gray-400">—</span>
  }

  const rowBg = (s: string) => {
    if (s === 'imported') return 'bg-green-50'
    if (s === 'error') return 'bg-red-50'
    return 'bg-yellow-50'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">📥 Import Contributions from CSV</h3>
            <p className="text-xs text-gray-500 mt-0.5">{eventName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <div className="p-6 space-y-5">
          {/* Format guide */}
          <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold text-sm mb-2">📋 CSV Format</p>
            <p>Expected columns (in order):</p>
            <code className="block bg-white rounded px-3 py-2 text-xs font-mono text-gray-700 mt-1">
              {CSV_COLUMNS.join(', ')}
            </code>
            <ul className="mt-2 space-y-0.5 list-disc list-inside text-blue-700">
              <li><strong>contributorName</strong> — required</li>
              <li><strong>amount</strong> — required, positive number</li>
              <li><strong>paymentMode</strong> — cash / upi / bank_transfer / cheque (default: cash)</li>
              <li><strong>paidOn</strong> — optional, YYYY-MM-DD format</li>
              <li><strong>notes</strong> — optional</li>
            </ul>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="mt-2 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs underline underline-offset-2"
            >
              ⬇️ Download sample template
            </button>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="border border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50 rounded-xl px-5 py-3 text-sm text-gray-600 font-medium transition-colors flex items-center gap-2"
              >
                📂 {fileName || 'Choose CSV file…'}
              </button>
              {fileName && (
                <button
                  type="button"
                  onClick={() => { setCsvText(''); setFileName(''); setResult(null); setError(''); if (fileRef.current) fileRef.current.value = '' }}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  ✕ Clear
                </button>
              )}
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Paste area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste CSV content directly
            </label>
            <textarea
              value={csvText}
              onChange={e => { setCsvText(e.target.value); setResult(null); setError('') }}
              rows={6}
              placeholder={`contributorName,amount,paymentMode,paidOn,notes\nRamesh Kumar,500,cash,2026-09-15,Diwali donation\nPriya Sharma,1000,upi,2026-09-16,`}
              className="w-full border rounded-xl px-4 py-3 text-xs font-mono focus:ring-2 focus:ring-orange-300 focus:outline-none resize-y"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Result summary */}
          {result && (
            <div className="space-y-3">
              <div className={`rounded-xl px-4 py-3 text-sm font-medium flex gap-6 ${result.errors === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'}`}>
                <span>✅ Imported: <strong>{result.imported}</strong></span>
                {result.skipped > 0 && <span>⏭ Skipped: <strong>{result.skipped}</strong></span>}
                {result.errors > 0 && <span>❌ Errors: <strong>{result.errors}</strong></span>}
              </div>

              {/* Per-row result table */}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-left uppercase border-b">
                      <th className="px-3 py-2 font-semibold w-12">Row</th>
                      <th className="px-3 py-2 font-semibold">Contributor</th>
                      <th className="px-3 py-2 font-semibold w-20 text-center">Status</th>
                      <th className="px-3 py-2 font-semibold">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((r, i) => (
                      <tr key={i} className={`${rowBg(r.status)} border-b last:border-0`}>
                        <td className="px-3 py-1.5 text-gray-400">{r.row}</td>
                        <td className="px-3 py-1.5 font-medium text-gray-700">{r.contributorName || <em className="text-gray-300">blank</em>}</td>
                        <td className="px-3 py-1.5 text-center">{statusIcon(r.status)}</td>
                        <td className="px-3 py-1.5 text-gray-500">{r.reason ?? ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              {result?.errors === 0 && result?.imported > 0 ? 'Close' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={isPending || !csvText.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? '⋯ Importing…' : '📥 Import Contributions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
