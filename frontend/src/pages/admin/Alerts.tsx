import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { alertsApi, AlertItem } from '../../api/alerts'

// ─── Section Component ────────────────────────────────────────
interface AlertSectionProps {
  icon: string
  title: string
  count: number
  colorClass: string
  borderClass: string
  bgClass: string
  textClass: string
  items: AlertItem[]
  linkLabel?: string
  linkTo?: string
  emptyMessage?: string
}

function AlertSection({
  icon, title, count, colorClass, borderClass, bgClass, textClass, items, linkLabel, linkTo, emptyMessage,
}: AlertSectionProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(true)

  return (
    <div className={`rounded-xl border ${borderClass} overflow-hidden`}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-5 py-3.5 ${bgClass} text-left`}
      >
        <span className="text-xl">{icon}</span>
        <span className={`font-semibold ${textClass} flex-1`}>{title}</span>
        {count > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorClass}`}>{count}</span>
        )}
        <span className={`text-sm ${textClass} opacity-60`}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Body */}
      {open && (
        <div className="divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              {emptyMessage ?? 'No alerts in this category.'}
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-3.5 bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {item.daysOverdue !== undefined && item.daysOverdue > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {item.daysOverdue}d overdue
                      </span>
                    )}
                    {item.daysUntil !== undefined && item.daysUntil >= 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.daysUntil <= 3
                          ? 'bg-red-100 text-red-700'
                          : item.daysUntil <= 7
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.daysUntil === 0 ? 'Today' : `${item.daysUntil}d left`}
                      </span>
                    )}
                    <button
                      onClick={() => navigate(item.link)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
              {linkLabel && linkTo && (
                <div className="px-5 py-3 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => navigate(linkTo)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {linkLabel} →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Summary Card ─────────────────────────────────────────────
interface SummaryCardProps {
  icon: string
  label: string
  value: number | string
  sub?: string
  colorClass: string
  bgClass: string
  onClick?: () => void
}

function SummaryCard({ icon, label, value, sub, colorClass, bgClass, onClick }: SummaryCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 p-4 rounded-xl border ${bgClass} hover:opacity-90 transition text-left w-full`}
    >
      <span className="text-2xl">{icon}</span>
      <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      {sub && <span className="text-[10px] text-gray-500">{sub}</span>}
    </button>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminAlerts() {
  const navigate = useNavigate()
  const now = new Date()

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts-summary'],
    queryFn: alertsApi.getSummary,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  const totalAlerts = alerts?.totalAlerts ?? 0
  const overdueCount = (alerts?.overdueAssets?.length ?? 0) + (alerts?.amcOverdue?.length ?? 0)
  const dueSoonCount = (alerts?.assetsDueSoon?.length ?? 0) + (alerts?.amcDueSoon?.length ?? 0)
  const expiringCount = alerts?.amcExpiringSoon?.length ?? 0
  const overdueItems: AlertItem[] = [
    ...(alerts?.overdueAssets ?? []),
    ...(alerts?.amcOverdue ?? []),
  ]
  const dueSoonItems: AlertItem[] = [
    ...(alerts?.assetsDueSoon ?? []),
    ...(alerts?.amcDueSoon ?? []),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔔 Alerts Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? 'Loading…' : totalAlerts === 0
              ? 'All clear — no pending actions'
              : `${totalAlerts} item${totalAlerts !== 1 ? 's' : ''} need attention · as of ${format(now, 'hh:mm a')}`
            }
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* All clear state */}
      {!isLoading && totalAlerts === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-12 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="font-semibold text-green-800">All systems clear!</p>
          <p className="text-sm text-green-600 mt-1">No pending service, AMC, billing, or complaint alerts.</p>
        </div>
      )}

      {/* Summary Cards */}
      {!isLoading && totalAlerts > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <SummaryCard
            icon="🔴" label="Service Overdue" value={overdueCount}
            colorClass="text-red-700" bgClass="bg-red-50 border-red-200"
            onClick={() => document.getElementById('sect-overdue')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <SummaryCard
            icon="🟠" label="Due Soon" value={dueSoonCount}
            colorClass="text-orange-700" bgClass="bg-orange-50 border-orange-200"
            onClick={() => document.getElementById('sect-due-soon')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <SummaryCard
            icon="🟡" label="AMC Expiring" value={expiringCount}
            colorClass="text-yellow-700" bgClass="bg-yellow-50 border-yellow-200"
            onClick={() => document.getElementById('sect-amc')?.scrollIntoView({ behavior: 'smooth' })}
          />
          <SummaryCard
            icon="💰" label="Overdue Bills" value={alerts?.overdueBillsCount ?? 0}
            sub={alerts?.overdueBillsAmount ? `₹${alerts.overdueBillsAmount.toLocaleString('en-IN')}` : undefined}
            colorClass="text-red-700" bgClass="bg-red-50 border-red-200"
            onClick={() => navigate('/admin/billing')}
          />
          <SummaryCard
            icon="📝" label="Open Complaints" value={alerts?.openComplaintsCount ?? 0}
            colorClass="text-orange-700" bgClass="bg-orange-50 border-orange-200"
            onClick={() => navigate('/admin/complaints')}
          />
          <SummaryCard
            icon="💬" label="Resident Messages" value={alerts?.unreadResidentMessages ?? 0}
            colorClass="text-blue-700" bgClass="bg-blue-50 border-blue-200"
            onClick={() => document.getElementById('sect-messages')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Alert Sections */}
      {!isLoading && (
        <div className="space-y-4">
          {/* Overdue Service */}
          <div id="sect-overdue">
            <AlertSection
              icon="🔴" title="Service Overdue" count={overdueCount}
              colorClass="bg-red-100 text-red-700"
              borderClass="border-red-200"
              bgClass="bg-red-50"
              textClass="text-red-900"
              items={overdueItems}
              linkLabel="Go to Assets" linkTo="/admin/assets"
              emptyMessage="No assets or AMC contracts are overdue for service."
            />
          </div>

          {/* Due Soon */}
          <div id="sect-due-soon">
            <AlertSection
              icon="🟠" title="Service Due Soon (within 14 days)" count={dueSoonCount}
              colorClass="bg-orange-100 text-orange-700"
              borderClass="border-orange-200"
              bgClass="bg-orange-50"
              textClass="text-orange-900"
              items={dueSoonItems}
              linkLabel="Go to Assets" linkTo="/admin/assets"
              emptyMessage="No assets or AMC contracts due for service in the next 14 days."
            />
          </div>

          {/* AMC Expiring */}
          <div id="sect-amc">
            <AlertSection
              icon="🟡" title="AMC Contracts Expiring (within 30 days)" count={expiringCount}
              colorClass="bg-yellow-100 text-yellow-700"
              borderClass="border-yellow-200"
              bgClass="bg-yellow-50"
              textClass="text-yellow-900"
              items={alerts?.amcExpiringSoon ?? []}
              linkLabel="Go to Vendors & AMC" linkTo="/admin/vendors"
              emptyMessage="No AMC contracts expiring in the next 30 days."
            />
          </div>

          {/* Overdue Bills */}
          <div className="rounded-xl border border-red-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-red-50">
              <span className="text-xl">💰</span>
              <span className="font-semibold text-red-900 flex-1">Overdue Bills</span>
              {(alerts?.overdueBillsCount ?? 0) > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  {alerts!.overdueBillsCount}
                </span>
              )}
            </div>
            <div className="px-5 py-4 bg-white">
              {(alerts?.overdueBillsCount ?? 0) === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No overdue bills. 🎉</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-red-700">{alerts!.overdueBillsCount}</span> bills are overdue
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Total outstanding: <span className="font-semibold text-red-700">₹{alerts!.overdueBillsAmount.toLocaleString('en-IN')}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/billing')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Go to Billing →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Open Complaints */}
          <div className="rounded-xl border border-orange-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-orange-50">
              <span className="text-xl">📝</span>
              <span className="font-semibold text-orange-900 flex-1">Open Complaints</span>
              {(alerts?.openComplaintsCount ?? 0) > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  {alerts!.openComplaintsCount}
                </span>
              )}
            </div>
            <div className="px-5 py-4 bg-white">
              {(alerts?.openComplaintsCount ?? 0) === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No open complaints. 🎉</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-orange-700">{alerts!.openComplaintsCount}</span> complaints pending resolution
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Review and resolve to keep residents happy</p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/complaints')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Go to Complaints →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Resident Messages */}
          <div id="sect-messages" className="rounded-xl border border-blue-200 overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50">
              <span className="text-xl">💬</span>
              <span className="font-semibold text-blue-900 flex-1">Unread Resident Messages</span>
              {(alerts?.unreadResidentMessages ?? 0) > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {alerts!.unreadResidentMessages}
                </span>
              )}
            </div>
            <div className="px-5 py-4 bg-white">
              {(alerts?.unreadResidentMessages ?? 0) === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No unread resident messages. 🎉</p>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-bold text-blue-700">{alerts!.unreadResidentMessages}</span> unread message{alerts!.unreadResidentMessages !== 1 ? 's' : ''} from residents
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Notifications sent to admin from resident activity</p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/residents')}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Go to Residents →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}