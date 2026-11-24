import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residentsApi } from '../../api/residents'
import { authApi } from '../../api/auth'
import { Resident, Vehicle } from '../../types'
import toast from 'react-hot-toast'

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  car: '🚗',
  bike: '🏍️',
  scooter: '🛵',
  other: '🚘',
}

export default function ResidentProfile() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', whatsapp: '' })
  const [formError, setFormError] = useState('')

  // Change password state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [showPwCurrent, setShowPwCurrent] = useState(false)
  const [showPwNext, setShowPwNext] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: residentsApi.getMyProfile,
  })

  // Sync form when profile loads
  useEffect(() => {
    if (profile && !editing) {
      setForm({
        name: profile.name,
        phone: profile.phone,
        whatsapp: (profile as Resident).whatsapp ?? '',
      })
    }
  }, [profile])

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: residentsApi.getMyVehicles,
  })

  const updateMutation = useMutation({
    mutationFn: (payload: { name?: string; phone?: string; whatsapp?: string | null }) =>
      residentsApi.updateMyProfile(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-profile'] })
      toast.success('Profile updated successfully')
      setEditing(false)
      setFormError('')
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to update profile'
      setFormError(msg)
      toast.error(msg)
    },
  })

  const changePwMutation = useMutation({
    mutationFn: () =>
      authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next }),
    onSuccess: () => {
      toast.success('Password changed successfully')
      setPwForm({ current: '', next: '', confirm: '' })
      setPwError('')
    },
    onError: (e: unknown) => {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to change password'
      setPwError(msg)
      toast.error(msg)
    },
  })

  const handleChangePw = (ev: React.FormEvent) => {
    ev.preventDefault()
    setPwError('')
    if (!pwForm.current) { setPwError('Current password is required'); return }
    if (pwForm.next.length < 8) { setPwError('New password must be at least 8 characters'); return }
    if (pwForm.next !== pwForm.confirm) { setPwError('New passwords do not match'); return }
    changePwMutation.mutate()
  }

  const handleSave = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!form.name.trim()) { setFormError('Name is required'); return }
    if (!form.phone.trim()) { setFormError('Phone is required'); return }
    setFormError('')
    updateMutation.mutate({
      name: form.name.trim(),
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim() || null,
    })
  }

  const handleCancel = () => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone, whatsapp: profile.whatsapp ?? '' })
    }
    setFormError('')
    setEditing(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40" />
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded flex-1" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl">
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-6 text-center">
          <p className="text-red-700 font-medium">Profile not found</p>
          <p className="text-red-500 text-sm mt-1">Your account does not have a resident profile linked</p>
        </div>
      </div>
    )
  }

  const vehicleList: Vehicle[] = vehicles ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">View and update your personal details</p>
      </div>

      {/* ── Flat Info (read-only) ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">🏢</span>
          <h2 className="font-semibold text-gray-900">Flat Information</h2>
          <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Read-only</span>
        </div>
        <div className="p-5">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Flat Number</dt>
              <dd className="font-semibold text-gray-900 mt-0.5">{profile.flatNumber ?? profile.flatId}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Resident Type</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  profile.residentType === 'owner'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {profile.residentType}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Move-in Date</dt>
              <dd className="font-medium text-gray-800 mt-0.5">
                {profile.moveInDate
                  ? new Date(profile.moveInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="mt-0.5">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  profile.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {profile.isActive ? 'Active' : 'Inactive'}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── Personal Details (editable) ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">👤</span>
          <h2 className="font-semibold text-gray-900">Personal Details</h2>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition"
            >
              ✏️ Edit
            </button>
          )}
        </div>

        <div className="p-5">
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {formError}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (optional)</label>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="WhatsApp number (if different)"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="sm:col-span-2">
                <dt className="text-gray-500">Full Name</dt>
                <dd className="font-semibold text-gray-900 mt-0.5 text-base">{profile.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-800 mt-0.5">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium text-gray-800 mt-0.5">{profile.phone}</dd>
              </div>
              <div>
                <dt className="text-gray-500">WhatsApp</dt>
                <dd className="font-medium text-gray-800 mt-0.5">{profile.whatsapp || <span className="text-gray-400">—</span>}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* ── Vehicles (read-only) ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">🚗</span>
          <h2 className="font-semibold text-gray-900">My Vehicles</h2>
          <span className="ml-2 text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
            {profile.numCars} car{profile.numCars !== 1 ? 's' : ''}, {profile.numBikes} bike{profile.numBikes !== 1 ? 's' : ''}
          </span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">Managed by admin</span>
        </div>

        {vehiclesLoading ? (
          <div className="p-5 space-y-3 animate-pulse">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicleList.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🚗</div>
            <p className="text-gray-500 text-sm">No vehicles registered</p>
            <p className="text-gray-400 text-xs mt-1">Contact the society admin to register your vehicles</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {vehicleList.map((v) => (
              <div key={v.id} className="px-5 py-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                  {VEHICLE_TYPE_ICONS[v.vehicleType] ?? '🚘'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{v.vehicleNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">
                    {v.vehicleType}
                    {v.make && ` · ${v.make}`}
                    {v.model && ` ${v.model}`}
                    {v.color && ` · ${v.color}`}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  v.isActive
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-gray-50 text-gray-500 border-gray-100'
                }`}>
                  {v.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Change Password ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-base">🔒</span>
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="p-5">
          {pwError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              {pwError}
            </div>
          )}
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showPwCurrent ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwCurrent(!showPwCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPwCurrent ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showPwNext ? 'text' : 'password'}
                    value={pwForm.next}
                    onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwNext(!showPwNext)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPwNext ? '🙈' : '👁'}
                  </button>
                </div>
                {pwForm.next.length > 0 && pwForm.next.length < 8 && (
                  <p className="text-xs text-amber-600 mt-1">Too short — needs {8 - pwForm.next.length} more chars</p>
                )}
                {pwForm.next.length >= 8 && (
                  <p className="text-xs text-green-600 mt-1">✓ Strong enough</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={pwForm.confirm}
                  onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    pwForm.confirm && pwForm.confirm !== pwForm.next
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                {pwForm.confirm && pwForm.confirm !== pwForm.next && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
                {pwForm.confirm && pwForm.confirm === pwForm.next && pwForm.next.length >= 8 && (
                  <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={changePwMutation.isPending}
                className="px-5 py-2 text-sm font-medium bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:bg-gray-400 transition"
              >
                {changePwMutation.isPending ? 'Updating...' : '🔒 Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}