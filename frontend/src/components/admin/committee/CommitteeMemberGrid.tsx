import React from 'react'
import { CommitteeMember } from '../../../api/committee'
import { DESIGNATION_LABELS, DESIGNATION_COLORS } from '../../../constants/labels'

interface Props {
  members: CommitteeMember[]
  isAdmin?: boolean
  onEdit?: (member: CommitteeMember) => void
  onRemove?: (member: CommitteeMember) => void
}

function avatarInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500',
]

function avatarColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

export default function CommitteeMemberGrid({ members, isAdmin, onEdit, onRemove }: Props) {
  const active = members.filter(m => m.isActive)
  const inactive = members.filter(m => !m.isActive)

  if (members.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-4xl mb-2">👥</p>
        <p className="font-semibold text-gray-700">No members yet</p>
        {isAdmin && (
          <p className="text-sm text-gray-400 mt-1">Click "Add Member" to add committee members</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active members */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {active.map(member => (
          <MemberCard
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onRemove={onRemove}
          />
        ))}
      </div>

      {/* Inactive / past members */}
      {inactive.length > 0 && (
        <details className="mt-2">
          <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer hover:text-gray-600 select-none">
            Past Members ({inactive.length})
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 opacity-60">
            {inactive.map(member => (
              <MemberCard
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onRemove={onRemove}
                dim
              />
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

interface MemberCardProps {
  member: CommitteeMember
  isAdmin?: boolean
  onEdit?: (m: CommitteeMember) => void
  onRemove?: (m: CommitteeMember) => void
  dim?: boolean
}

function MemberCard({ member, isAdmin, onEdit, onRemove, dim }: MemberCardProps) {
  const name = member.resident?.name ?? '—'
  const flat = member.resident?.flatNumber ?? ''
  const desigLabel = DESIGNATION_LABELS[member.designation] ?? member.designation
  const desigClass = DESIGNATION_COLORS[member.designation] ?? 'bg-gray-100 text-gray-600'
  const color = avatarColor(name)
  const initials = avatarInitials(name)

  return (
    <div className={`relative bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:shadow-md transition-shadow ${dim ? 'grayscale' : ''}`}>
      {/* Avatar */}
      <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg mx-auto mb-2`}>
        {initials}
      </div>

      {/* Name */}
      <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{name}</p>
      {flat && <p className="text-xs text-gray-400 mt-0.5">Flat {flat}</p>}

      {/* Designation badge */}
      <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${desigClass}`}>
        {desigLabel}
      </span>

      {/* Inactive label */}
      {!member.isActive && (
        <p className="text-[10px] text-gray-400 mt-1">Inactive</p>
      )}

      {/* Admin actions */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* show on card hover using CSS group — simplify: always show on hover via parent */}
        </div>
      )}

      {/* Admin action buttons */}
      {isAdmin && (
        <div className="mt-3 flex gap-1 justify-center">
          {onEdit && (
            <button
              onClick={() => onEdit(member)}
              className="text-[11px] text-blue-600 hover:text-blue-800 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
            >
              Edit
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(member)}
              className="text-[11px] text-red-500 hover:text-red-700 px-2 py-0.5 rounded border border-red-200 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      )}
    </div>
  )
}