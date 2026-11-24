import React, { useState } from 'react'
import { Committee } from '../../../api/committee'
import { DESIGNATION_LABELS } from '../../../constants/labels'

interface Props {
  committees: Committee[]
  onActivate?: (committee: Committee) => void
  onDelete?: (committee: Committee) => void
}

function formatDateRange(formedOn: string, dissolvedOn: string | null): string {
  const from = new Date(formedOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  const to = dissolvedOn
    ? new Date(dissolvedOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Present'
  return `${from} – ${to}`
}

export default function PastCommitteesPanel({ committees, onActivate, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (committees.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-4xl mb-2">📚</p>
        <p className="font-semibold text-gray-700">No past committees</p>
        <p className="text-sm text-gray-400 mt-1">Previous committees will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {committees.map(c => {
        const isOpen = expanded === c.id
        return (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <button
              onClick={() => setExpanded(isOpen ? null : c.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">🏛️</span>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{c.name}</p>
                  <p className="text-xs text-gray-400">{formatDateRange(c.formedOn, c.dissolvedOn)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400">{c.memberCount} members</span>
                <span className="text-xs text-gray-400">{c.achievementCount} achievements</span>
                <span className={`text-sm transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                {/* Members */}
                {c.members && c.members.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Members</p>
                    <div className="flex flex-wrap gap-2">
                      {c.members.map(m => (
                        <div
                          key={m.id}
                          className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 px-2.5 py-1.5"
                        >
                          <span className="text-xs font-medium text-gray-700">
                            {m.resident?.name ?? '—'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {DESIGNATION_LABELS[m.designation] ?? m.designation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {c.achievements && c.achievements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Achievements
                    </p>
                    <ul className="space-y-1">
                      {c.achievements.map(a => (
                        <li key={a.id} className="text-xs text-gray-600 flex items-start gap-1">
                          <span>•</span>
                          <span>{a.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {(onActivate || onDelete) && (
                  <div className="flex gap-2 mt-2">
                    {onActivate && (
                      <button
                        onClick={() => onActivate(c)}
                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ♻️ Reactivate
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(c)}
                        className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}