
import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { residentsApi, ResidentProfile as ProfileData, FamilyMember, FamilyRelation } from '../../api/residents'
import { MONTHS_LONG, PROPERTY_TYPE_LABELS, BILL_STATUS_COLORS, COMPLAINT_STATUS_COLORS } from '../../constants/labels'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tenureString(moveInDate: string) {
  const months = Math.floor((Date.now() - new Date(moveInDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return 'Just moved in'
  if (months < 12) return `${months}m`
  return `${Math.floor(months / 12)}y ${months % 12}m`
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function purposeIcon(type: string) {
  const icons: Record<string, string> = {
    guest: '👤', delivery: '📦', milkman: '🥛', service: '🔧',
    plumber: '🔧', electrician: '⚡', cab: '🚗', courier: '📬',
    dth: '📡', broadband: '🌐', gas: '🔥', other: '🏃',
  }
  return icons[type] ?? '🏃'
}

function avatarColor(name: string) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
  return colors[name.charCodeAt(0) % colors.length]
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function noteColor(color: string) {
  const map: Record<string, string> = {
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200',
    pink: 'bg-pink-50 border-pink-200',
    green: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200',
    white: 'bg-white border-gray-200',
  }
  return map[color] ?? 'bg-gray-50 border-gray-200'
}

// ─── Section Card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  title, icon, children, action,
}: {
  title: string
  icon: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
          <span>{icon}</span>{title}
        </h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── Info Row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-gray-800 text-right">{value}</dd>
    </div>
  )
}

// ─── Change Password Modal ────────────────────────────────────────────────────

interface ChangePasswordModalProps {
  residentId: string
  residentName: string
  residentEmail: string | null
  residentWhatsapp: string | null
  onClose: () => void
}

function ChangePasswordModal({ residentId, residentName, residentEmail, residentWhatsapp, onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState({ newPassword: '', confirm: '', notify: 'none' as 'email' | 'whatsapp' | 'none' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (form.newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.newPassword !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await residentsApi.changePassword(residentId, {
        newPassword: form.newPassword,
        notify: form.notify,
      })

      // If WhatsApp selected, open wa.me link in new tab
      if (form.notify === 'whatsapp' && residentWhatsapp) {
        const msg = encodeURIComponent(
          `Hello! Your Society Portal login password has been updated by the admin. Please login with your new password. If you did not expect this change, please contact us immediately.`
        )
        window.open(`https://wa.me/${residentWhatsapp.replace(/\D/g, '')}?text=${msg}`, '_blank')
      }

      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change password'
      setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div>
            <h2 className="text-base font-semibold text-gray-800">🔑 Change Password</h2>
            <p className="text-xs text-gray-500 mt-0.5">{residentName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {success ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="text-4xl">✅</div>
              <p className="text-green-700 font-semibold">Password updated successfully!</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">New Password *</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min. 6 characters"
                  value={form.newPassword}
                  onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Re-enter password"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                />
              </div>

              {/* Notify */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Notify Resident</label>
                <div className="flex flex-wrap gap-2">
                  {/* None */}
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, notify: 'none' }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      form.notify === 'none'
                        ? 'bg-gray-700 text-white border-gray-700'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    🔕 No Notification
                  </button>

                  {/* Email — disabled if no email */}
                  <button
                    type="button"
                    disabled={!residentEmail}
                    onClick={() => setForm(f => ({ ...f, notify: 'email' }))}
                    title={residentEmail ? 'Send email notification' : 'No email on file'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      form.notify === 'email'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    📧 Send Email
                  </button>

                  {/* WhatsApp — disabled if no whatsapp */}
                  <button
                    type="button"
                    disabled={!residentWhatsapp}
                    onClick={() => setForm(f => ({ ...f, notify: 'whatsapp' }))}
                    title={residentWhatsapp ? 'Open WhatsApp with message' : 'No WhatsApp number on file'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                      form.notify === 'whatsapp'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    💬 WhatsApp
                  </button>
                </div>
                {form.notify === 'email' && residentEmail && (
                  <p className="text-xs text-gray-400 mt-1.5">Email will be sent to: {residentEmail}</p>
                )}
                {form.notify === 'whatsapp' && residentWhatsapp && (
                  <p className="text-xs text-gray-400 mt-1.5">WhatsApp chat will open for: {residentWhatsapp}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.newPassword || !form.confirm}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
            >
              {saving ? 'Saving…' : '🔑 Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Family Members Card (inline add) ────────────────────────────────────────

function FamilyMembersCard({ residentId, members }: { residentId: string; members: FamilyMember[] }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<{ name: string; relation: FamilyRelation; phone: string; isEmergency: boolean }>({
    name: '', relation: 'spouse', phone: '', isEmergency: false,
  })
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await residentsApi.addFamilyMember(residentId, {
        name: form.name,
        relation: form.relation,
        phone: form.phone || null,
        isEmergency: form.isEmergency,
      })
      queryClient.invalidateQueries({ queryKey: ['resident-profile', residentId] })
      setForm({ name: '', relation: 'spouse', phone: '', isEmergency: false })
      setShowForm(false)
    } catch {
      // silently ignore — form stays open
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (memberId: string) => {
    if (!confirm('Remove this family member?')) return
    await residentsApi.deleteFamilyMember(residentId, memberId)
    queryClient.invalidateQueries({ queryKey: ['resident-profile', residentId] })
  }

  return (
    <SectionCard
      title="Family Members"
      icon="👨‍👩‍👧"
      action={
        <button
          onClick={() => setShowForm(s => !s)}
          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
        >
          + Add
        </button>
      }
    >
      {showForm && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2">
          <input
            className="border rounded px-2 py-1 text-sm col-span-2 sm:col-span-1"
            placeholder="Name *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <select
            className="border rounded px-2 py-1 text-sm"
            value={form.relation}
            onChange={e => setForm(f => ({ ...f, relation: e.target.value as FamilyRelation }))}
          >
            {(['spouse', 'child', 'parent', 'sibling', 'other'] as FamilyRelation[]).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            className="border rounded px-2 py-1 text-sm"
            placeholder="Phone"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          />
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isEmergency}
                onChange={e => setForm(f => ({ ...f, isEmergency: e.target.checked }))}
              />
              Emergency
            </label>
            <button
              onClick={handleAdd}
              disabled={saving || !form.name.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      {members.length === 0 && !showForm ? (
        <p className="text-gray-400 text-sm text-center">No family members added yet</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs border-b">
              <th className="text-left pb-1">Name</th>
              <th className="text-left pb-1">Relation</th>
              <th className="text-left pb-1">Phone</th>
              <th className="text-center pb-1">🆘</th>
              <th className="pb-1" />
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="border-b border-gray-50">
                <td className="py-1.5 text-gray-800 font-medium">{m.name}</td>
                <td className="py-1.5 capitalize text-gray-600">{m.relation}</td>
                <td className="py-1.5 text-gray-600">{m.phone ?? '—'}</td>
                <td className="py-1.5 text-center">{m.isEmergency ? '🆘' : ''}</td>
                <td className="py-1.5 text-right">
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="text-gray-300 hover:text-red-500 text-xs"
                    title="Remove"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </SectionCard>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResidentProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [showPwdModal, setShowPwdModal] = useState(false)

  const { data: profile, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['resident-profile', id],
    queryFn: () => residentsApi.getProfile(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-3">❌</div>
        <p className="text-gray-600">Resident not found.</p>
        <button onClick={() => navigate('/admin/residents')} className="mt-4 text-blue-600 hover:underline text-sm">
          ← Back to Residents
        </button>
      </div>
    )
  }

  const { resident, flat, vehicles, familyMembers, billing, complaints, recentVisitors, committeeRoles, adminNotes, portalAccount } = profile

  // Derive cars/bikes count from actual vehicle records (counters in DB can drift)
  const numCars = vehicles.filter(v => v.vehicleType === 'car').length
  const numBikes = vehicles.filter(v => v.vehicleType !== 'car').length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

      {/* ── Back link ── */}
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
        ← Back
      </button>

      {/* ── Profile Header ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          {/* Avatar */}
          <div className={`w-16 h-16 rounded-full ${avatarColor(resident.name)} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
            {initials(resident.name)}
          </div>

          {/* Name + badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{resident.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${resident.residentType === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {resident.residentType}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${resident.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {resident.isActive ? '● Active' : '○ Inactive'}
              </span>
              {complaints.openCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  {complaints.openCount} open complaint{complaints.openCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {flat.block ? `${flat.block.name} · ` : ''}{flat.flatNumber}
              {flat.floor !== null ? ` · Floor ${flat.floor}` : ''}
              {' · '}{PROPERTY_TYPE_LABELS[flat.type as keyof typeof PROPERTY_TYPE_LABELS] ?? flat.type}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              Move-in: {formatDate(resident.moveInDate)} · Tenure: {tenureString(resident.moveInDate)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <Link
              to="/admin/residents"
              state={{ editId: id }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium"
            >
              ✏️ Edit
            </Link>
          </div>
        </div>

        {/* Outstanding balance banner */}
        {billing.summary.outstanding > 0 && (
          <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <span className="text-red-600 font-semibold text-sm">
              ₹{billing.summary.outstanding.toLocaleString('en-IN')} outstanding
            </span>
            <Link to={`/admin/billing?flatId=${flat.id}`} className="text-red-500 hover:underline text-xs ml-auto">
              View bills →
            </Link>
          </div>
        )}
      </div>

      {/* ── 2-column: Personal + Property ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Personal Details */}
        <SectionCard title="Personal Details" icon="📋">
          <dl className="space-y-2 text-sm">
            <InfoRow label="Phone" value={<a href={`tel:${resident.phone}`} className="text-blue-600">{resident.phone}</a>} />
            <InfoRow label="Email" value={resident.email
              ? <a href={`mailto:${resident.email}`} className="text-blue-600">{resident.email}</a>
              : '—'} />
            {resident.whatsapp && (
              <InfoRow label="WhatsApp" value={
                <a href={`https://wa.me/${resident.whatsapp}`} target="_blank" rel="noreferrer" className="text-green-600">
                  {resident.whatsapp}
                </a>
              } />
            )}
            <InfoRow label="Date of Birth" value={formatDate(resident.dateOfBirth)} />
            <InfoRow label="ID Proof" value={
              resident.idProofType
                ? `${resident.idProofType}${resident.idProofNumber ? ` · ${resident.idProofNumber}` : ''}`
                : '—'
            } />
            <InfoRow label="Emergency Contact" value={resident.emergencyContactName ?? '—'} />
            {resident.emergencyContactPhone && (
              <InfoRow label="Emergency Phone" value={
                <a href={`tel:${resident.emergencyContactPhone}`} className="text-blue-600">
                  {resident.emergencyContactPhone}
                </a>
              } />
            )}
            <InfoRow
              label="Cars / Bikes"
              value={`${numCars} car${numCars !== 1 ? 's' : ''} · ${numBikes} bike${numBikes !== 1 ? 's' : ''}`}
            />
          </dl>
        </SectionCard>

        {/* Property Info */}
        <SectionCard title="Property" icon="🏠">
          <dl className="space-y-2 text-sm">
            <InfoRow label="Flat" value={flat.flatNumber} />
            <InfoRow label="Block" value={flat.block?.name ?? '—'} />
            <InfoRow label="Floor" value={flat.floor !== null ? `Floor ${flat.floor}` : '—'} />
            <InfoRow label="Type" value={PROPERTY_TYPE_LABELS[flat.type as keyof typeof PROPERTY_TYPE_LABELS] ?? flat.type} />
            <InfoRow label="Area" value={`${flat.sqFt} sq ft`} />
            <InfoRow label="Status" value={
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${flat.status === 'occupied' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {flat.status}
              </span>
            } />
            {flat.parkingSlots.length > 0 && (
              <InfoRow
                label="Parking"
                value={flat.parkingSlots
                  .map(p => `${p.slotNumber}${p.vehicleNumber ? ` (${p.vehicleNumber})` : ''}`)
                  .join(', ')}
              />
            )}
          </dl>
        </SectionCard>

        {/* Portal Account */}
        <SectionCard
          title="Portal Account"
          icon="🔐"
          action={
            portalAccount ? (
              <button
                onClick={() => setShowPwdModal(true)}
                className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded font-medium"
              >
                🔑 Change Password
              </button>
            ) : undefined
          }
        >
          {portalAccount ? (
            <dl className="space-y-2 text-sm">
              <InfoRow label="Username" value={<code className="bg-gray-100 px-1 rounded">{portalAccount.username}</code>} />
              <InfoRow label="Role" value={<span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{portalAccount.role}</span>} />
              <InfoRow label="Account" value={
                <span className={`px-2 py-0.5 rounded text-xs ${portalAccount.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {portalAccount.isActive ? 'Active' : 'Disabled'}
                </span>
              } />
              <InfoRow label="Last Login" value={portalAccount.lastLogin ? formatDate(portalAccount.lastLogin) : 'Never'} />
            </dl>
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-gray-400 text-sm">No portal account</p>
              <p className="text-gray-400 text-xs mt-1">Edit resident to create login credentials</p>
            </div>
          )}
        </SectionCard>

        {/* Billing Summary */}
        <SectionCard
          title="Maintenance History"
          icon="💰"
          action={
            <Link to={`/admin/billing?flatId=${flat.id}`} className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          }
        >
          {/* KPI row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-400">Outstanding</p>
              <p className="text-lg font-bold text-red-600">₹{billing.summary.outstanding.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Total Paid</p>
              <p className="text-lg font-bold text-green-600">₹{billing.summary.totalPaid.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Bills</p>
              <p className="text-lg font-bold text-gray-700">{billing.summary.billCount}</p>
            </div>
          </div>
          {billing.recent.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No bills yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-400 border-b">
                    <th className="text-left pb-1">Period</th>
                    <th className="text-right pb-1">Amount</th>
                    <th className="text-center pb-1">Status</th>
                    <th className="text-right pb-1">Paid On</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.recent.slice(0, 8).map(b => (
                    <tr key={b.id} className="border-b border-gray-50">
                      <td className="py-1 text-gray-700">{MONTHS_LONG[b.month - 1]} {b.year}</td>
                      <td className="py-1 text-right text-gray-700">₹{b.amount.toLocaleString('en-IN')}</td>
                      <td className="py-1 text-center">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${BILL_STATUS_COLORS[b.status as keyof typeof BILL_STATUS_COLORS] ?? 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="py-1 text-right text-gray-500">
                        {b.payment ? formatDate(b.payment.paidOn) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Change Password Modal ── */}
      {showPwdModal && portalAccount && (
        <ChangePasswordModal
          residentId={id!}
          residentName={resident.name}
          residentEmail={resident.email ?? null}
          residentWhatsapp={resident.whatsapp ?? null}
          onClose={() => setShowPwdModal(false)}
        />
      )}

      {/* ── Vehicles ── */}
      <SectionCard title="Registered Vehicles" icon="🚗">
        {vehicles.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">No vehicles registered</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs border-b">
                  <th className="text-left pb-1">Number</th>
                  <th className="text-left pb-1">Type</th>
                  <th className="text-left pb-1">Make / Model</th>
                  <th className="text-left pb-1">Color</th>
                  <th className="text-center pb-1">Active</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id} className="border-b border-gray-50">
                    <td className="py-1.5 font-mono font-medium text-gray-800">{v.vehicleNumber}</td>
                    <td className="py-1.5 capitalize text-gray-600">{v.vehicleType}</td>
                    <td className="py-1.5 text-gray-600">{[v.make, v.model].filter(Boolean).join(' ') || '—'}</td>
                    <td className="py-1.5 text-gray-600">{v.color ?? '—'}</td>
                    <td className="py-1.5 text-center">
                      <span className={v.isActive ? 'text-green-600' : 'text-gray-400'}>{v.isActive ? '✓' : '✗'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Family Members ── */}
      <FamilyMembersCard residentId={id!} members={familyMembers} />

      {/* ── 2-column: Complaints + Visitors ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Complaints */}
        <SectionCard
          title="Complaints"
          icon="📝"
          action={
            <Link to={`/admin/complaints?flatId=${flat.id}`} className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          }
        >
          {complaints.recent.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No complaints filed</p>
          ) : (
            <ul className="space-y-2">
              {complaints.recent.slice(0, 6).map(c => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${COMPLAINT_STATUS_COLORS[c.status as keyof typeof COMPLAINT_STATUS_COLORS] ?? 'bg-gray-100 text-gray-600'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-gray-700 truncate">{c.description}</p>
                    <p className="text-gray-400 text-xs">{c.category} · {formatDate(c.raisedOn)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Recent Visitors */}
        <SectionCard
          title="Recent Visitors"
          icon="👁️"
          action={
            <Link to={`/admin/visitors?flatId=${flat.id}`} className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          }
        >
          {recentVisitors.length === 0 ? (
            <p className="text-gray-400 text-sm text-center">No visitor logs</p>
          ) : (
            <ul className="space-y-2">
              {recentVisitors.map(v => (
                <li key={v.id} className="flex items-center gap-2 text-sm">
                  <span className="text-xl">{purposeIcon(v.visitorType)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-gray-700 font-medium truncate">{v.visitorName}</p>
                    <p className="text-gray-400 text-xs">{v.visitorType}{v.purpose ? ` · ${v.purpose}` : ''}</p>
                  </div>
                  <p className="text-gray-400 text-xs flex-shrink-0">{formatDate(v.entryTime)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* ── Committee Roles ── */}
      {committeeRoles.length > 0 && (
        <SectionCard title="Committee Roles" icon="🏛️">
          <ul className="space-y-2">
            {committeeRoles.map(m => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                {m.isActive && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                <div>
                  <span className="font-medium text-gray-800 capitalize">{m.designation.replace('_', ' ')}</span>
                  <span className="text-gray-400 mx-2">·</span>
                  <span className="text-gray-600">{m.committeeName}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    ({formatDate(m.joinedOn)}{m.leftOn ? ` → ${formatDate(m.leftOn)}` : ' · current'})
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* ── Admin Notes ── */}
      {adminNotes.length > 0 && (
        <SectionCard title="Admin Notes" icon="📓">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {adminNotes.map(n => (
              <div key={n.id} className={`rounded-lg p-3 border ${noteColor(n.color)}`}>
                {n.isPinned && <span className="text-xs text-gray-500">📌 </span>}
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                {n.content && <p className="text-xs text-gray-600 mt-1 line-clamp-3">{n.content}</p>}
                <p className="text-xs text-gray-400 mt-2">{formatDate(n.updatedAt)}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

    </div>
  )
}
