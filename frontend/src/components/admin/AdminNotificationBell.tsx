import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { alertsApi, AlertItem } from '../../api/alerts'
import { notificationsApi } from '../../api/notifications'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dayChip(item: AlertItem, variant: 'overdue' | 'due' | 'expiring') {
  if (variant === 'overdue' && item.daysOverdue !== undefined) {
    return (
      <span className="ml-auto flex-shrink-0 text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
        {item.daysOverdue === 0 ? 'Today' : `${item.daysOverdue}d overdue`}
      </span>
    )
  }
  if ((variant === 'due' || variant === 'expiring') && item.daysUntil !== undefined) {
    const color = item.daysUntil <= 3 ? 'bg-red-100 text-red-700' : item.daysUntil <= 7 ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
    return (
      <span className={`ml-auto flex-shrink-0 text-[10px] font-semibold ${color} px-1.5 py-0.5 rounded`}>
        {item.daysUntil === 0 ? 'Today' : `in ${item.daysUntil}d`}
      </span>
    )
  }
  return null
}

interface SectionProps {
  icon: string
  title: string
  count: number
  color: string
  items: AlertItem[]
  chipVariant: 'overdue' | 'due' | 'expiring'
  navLink: string
  onNavigate: (link: string) => void
}

function AlertSection({ icon, title, count, color, items, chipVariant, navLink, onNavigate }: SectionProps) {
  if (items.length === 0) return null
  const shown = items.slice(0, 3)
  const extra = items.length - shown.length

  return (
    <div className="px-3 py-2">
      <div
        className="flex items-center gap-1.5 mb-1.5 cursor-pointer hover:opacity-80"
        onClick={() => onNavigate(navLink)}
      >
        <span className="text-sm">{icon}</span>
        <span className={`text-xs font-semibold ${color}`}>{title}</span>
        <span className={`ml-auto text-[10px] font-bold ${color} bg-opacity-20 px-1.5 py-0.5 rounded-full border border-current`}>
          {count}
        </span>
      </div>
      <div className="space-y-1">
        {shown.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.link)}
            className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 transition group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate group-hover:text-blue-700">{item.label}</p>
              <p className="text-[10px] text-gray-400 truncate">{item.detail}</p>
            </div>
            {dayChip(item, chipVariant)}
          </button>
        ))}
        {extra > 0 && (
          <button
            onClick={() => onNavigate(navLink)}
            className="text-[10px] text-blue-600 hover:underline pl-2"
          >
            and {extra} more…
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminNotificationBell() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: summary } = useQuery({
    queryKey: ['alerts-summary'],
    queryFn: alertsApi.getSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
  })

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNavigate = (link: string) => {
    navigate(link)
    setOpen(false)
  }

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead()
    qc.invalidateQueries({ queryKey: ['alerts-summary'] })
    qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
  }

  const totalBadge = summary?.totalAlerts ?? 0

  // Combine overdue assets + AMC overdue for "Overdue Service" section
  const allOverdue = [...(summary?.overdueAssets ?? []), ...(summary?.amcOverdue ?? [])]
  const allDueSoon = [...(summary?.assetsDueSoon ?? []), ...(summary?.amcDueSoon ?? [])]

  const hasAnything =
    allOverdue.length > 0 ||
    allDueSoon.length > 0 ||
    (summary?.amcExpiringSoon.length ?? 0) > 0 ||
    (summary?.overdueBillsCount ?? 0) > 0 ||
    (summary?.openComplaintsCount ?? 0) > 0 ||
    (summary?.unreadResidentMessages ?? 0) > 0

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative p-2 rounded-lg transition ${open ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
        title="Alerts & Notifications"
      >
        <span className="text-xl">🔔</span>
        {totalBadge > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
            {totalBadge > 99 ? '99+' : totalBadge}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <span className="text-sm font-semibold text-gray-900">Alerts</span>
              {totalBadge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {totalBadge}
                </span>
              )}
            </div>
            <button
              onClick={() => handleNavigate('/admin/alerts')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all →
            </button>
          </div>

          {/* All-clear state */}
          {!hasAnything && (
            <div className="px-4 py-10 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm font-semibold text-gray-700">All clear!</p>
              <p className="text-xs text-gray-400 mt-1">No pending actions right now</p>
            </div>
          )}

          {/* Alert sections */}
          {hasAnything && (
            <div className="divide-y divide-gray-50 py-1">
              {/* Overdue Service (critical) */}
              <AlertSection
                icon="🔴"
                title="Service Overdue"
                count={allOverdue.length}
                color="text-red-700"
                items={allOverdue}
                chipVariant="overdue"
                navLink="/admin/alerts"
                onNavigate={handleNavigate}
              />

              {/* Service Due Soon */}
              <AlertSection
                icon="🟠"
                title="Service Due Soon"
                count={allDueSoon.length}
                color="text-orange-700"
                items={allDueSoon}
                chipVariant="due"
                navLink="/admin/alerts"
                onNavigate={handleNavigate}
              />

              {/* Contracts Expiring */}
              <AlertSection
                icon="🟡"
                title="Contracts Expiring"
                count={summary?.amcExpiringSoon.length ?? 0}
                color="text-yellow-700"
                items={summary?.amcExpiringSoon ?? []}
                chipVariant="expiring"
                navLink="/admin/vendors"
                onNavigate={handleNavigate}
              />

              {/* Overdue Bills */}
              {(summary?.overdueBillsCount ?? 0) > 0 && (
                <div className="px-3 py-2">
                  <button
                    onClick={() => handleNavigate('/admin/billing')}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="text-sm">💰</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-red-700">
                        {summary!.overdueBillsCount} Overdue Bill{summary!.overdueBillsCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        ₹{summary!.overdueBillsAmount.toLocaleString('en-IN')} outstanding
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400">→</span>
                  </button>
                </div>
              )}

              {/* Open Complaints */}
              {(summary?.openComplaintsCount ?? 0) > 0 && (
                <div className="px-3 py-2">
                  <button
                    onClick={() => handleNavigate('/admin/complaints')}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition text-left"
                  >
                    <span className="text-sm">📝</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-orange-700">
                        {summary!.openComplaintsCount} Open Complaint{summary!.openComplaintsCount !== 1 ? 's' : ''}
                      </p>
                      <p className="text-[10px] text-gray-400">require attention</p>
                    </div>
                    <span className="text-[10px] text-gray-400">→</span>
                  </button>
                </div>
              )}

              {/* Resident Messages */}
              {(summary?.unreadResidentMessages ?? 0) > 0 && (
                <div className="px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-sm">💬</span>
                    <span className="text-xs font-semibold text-blue-700">Resident Messages</span>
                    <span className="ml-auto text-[10px] font-bold text-blue-700 border border-blue-300 px-1.5 py-0.5 rounded-full">
                      {summary!.unreadResidentMessages}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleNavigate('/admin/alerts')}
                      className="flex-1 text-xs text-blue-600 hover:underline text-left px-2"
                    >
                      View messages →
                    </button>
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-gray-400 hover:text-gray-600 px-2"
                    >
                      Mark all read
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <button
              onClick={() => handleNavigate('/admin/alerts')}
              className="w-full text-xs text-blue-600 hover:underline font-medium text-center"
            >
              View full alerts center →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}