import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { billingApi } from '../../api/billing'
import { notificationsApi } from '../../api/notifications'
import { noticesApi } from '../../api/notices'
import { visitorsApi } from '../../api/visitors'
import { complaintsApi } from '../../api/complaints'
import { eventsApi } from '../../api/events'
import { useAuth } from '../../context/AuthContext'
import { format, differenceInDays, startOfToday, parseISO, isPast } from 'date-fns'
import {
  BILL_STATUS_COLORS as STATUS_COLORS,
  noticePriorityColor as priorityColor,
} from '../../constants/labels'

// ─── Complaint status pill helper ───────────────────────────────────────────
const COMPLAINT_PILL: Record<string, string> = {
  open:        'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
}
const COMPLAINT_ICON: Record<string, string> = {
  open:        '🟡',
  in_progress: '🔵',
  resolved:    '✅',
  closed:      '⬜',
}

// ─── Event status helpers ─────────────────────────────────────────────────
function eventDaysLabel(dateStr: string): { text: string; cls: string } {
  const d = parseISO(dateStr)
  const today = startOfToday()
  const diff = differenceInDays(d, today)
  if (diff < 0) return { text: `${Math.abs(diff)}d ago`, cls: 'text-gray-400' }
  if (diff === 0) return { text: 'Today!', cls: 'text-green-600 font-semibold' }
  if (diff <= 7) return { text: `In ${diff}d`, cls: 'text-amber-600 font-semibold' }
  return { text: `In ${diff}d`, cls: 'text-blue-600' }
}

// ─── Section card wrapper ─────────────────────────────────────────────────
function SectionCard({ title, linkTo, linkLabel, children }: {
  title: string
  linkTo?: string
  linkLabel?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        {linkTo && linkLabel && (
          <Link to={linkTo} className="text-xs text-blue-600 hover:underline">{linkLabel}</Link>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────────────────────────
function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="px-5 py-8 text-center">
      <div className="text-3xl mb-2">{emoji}</div>
      <p className="text-sm text-gray-400">{text}</p>
    </div>
  )
}

export default function ResidentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // ── Queries ────────────────────────────────────────────────────────────
  const { data: billsData } = useQuery({
    queryKey: ['my-bills'],
    queryFn: () => billingApi.getMyBills({ limit: 5 }),
  })

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMyNotifications({ limit: 5 }),
  })

  const { data: noticesData } = useQuery({
    queryKey: ['notices'],
    queryFn: () => noticesApi.list({ limit: 3 }),
  })

  const { data: visitorsData } = useQuery({
    queryKey: ['my-visitors-recent'],
    queryFn: () => visitorsApi.getMyVisitors({ limit: 3 }),
  })

  const { data: complaintsData } = useQuery({
    queryKey: ['my-complaints-dashboard'],
    queryFn: () => complaintsApi.getMyComplaints({ limit: 5 }),
  })

  const { data: eventsData } = useQuery({
    queryKey: ['events-upcoming-resident'],
    queryFn: () => eventsApi.list({ limit: 4, status: 'active' }),
    staleTime: 60_000,
  })

  // ── Derived values ────────────────────────────────────────────────────
  const bills               = billsData?.data ?? []
  const notifications       = notifData?.data ?? []
  const notices             = noticesData?.data ?? []
  const recentVisitors      = visitorsData?.data ?? []
  const myComplaints        = complaintsData?.data ?? []
  const upcomingEvents      = (eventsData?.data ?? []).filter(e => !isPast(parseISO(e.eventDate)))
  const unreadCount         = unreadData?.count ?? 0

  const pendingBills  = bills.filter((b) => b.status !== 'paid')
  const totalDue      = pendingBills.reduce((sum, b) => sum + b.totalDue, 0)
  const activeComplaints = myComplaints.filter(c => c.status === 'open' || c.status === 'in_progress')

  // Next due date: earliest unpaid bill's dueDate
  const nextDueBill = pendingBills
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  const getDueDateLabel = () => {
    if (!nextDueBill) return null
    const due = new Date(nextDueBill.dueDate)
    const today = startOfToday()
    const days = differenceInDays(due, today)
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, cls: 'text-red-600 font-semibold' }
    if (days === 0) return { text: 'Due today!', cls: 'text-orange-600 font-semibold' }
    return { text: `Due in ${days} day${days === 1 ? '' : 's'}`, cls: 'text-yellow-700 font-medium' }
  }

  const dueDateLabel = getDueDateLabel()

  return (
    <div className="space-y-6">

      {/* ── Welcome / Bill Hero banner ─────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
        <p className="text-blue-100 mt-1 text-sm capitalize">{user?.role} resident</p>
        <div className="mt-4 flex flex-wrap gap-4">
          {totalDue > 0 ? (
            <>
              <div className="bg-white/20 rounded-lg px-4 py-3">
                <p className="text-xs text-blue-100">Total Outstanding</p>
                <p className="text-2xl font-bold">₹{totalDue.toLocaleString()}</p>
              </div>
              {dueDateLabel && (
                <div className="bg-white/20 rounded-lg px-4 py-3 flex flex-col justify-center">
                  <p className="text-xs text-blue-100">Next Payment</p>
                  <p className="text-sm font-semibold text-white">{dueDateLabel.text}</p>
                  <p className="text-xs text-blue-200">
                    {new Date(0, nextDueBill!.month - 1).toLocaleString('default', { month: 'long' })} {nextDueBill!.year} · ₹{nextDueBill!.totalDue.toLocaleString()}
                  </p>
                </div>
              )}
              <Link
                to="/resident/pay"
                className="bg-white text-blue-700 font-semibold text-sm px-5 py-3 rounded-lg hover:bg-blue-50 transition self-center shadow"
              >
                💳 Pay Now
              </Link>
            </>
          ) : bills.length > 0 ? (
            <div className="bg-white/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="text-sm font-semibold text-white">All bills paid!</p>
                <p className="text-xs text-blue-200">You're up to date</p>
              </div>
            </div>
          ) : null}

          {activeComplaints.length > 0 && (
            <div className="bg-white/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <span className="text-xl">🔧</span>
              <div>
                <p className="text-sm font-semibold text-white">{activeComplaints.length} Active Complaint{activeComplaints.length !== 1 ? 's' : ''}</p>
                <p className="text-xs text-blue-200">Being tracked</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '🧾', label: 'View Bills',      to: '/resident/bills' },
          { icon: '🔧', label: 'Raise Complaint', to: '/resident/complaints' },
          { icon: '💳', label: 'Pay Now',          to: '/resident/pay' },
          { icon: '🏛️', label: 'Committee',       to: '/resident/committee' },
        ].map((a) => (
          <button
            key={a.to}
            type="button"
            onClick={() => navigate(a.to)}
            className="flex flex-col items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-xl py-4 px-3 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
          >
            <span className="text-2xl">{a.icon}</span>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>

      {/* ── KPI stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/resident/bills" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow block">
          <p className="text-sm text-gray-500">Pending Bills</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pendingBills.length}</p>
          <p className="text-xs text-blue-600 mt-1">View bills →</p>
        </Link>

        <Link to="/resident/notifications" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow block relative">
          <p className="text-sm text-gray-500">Unread Alerts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{unreadCount}</p>
          <p className="text-xs text-blue-600 mt-1">View notifications →</p>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full" />
          )}
        </Link>

        <Link to="/resident/complaints" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow block">
          <p className="text-sm text-gray-500">Active Complaints</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeComplaints.length}</p>
          <p className="text-xs text-blue-600 mt-1">View complaints →</p>
        </Link>

        <Link to="/resident/visitors" className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow block">
          <p className="text-sm text-gray-500">Recent Visitors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{visitorsData?.total ?? 0}</p>
          <p className="text-xs text-blue-600 mt-1">View visitors →</p>
        </Link>
      </div>

      {/* ── Row 1: Recent Bills + Active Complaints ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Bills */}
        <SectionCard title="Recent Bills" linkTo="/resident/bills" linkLabel="View all">
          <div className="divide-y divide-gray-50">
            {bills.length === 0 ? (
              <EmptyState emoji="🧾" text="No bills yet" />
            ) : bills.slice(0, 4).map((b) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(0, b.month - 1).toLocaleString('default', { month: 'long' })} {b.year}
                  </p>
                  <p className="text-xs text-gray-500">Due {format(new Date(b.dueDate), 'dd MMM')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">₹{b.totalDue.toLocaleString()}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Active Complaints */}
        <SectionCard title="My Complaints" linkTo="/resident/complaints" linkLabel="View all">
          <div className="divide-y divide-gray-50">
            {myComplaints.length === 0 ? (
              <EmptyState emoji="✅" text="No complaints raised" />
            ) : myComplaints.slice(0, 4).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">{COMPLAINT_ICON[c.status] ?? '⬜'}</span>
                    <p className="text-sm font-medium text-gray-900 capitalize truncate">{c.category.replace('_', ' ')}</p>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{format(new Date(c.raisedOn), 'dd MMM yyyy')}</p>
                </div>
                <span className={`mt-0.5 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${COMPLAINT_PILL[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 2: Upcoming Events + Latest Notices ───────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upcoming Events */}
        <SectionCard title="Upcoming Events">
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 ? (
              <EmptyState emoji="🎉" text="No upcoming events" />
            ) : upcomingEvents.slice(0, 3).map((ev) => {
              const dl = eventDaysLabel(ev.eventDate)
              return (
                <div key={ev.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{ev.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {format(parseISO(ev.eventDate), 'dd MMM yyyy')}
                      {ev.description && ` · ${ev.description.slice(0, 40)}${ev.description.length > 40 ? '…' : ''}`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold flex-shrink-0 ${dl.cls}`}>{dl.text}</span>
                </div>
              )
            })}
          </div>
        </SectionCard>

        {/* Latest Notices */}
        <SectionCard title="Latest Notices" linkTo="/resident/notices" linkLabel="View all">
          <div className="divide-y divide-gray-50">
            {notices.length === 0 ? (
              <EmptyState emoji="📢" text="No notices posted yet" />
            ) : notices.map((n) => (
              <div key={n.id} className="px-5 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor(n.priority)}`}>{n.priority}</span>
                  <span className="text-xs text-gray-400">{format(new Date(n.postedOn), 'dd MMM yyyy')}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                {n.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Row 3: Recent Visitors + Notifications ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Visitors */}
        <SectionCard title="Recent Visitors" linkTo="/resident/visitors" linkLabel="View all">
          <div className="divide-y divide-gray-50">
            {recentVisitors.length === 0 ? (
              <EmptyState emoji="🚶" text="No visitor logs yet" />
            ) : recentVisitors.map((v) => (
              <div key={v.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{v.visitorName}</p>
                  <p className="text-xs text-gray-500 capitalize">{v.purpose ?? v.visitorType}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{format(new Date(v.entryTime), 'dd MMM, h:mm a')}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.exitTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {v.exitTime ? 'exited' : 'inside'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Recent Notifications */}
        <SectionCard title={`Notifications${unreadCount > 0 ? '' : ''}`} linkTo="/resident/notifications" linkLabel="View all">
          <div className="divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <EmptyState emoji="🔔" text="No notifications" />
            ) : notifications.map((n) => (
              <div key={n.id} className={`px-5 py-3 ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                  <div className={!n.isRead ? '' : 'pl-4'}>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{format(new Date(n.createdAt), 'dd MMM, h:mm a')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}