import React from 'react'
import { Resident } from '../../../types'
import FlatSearchSelect, { FlatOption } from '../../FlatSearchSelect'

export type ResidentForm = {
  name: string
  email: string
  phone: string
  flatId: string
  residentType: 'owner' | 'tenant'
  username: string
  password: string
  moveInDate: string
}

interface Props {
  editResident: Resident | null
  form: ResidentForm
  flats: FlatOption[]
  error: string
  isPending: boolean
  onChange: (f: ResidentForm) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ResidentModal({ editResident, form, flats, error, isPending, onChange, onSubmit, onClose }: Props) {
  const hasLogin = !!(editResident?.userId)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{editResident ? 'Edit Resident' : 'Add Resident'}</h2>
        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input required value={form.name} onChange={e => onChange({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
              <input type="email" value={form.email} onChange={e => onChange({ ...form, email: e.target.value })}
                placeholder="resident@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input required value={form.phone} onChange={e => onChange({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flat / Property</label>
              <FlatSearchSelect
                options={flats}
                value={form.flatId}
                onChange={id => onChange({ ...form, flatId: id })}
                placeholder="Search flat number…"
              />
              {/* Hidden native input to satisfy HTML required validation */}
              <input
                type="text"
                required
                value={form.flatId}
                onChange={() => {}}
                tabIndex={-1}
                className="sr-only"
                aria-hidden="true"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={form.residentType} onChange={e => onChange({ ...form, residentType: e.target.value as 'owner' | 'tenant' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="owner">Owner</option>
                <option value="tenant">Tenant</option>
              </select>
            </div>
          </div>

          {/* ── Login / Credentials section ─────────────────────── */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">🔑 Login Account</span>
              {editResident && (
                hasLogin
                  ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Active — {editResident.username}</span>
                  : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">No login yet</span>
              )}
            </div>

            {editResident && hasLogin ? (
              /* Edit mode — has login: only allow password change */
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <input type="password" value={form.password} onChange={e => onChange({ ...form, password: e.target.value })}
                  placeholder="Enter new password to change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ) : editResident && !hasLogin ? (
              /* Edit mode — no login: allow creating credentials */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Username</label>
                  <input value={form.username} onChange={e => onChange({ ...form, username: e.target.value })}
                    placeholder="Set a username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Password {form.username.trim() && <span className="text-red-500">*</span>}
                  </label>
                  <input type="password" value={form.password} onChange={e => onChange({ ...form, password: e.target.value })}
                    placeholder={form.username.trim() ? 'Required' : ''}
                    required={!!form.username.trim()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            ) : (
              /* Create mode */
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Username <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={form.username} onChange={e => onChange({ ...form, username: e.target.value })}
                    placeholder="Leave blank to skip"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Password {form.username.trim() && <span className="text-red-500">*</span>}
                  </label>
                  <input type="password" value={form.password} onChange={e => onChange({ ...form, password: e.target.value })}
                    placeholder={form.username.trim() ? 'Required when username is set' : ''}
                    required={!!form.username.trim()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:bg-blue-400">
              {isPending ? 'Saving...' : editResident ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}