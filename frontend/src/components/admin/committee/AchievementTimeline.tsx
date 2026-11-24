import React from 'react'
import { CommitteeAchievement } from '../../../api/committee'
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  ACHIEVEMENT_CATEGORY_ICONS,
  ACHIEVEMENT_CATEGORY_COLORS,
} from '../../../constants/labels'

interface Props {
  achievements: CommitteeAchievement[]
  isAdmin?: boolean
  onDelete?: (achievement: CommitteeAchievement) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AchievementTimeline({ achievements, isAdmin, onDelete }: Props) {
  if (achievements.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="text-4xl mb-2">🏆</p>
        <p className="font-semibold text-gray-700">No achievements yet</p>
        {isAdmin && (
          <p className="text-sm text-gray-400 mt-1">Click "Add Achievement" to record a milestone</p>
        )}
      </div>
    )
  }

  const sorted = [...achievements].sort(
    (a, b) => new Date(b.achievedOn).getTime() - new Date(a.achievedOn).getTime()
  )

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

      <div className="space-y-4">
        {sorted.map((ach, idx) => {
          const icon = ACHIEVEMENT_CATEGORY_ICONS[ach.category] ?? '✨'
          const label = ACHIEVEMENT_CATEGORY_LABELS[ach.category] ?? ach.category
          const badgeClass = ACHIEVEMENT_CATEGORY_COLORS[ach.category] ?? 'bg-gray-100 text-gray-600'

          return (
            <div key={ach.id} className="relative flex gap-4 pl-12">
              {/* Dot */}
              <div className="absolute left-3 top-3 w-5 h-5 rounded-full bg-white border-2 border-blue-400 flex items-center justify-center text-xs">
                {icon}
              </div>

              {/* Card */}
              <div className="flex-1 bg-white rounded-lg border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{ach.title}</p>
                    {ach.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ach.description}</p>
                    )}
                  </div>
                  {isAdmin && onDelete && (
                    <button
                      onClick={() => onDelete(ach)}
                      className="text-red-400 hover:text-red-600 text-xs px-1.5 py-0.5 rounded hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Delete achievement"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
                    {icon} {label}
                  </span>
                  <span className="text-[10px] text-gray-400">{formatDate(ach.achievedOn)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}