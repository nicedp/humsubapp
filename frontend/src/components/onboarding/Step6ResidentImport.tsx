import React, { useRef, useState } from 'react'
import { importApi, ImportResult } from '../../api/import'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export default function Step6ResidentImport({ onNext, onSkip }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, setIsPending] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError(null)
    setImportResult(null)
    setIsPending(true)

    try {
      const result = await importApi.importResidents(file)
      setImportResult(result)
    } catch (err: any) {
      setUploadError(err?.response?.data?.message ?? 'Upload failed. Please check the file format.')
    } finally {
      setIsPending(false)
      // Reset input so same file can be re-uploaded after fixing errors
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const hasSuccessfulImport = importResult && importResult.created > 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">👥 Step 6 — Resident Import</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import your existing residents via CSV. Download the template, fill in your data,
          then upload it here. This step is optional — you can always add residents later.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* CSV Import Card */}
        <div className="md:col-span-2 border-2 border-blue-200 rounded-xl p-6 bg-blue-50">
          <div className="text-3xl mb-3">📋</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Import via CSV</h3>

          {/* Column format + download template */}
          <div className="bg-white border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-gray-600 mb-1">Required columns:</p>
            <code className="text-xs text-gray-500 break-all">
              Sr, FlatNumber, FlatSize, ResidentName, PhoneNumber, Email, OwnerType, ParkingNumber
            </code>
            <div className="mt-2 text-xs text-gray-500 space-y-0.5">
              <p>• <strong>OwnerType</strong>: <code>owner</code> or <code>tenant</code></p>
              <p>• <strong>ParkingNumber</strong>: slot (e.g. <code>P-001</code>) or <code>not allotted</code></p>
              <p>• Login auto-created — username from email, password = phone number</p>
            </div>
            <button
              type="button"
              onClick={importApi.downloadTemplate}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
            >
              ⬇ Download CSV Template (1 sample record)
            </button>
          </div>

          {/* Upload drop zone */}
          <div
            onClick={() => !isPending && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isPending
                ? 'border-blue-300 bg-blue-50 cursor-wait'
                : 'border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer'
            }`}
          >
            <div className="text-3xl mb-2">{isPending ? '⏳' : '📂'}</div>
            {isPending ? (
              <p className="text-sm text-blue-600 font-medium">Processing your CSV...</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Click to upload your filled CSV</p>
                <p className="text-xs text-gray-400 mt-1">Max 5 MB · .csv files only</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Upload error */}
          {uploadError && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              ⚠️ {uploadError}
            </div>
          )}

          {/* Import results */}
          {importResult && (
            <div className="mt-4">
              {/* Summary counts */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-gray-800">{importResult.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="bg-green-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-green-700">{importResult.created}</p>
                  <p className="text-xs text-green-600">Created</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-yellow-700">{importResult.skipped}</p>
                  <p className="text-xs text-yellow-600">Skipped</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-red-700">{importResult.errors}</p>
                  <p className="text-xs text-red-600">Errors</p>
                </div>
              </div>

              {/* Success banner */}
              {hasSuccessfulImport && (
                <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-800 font-medium">
                  ✅ {importResult.created} resident{importResult.created !== 1 ? 's' : ''} imported successfully! Click "Continue" below.
                </div>
              )}

              {/* Per-row detail table */}
              <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      {['Sr', 'Flat', 'Resident', 'Status', 'Reason'].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {importResult.rows.map(row => (
                      <tr
                        key={row.sr}
                        className={
                          row.status === 'created' ? 'bg-green-50' :
                          row.status === 'skipped' ? 'bg-yellow-50' : 'bg-red-50'
                        }
                      >
                        <td className="px-3 py-1.5 text-gray-500">{row.sr}</td>
                        <td className="px-3 py-1.5 font-medium text-gray-800">{row.flatNumber}</td>
                        <td className="px-3 py-1.5 text-gray-700">{row.residentName}</td>
                        <td className="px-3 py-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                            row.status === 'created' ? 'bg-green-200 text-green-800' :
                            row.status === 'skipped' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-red-200 text-red-800'
                          }`}>{row.status}</span>
                        </td>
                        <td className="px-3 py-1.5 text-gray-500">{row.reason ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Re-upload hint if there were errors */}
              {importResult.errors > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Fix the errored rows and upload the corrected CSV to try again.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Skip Card */}
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col">
          <div className="text-3xl mb-3">⏭️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Skip for now</h3>
          <p className="text-sm text-gray-600 mb-4 flex-1">
            Add residents later from the admin panel. Residents can also be added individually
            from the <span className="font-medium text-gray-800">Residents</span> page at any time.
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 px-4 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Skip this step
          </button>
        </div>
      </div>

      {/* Info: what residents get access to */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-semibold text-green-900 mb-2">✅ What residents get access to</h4>
        <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
          <div className="flex items-center gap-1.5"><span>•</span><span>View & pay maintenance bills</span></div>
          <div className="flex items-center gap-1.5"><span>•</span><span>Submit complaints</span></div>
          <div className="flex items-center gap-1.5"><span>•</span><span>Resident directory</span></div>
          <div className="flex items-center gap-1.5"><span>•</span><span>Society notices</span></div>
          <div className="flex items-center gap-1.5"><span>•</span><span>Visitor management</span></div>
          <div className="flex items-center gap-1.5"><span>•</span><span>Parking slot requests</span></div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div />
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-8 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}