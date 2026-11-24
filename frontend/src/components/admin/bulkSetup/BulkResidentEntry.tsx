import { useState, useCallback } from 'react'
import { residentsApi } from '../../../api/residents'
import { BulkCreatedFlat } from '../../../api/flats'

interface ResidentRow {
  flatId: string
  flatNumber: string
  name: string
  phone: string
  email: string
  residentType: 'owner' | 'tenant'
  moveInDate: string
  showCredentials: boolean  // toggle per-row
  username: string
  password: string
  // local state
  status: 'idle' | 'saving' | 'saved' | 'error'
  errorMsg: string
}

interface Props {
  flats: BulkCreatedFlat[]
  onDone: () => void
  onSkip: () => void
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function makeRows(flats: BulkCreatedFlat[]): ResidentRow[] {
  return flats.map(f => ({
    flatId: f.id,
    flatNumber: f.flatNumber,
    name: '',
    phone: '',
    email: '',
    residentType: 'owner',
    moveInDate: today(),
    showCredentials: false,
    username: '',
    password: '',
    status: 'idle',
    errorMsg: '',
  }))
}

export default function BulkResidentEntry({ flats, onDone, onSkip }: Props) {
  const [rows, setRows] = useState<ResidentRow[]>(() => makeRows(flats))
  const [saving, setSaving] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  const filledRows = rows.filter(r => r.name.trim())

  function updateRow(idx: number, patch: Partial<ResidentRow>) {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, ...patch } : r))
  }

  function toggleCredentials(idx: number) {
    setRows(prev => prev.map((r, i) => i === idx
      ? { ...r, showCredentials: !r.showCredentials, username: '', password: '', status: 'idle', errorMsg: '' }
      : r
    ))
  }

  // Validate a single row — returns error message or ''
  function validateRow(r: ResidentRow): string {
    if (!r.name.trim()) return ''  // blank name = skip row
    if (r.username.trim() && !r.password.trim()) return 'Password required when username is set'
    return ''
  }

  const handleSave = useCallback(async () => {
    const rowsToSave = rows.filter(r => r.name.trim())
    if (rowsToSave.length === 0) { onSkip(); return }

    // Mark validation errors
    const validationErrors = rows.map(validateRow)
    const hasErrors = validationErrors.some(e => e !== '')
    if (hasErrors) {
      setRows(prev => prev.map((r, i) => validationErrors[i] ? { ...r, status: 'error', errorMsg: validationErrors[i] } : r))
      return
    }

    setSaving(true)
    let count = 0

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      if (!r.name.trim()) continue

      updateRow(i, { status: 'saving', errorMsg: '' })
      try {
        await residentsApi.create({
          name: r.name.trim(),
          phone: r.phone.trim() || undefined,
          email: r.email.trim() || undefined,
          flatId: r.flatId,
          residentType: r.residentType,
          moveInDate: r.moveInDate,
          isActive: true,
          ...(r.username.trim() ? {
            username: r.username.trim(),
            password: r.password.trim(),
          } : {}),
        } as any)
        updateRow(i, { status: 'saved' })
        count++
      } catch (e: any) {
        const msg = e?.response?.data?.message ?? 'Failed to save'
        updateRow(i, { status: 'error', errorMsg: msg })
      }
    }

    setSavedCount(count)
    setSaving(false)

    setRows(prev => {
      const stillHasErrors = prev.some(r => r.name.trim() && r.status === 'error')
      if (!stillHasErrors) {
        setTimeout(onDone, 600)
      }
      return prev
    })
  }, [rows, onDone, onSkip])

  if (flats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-sm">No flats were created.</p>
        <button onClick={onSkip} className="mt-3 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Continue →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Add Residents <span className="text-gray-400 font-normal">(optional)</span></h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Fill in resident details for newly created flats. Leave name blank to skip a flat.
          </p>
        </div>
        <button
          onClick={onSkip}
          className="text-xs text-gray-500 underline hover:text-gray-700 transition shrink-0 mt-0.5"
        >
          Skip All →
        </button>
      </div>

      {/* Summary pill */}
      <div className="flex items-center gap-2 text-xs">
        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
          {flats.length} flats created
        </span>
        {filledRows.length > 0 && (
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {filledRows.length} residents to add
          </span>
        )}
        {savedCount > 0 && (
          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
            ✓ {savedCount} saved
          </span>
        )}
      </div>

      {/* Spreadsheet table — 6 core columns + status + credentials expander */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left font-semibold text-gray-600 w-20">Flat</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600 w-36">Name</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600 w-28">Phone</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600 w-40">Email</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600 w-24">Type</th>
              <th className="px-2 py-2 text-left font-semibold text-gray-600 w-28">Move-in</th>
              <th className="px-2 py-2 text-center font-semibold text-gray-600 w-24">Login?</th>
              <th className="px-2 py-2 w-6"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <>
                {/* Main row */}
                <tr
                  key={row.flatId}
                  className={`border-b border-gray-100 ${
                    row.status === 'saved' ? 'bg-green-50' :
                    row.status === 'error' ? 'bg-red-50' :
                    row.status === 'saving' ? 'bg-blue-50 opacity-70' :
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${row.showCredentials ? '' : 'last:border-0'}`}
                >
                  {/* Flat number */}
                  <td className="px-3 py-1.5 font-mono font-semibold text-gray-700 whitespace-nowrap">
                    {row.flatNumber}
                  </td>

                  {/* Name */}
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      value={row.name}
                      onChange={e => updateRow(idx, { name: e.target.value, status: 'idle', errorMsg: '' })}
                      placeholder="Resident name"
                      disabled={saving || row.status === 'saved'}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>

                  {/* Phone */}
                  <td className="px-2 py-1">
                    <input
                      type="tel"
                      value={row.phone}
                      onChange={e => updateRow(idx, { phone: e.target.value })}
                      placeholder="Phone"
                      disabled={saving || row.status === 'saved'}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>

                  {/* Email */}
                  <td className="px-2 py-1">
                    <input
                      type="email"
                      value={row.email}
                      onChange={e => updateRow(idx, { email: e.target.value })}
                      placeholder="Email"
                      disabled={saving || row.status === 'saved'}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>

                  {/* Type */}
                  <td className="px-2 py-1">
                    <select
                      value={row.residentType}
                      onChange={e => updateRow(idx, { residentType: e.target.value as 'owner' | 'tenant' })}
                      disabled={saving || row.status === 'saved'}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                    >
                      <option value="owner">Owner</option>
                      <option value="tenant">Tenant</option>
                    </select>
                  </td>

                  {/* Move-in date */}
                  <td className="px-2 py-1">
                    <input
                      type="date"
                      value={row.moveInDate}
                      onChange={e => updateRow(idx, { moveInDate: e.target.value })}
                      disabled={saving || row.status === 'saved'}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>

                  {/* Login credentials toggle */}
                  <td className="px-2 py-1 text-center">
                    {row.status !== 'saved' && (
                      <button
                        type="button"
                        onClick={() => toggleCredentials(idx)}
                        disabled={saving}
                        title={row.showCredentials ? 'Hide login fields' : 'Set login credentials'}
                        className={`text-xs px-2 py-0.5 rounded border transition font-medium ${
                          row.showCredentials
                            ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        } disabled:opacity-40`}
                      >
                        {row.showCredentials ? '🔒 Hide' : '🔑 Login'}
                      </button>
                    )}
                  </td>

                  {/* Status indicator */}
                  <td className="px-2 py-1 text-center">
                    {row.status === 'saving' && <span className="text-blue-400">⋯</span>}
                    {row.status === 'saved' && <span className="text-green-500 font-bold">✓</span>}
                    {row.status === 'error' && (
                      <span title={row.errorMsg} className="text-red-500 cursor-help">✕</span>
                    )}
                  </td>
                </tr>

                {/* Expandable credentials row */}
                {row.showCredentials && (
                  <tr
                    key={`${row.flatId}-creds`}
                    className={`border-b border-gray-100 ${
                      row.status === 'saved' ? 'bg-green-50' :
                      row.status === 'error' ? 'bg-red-50' :
                      'bg-blue-50/40'
                    }`}
                  >
                    <td className="px-3 py-1.5 text-right">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Login</span>
                    </td>
                    <td colSpan={3} className="px-2 py-1">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">Username</span>
                          <input
                            type="text"
                            value={row.username}
                            onChange={e => updateRow(idx, { username: e.target.value, status: 'idle', errorMsg: '' })}
                            placeholder="e.g. flat101"
                            disabled={saving || row.status === 'saved'}
                            autoComplete="off"
                            className="w-32 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">Password</span>
                          <input
                            type="password"
                            value={row.password}
                            onChange={e => updateRow(idx, { password: e.target.value, status: 'idle', errorMsg: '' })}
                            placeholder={row.username.trim() ? 'Required' : 'If username set'}
                            disabled={saving || row.status === 'saved'}
                            autoComplete="new-password"
                            className={`w-32 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 disabled:bg-transparent disabled:border-transparent ${
                              row.username.trim() && !row.password.trim() ? 'border-amber-300 bg-amber-50' : 'border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    </td>
                    <td colSpan={4} className="px-2 py-1">
                      <p className="text-[10px] text-gray-400">
                        Leave username blank to create a resident profile without login access.
                      </p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Per-row error summary */}
      {rows.some(r => r.status === 'error' && r.errorMsg) && (
        <div className="space-y-1">
          {rows.filter(r => r.status === 'error' && r.errorMsg).map(r => (
            <p key={r.flatId} className="text-xs text-red-600">
              <span className="font-mono font-semibold">{r.flatNumber}</span>: {r.errorMsg}
            </p>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          {filledRows.length === 0
            ? 'No residents to add — all rows are blank'
            : `${filledRows.length} resident${filledRows.length !== 1 ? 's' : ''} will be added`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onSkip}
            disabled={saving}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
          >
            Skip
          </button>
          <button
            onClick={handleSave}
            disabled={saving || filledRows.length === 0}
            className="px-5 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {saving ? `Saving… (${savedCount}/${filledRows.length})` : `Save ${filledRows.length} Resident${filledRows.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}