import React, { useRef } from 'react'
import { importApi, ImportResult } from '../../../api/import'

interface Props {
  isPending: boolean
  importResult: ImportResult | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClose: () => void
}

export default function ImportModal({ isPending, importResult, onFileChange, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Import Residents from CSV</h2>
            <p className="text-sm text-gray-500 mt-0.5">Upload a CSV to bulk-create flats, residents and parking assignments</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Format guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5">
          <p className="text-xs font-semibold text-gray-700 mb-2">CSV columns (comma-separated, first 8 required):</p>
          <code className="text-xs text-gray-600 break-all">
            Sr, FlatNumber, FlatSize, ResidentName, PhoneNumber, Email, OwnerType, ParkingNumber, BlockName, PropertyType, Floor
          </code>
          <div className="mt-2 text-xs text-gray-500 space-y-0.5">
            <p>• <strong>OwnerType</strong>: <code>owner</code> or <code>tenant</code></p>
            <p>• <strong>ParkingNumber</strong>: slot number (e.g. <code>P-001</code>) or <code>not allotted</code></p>
            <p>• <strong>BlockName</strong>: e.g. <code>Block A</code> — if empty/not found, uses first existing block or creates "Main Block"</p>
            <p>• <strong>PropertyType</strong>: <code>Flat</code>, <code>Penthouse</code>, <code>Row House</code>, <code>Duplex</code>, <code>Triplex</code>, <code>Bungalow</code> — defaults to Flat if blank</p>
            <p>• <strong>Floor</strong>: number (e.g. <code>1</code>) or word (<code>Ground</code>, <code>First</code>, <code>Basement</code>) — leave blank for row houses</p>
            <p>• Login username auto-generated from email; default password = phone number</p>
            <p>• Rows with existing email are skipped (not duplicated)</p>
          </div>
          <button onClick={importApi.downloadTemplate} className="mt-3 text-xs text-blue-600 hover:underline">
            ⬇ Download example template
          </button>
        </div>

        {/* Upload area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="text-4xl mb-2">📂</div>
          {isPending ? (
            <p className="text-sm text-blue-600 font-medium">Processing...</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Click to select a CSV file</p>
              <p className="text-xs text-gray-400 mt-1">Max file size: 5 MB</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFileChange} />
        </div>

        {/* Results table */}
        {importResult && (
          <div className="mt-5">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-gray-800">{importResult.total}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-green-700">{importResult.created}</p>
                <p className="text-xs text-green-600">Created</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-yellow-700">{importResult.skipped}</p>
                <p className="text-xs text-yellow-600">Skipped</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-red-700">{importResult.errors}</p>
                <p className="text-xs text-red-600">Errors</p>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-lg">
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
                    <tr key={row.sr} className={
                      row.status === 'created' ? 'bg-green-50' :
                      row.status === 'skipped' ? 'bg-yellow-50' : 'bg-red-50'
                    }>
                      <td className="px-3 py-2 text-gray-500">{row.sr}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{row.flatNumber}</td>
                      <td className="px-3 py-2 text-gray-700">{row.residentName}</td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${
                          row.status === 'created' ? 'bg-green-200 text-green-800' :
                          row.status === 'skipped' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-red-200 text-red-800'
                        }`}>{row.status}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">{row.reason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  )
}