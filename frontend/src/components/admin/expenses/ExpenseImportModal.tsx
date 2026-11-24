import React, { useRef, useState } from 'react'
import { expensesApi, ImportExpenseResult } from '../../../api/expenses'

interface Props {
  onClose: () => void
  onImported: () => void
}

export default function ExpenseImportModal({ onClose, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<ImportExpenseResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate MIME type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      setError('Please select a valid CSV file (.csv)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large — maximum 5 MB')
      return
    }

    setError(null)
    setResult(null)
    setIsPending(true)

    try {
      const text = await file.text()
      const importResult = await expensesApi.importCsv(text)
      setResult(importResult)
      if (importResult.imported > 0) {
        onImported()
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Import failed')
    } finally {
      setIsPending(false)
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hasResult = result !== null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Import Expenses from CSV</h2>
            <p className="text-xs text-gray-500 mt-0.5">Upload a CSV file to bulk-import expense records</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Format guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">CSV Format (comma-separated, header required)</p>
            <code className="text-xs text-blue-700 block break-all">
              Title,Date,Amount,Category,Vendor,Notes
            </code>
            <div className="mt-3 text-xs text-blue-700 space-y-1">
              <p>• <strong>Title</strong>: required — description of the expense</p>
              <p>• <strong>Date</strong>: required — format <code className="bg-blue-100 px-1 rounded">YYYY-MM-DD</code> (e.g. 2026-06-01)</p>
              <p>• <strong>Amount</strong>: required — positive number (e.g. 5000 or 1200.50)</p>
              <p>• <strong>Category</strong>: required — must match an active category slug (e.g. <code className="bg-blue-100 px-1 rounded">maintenance</code>, <code className="bg-blue-100 px-1 rounded">utilities</code>)</p>
              <p>• <strong>Vendor</strong>: optional — vendor / supplier name</p>
              <p>• <strong>Notes</strong>: optional — additional details</p>
            </div>
            <button
              onClick={expensesApi.downloadTemplate}
              className="mt-3 text-xs text-blue-700 font-medium hover:text-blue-900 flex items-center gap-1 hover:underline"
            >
              ⬇ Download example template
            </button>
          </div>

          {/* Upload area */}
          <div
            onClick={() => !isPending && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isPending
                ? 'border-blue-300 bg-blue-50 cursor-wait'
                : 'border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <div className="text-4xl mb-2">{isPending ? '⏳' : '📂'}</div>
            {isPending ? (
              <p className="text-sm text-blue-600 font-medium animate-pulse">Processing file...</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Click to select a CSV file</p>
                <p className="text-xs text-gray-400 mt-1">Max file size: 5 MB</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isPending}
            />
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* Results */}
          {hasResult && (
            <div>
              {/* Summary KPI strip */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                  <p className="text-xl font-bold text-gray-800">{result.total}</p>
                  <p className="text-xs text-gray-500">Total Rows</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
                  <p className="text-xl font-bold text-green-700">{result.imported}</p>
                  <p className="text-xs text-green-600">Imported</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center border border-yellow-100">
                  <p className="text-xl font-bold text-yellow-700">{result.skipped}</p>
                  <p className="text-xs text-yellow-600">Skipped</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
                  <p className="text-xl font-bold text-red-700">{result.errors}</p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {/* Per-row table */}
              {result.rows.length > 0 && (
                <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {['Row', 'Title', 'Status', 'Reason'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {result.rows.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.status === 'imported' ? 'bg-green-50' :
                            row.status === 'skipped' ? 'bg-yellow-50' : 'bg-red-50'
                          }
                        >
                          <td className="px-3 py-2 text-gray-500">{row.row}</td>
                          <td className="px-3 py-2 font-medium text-gray-800 max-w-[200px] truncate">{row.title}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                              row.status === 'imported' ? 'bg-green-200 text-green-800' :
                              row.status === 'skipped' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-red-200 text-red-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-500 max-w-[250px] truncate">{row.reason ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.imported > 0 && result.errors === 0 && (
                <p className="text-sm text-green-700 font-medium mt-3 text-center">
                  ✅ All {result.imported} expense{result.imported !== 1 ? 's' : ''} imported successfully!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
          <p className="text-xs text-gray-400">
            {hasResult && result.errors > 0
              ? `Fix the ${result.errors} error${result.errors !== 1 ? 's' : ''} in your CSV and re-upload`
              : 'Select a CSV file to begin import'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
          >
            {hasResult && result.imported > 0 ? 'Done' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}