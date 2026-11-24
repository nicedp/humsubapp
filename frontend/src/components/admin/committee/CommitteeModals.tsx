import React, { useState, useEffect } from 'react'
import { Committee, CommitteeMember } from '../../../api/committee'
import {
  DESIGNATIONS,
  DESIGNATION_LABELS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_ICONS,
} from '../../../constants/labels'

// ─── Committee Form Modal ─────────────────────────────────────────────────────

export interface CommitteeForm {
  name: string
  formedOn: string
  dissolvedOn: string
}

const emptyCommitteeForm: CommitteeForm = {
  name: '',
  formedOn: new Date().toISOString().slice(0, 10),
  dissolvedOn: '',
}

interface CommitteeModalProps {
  open: boolean
  editing: Committee | null
  saving: boolean
  onClose: () => void
  onSubmit: (form: CommitteeForm) => void
}

export function CommitteeModal({ open, editing, saving, onClose, onSubmit }: CommitteeModalProps) {
  const [form, setForm] = useState<CommitteeForm>(emptyCommitteeForm)

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        formedOn: editing.formedOn.slice(0, 10),
        dissolvedOn: editing.dissolvedOn ? editing.dissolvedOn.slice(0, 10) : '',
      })
    } else {
      setForm(emptyCommitteeForm)
    }
  }, [editing, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">
            {editing ? 'Edit Committee' : 'New Committee'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Committee Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Managing Committee 2024-25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formed On <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={form.formedOn}
              onChange={e => setForm(f => ({ ...f, formedOn: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dissolved On <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={form.dissolvedOn}
              onChange={e => setForm(f => ({ ...f, dissolvedOn: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Member Modal ─────────────────────────────────────────────────────────

export interface MemberForm {
  residentId: string
  residentSearch: string
  designation: string
  joinedOn: string
  notes: string
}

const emptyMemberForm: MemberForm = {
  residentId: '',
  residentSearch: '',
  designation: 'member',
  joinedOn: new Date().toISOString().slice(0, 10),
  notes: '',
}

interface ResidentOption {
  id: string
  name: string
  flatNumber: string | null
}

interface AddMemberModalProps {
  open: boolean
  editing: CommitteeMember | null
  saving: boolean
  residents: ResidentOption[]
  onClose: () => void
  onSubmit: (form: MemberForm) => void
}

export function AddMemberModal({
  open,
  editing,
  saving,
  residents,
  onClose,
  onSubmit,
}: AddMemberModalProps) {
  const [form, setForm] = useState<MemberForm>(emptyMemberForm)
  const [residentQuery, setResidentQuery] = useState('')

  useEffect(() => {
    if (editing) {
      setForm({
        residentId: editing.residentId,
        residentSearch: editing.resident?.name ?? '',
        designation: editing.designation,
        joinedOn: editing.joinedOn.slice(0, 10),
        notes: editing.notes ?? '',
      })
      setResidentQuery(editing.resident?.name ?? '')
    } else {
      setForm(emptyMemberForm)
      setResidentQuery('')
    }
  }, [editing, open])

  if (!open) return null

  const filtered = residents.filter(r =>
    r.name.toLowerCase().includes(residentQuery.toLowerCase()) ||
    (r.flatNumber ?? '').toLowerCase().includes(residentQuery.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.residentId) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">
            {editing ? 'Edit Member' : 'Add Member'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Resident picker */}
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resident <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={residentQuery}
                onChange={e => {
                  setResidentQuery(e.target.value)
                  setForm(f => ({ ...f, residentId: '', residentSearch: e.target.value }))
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name or flat…"
              />
              {residentQuery.length > 0 && !form.residentId && (
                <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto bg-white shadow-lg z-10">
                  {filtered.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-gray-400">No residents found</p>
                  ) : (
                    filtered.slice(0, 8).map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, residentId: r.id, residentSearch: r.name }))
                          setResidentQuery(`${r.name}${r.flatNumber ? ` (${r.flatNumber})` : ''}`)
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium">{r.name}</span>
                        {r.flatNumber && (
                          <span className="text-gray-400 ml-1">· Flat {r.flatNumber}</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
              {form.residentId && (
                <p className="text-xs text-green-600 mt-1">✓ Selected</p>
              )}
            </div>
          )}

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation <span className="text-red-500">*</span>
            </label>
            <select
              value={form.designation}
              onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {DESIGNATIONS.map(d => (
                <option key={d} value={d}>{DESIGNATION_LABELS[d]}</option>
              ))}
            </select>
          </div>

          {/* Joined On */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Joined On</label>
            <input
              type="date"
              value={form.joinedOn}
              onChange={e => setForm(f => ({ ...f, joinedOn: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!editing && !form.residentId)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Add Achievement Modal ────────────────────────────────────────────────────

export interface AchievementForm {
  title: string
  description: string
  achievedOn: string
  category: string
}

const emptyAchievementForm: AchievementForm = {
  title: '',
  description: '',
  achievedOn: new Date().toISOString().slice(0, 10),
  category: 'other',
}

interface AddAchievementModalProps {
  open: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (form: AchievementForm) => void
}

export function AddAchievementModal({ open, saving, onClose, onSubmit }: AddAchievementModalProps) {
  const [form, setForm] = useState<AchievementForm>(emptyAchievementForm)

  useEffect(() => {
    if (open) setForm(emptyAchievementForm)
  }, [open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Add Achievement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g. Completed compound wall renovation"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ACHIEVEMENT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {ACHIEVEMENT_CATEGORY_ICONS[cat]} {ACHIEVEMENT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Achieved On</label>
            <input
              type="date"
              value={form.achievedOn}
              onChange={e => setForm(f => ({ ...f, achievedOn: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Brief description of this achievement…"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving…' : 'Add Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

interface ConfirmDeleteModalProps {
  open: boolean
  title: string
  description?: string
  deleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmDeleteModal({
  open,
  title,
  description,
  deleting,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="text-center">
          <p className="text-4xl mb-3">🗑️</p>
          <h3 className="font-bold text-gray-800 mb-1">{title}</h3>
          {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
        </div>
        <div className="flex gap-3 justify-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}