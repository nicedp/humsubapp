import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { billingApi } from '../../api/billing'
import { complaintsApi } from '../../api/complaints'
import { visitorsApi } from '../../api/visitors'
import { noticesApi } from '../../api/notices'
import { expensesApi } from '../../api/expenses'
import { onboardingApi } from '../../api/onboarding'
import { alertsApi, AlertSummary } from '../../api/alerts'
import StatCard from '../../components/admin/dashboard/StatCard'
import FloorSummaryBar from '../../components/admin/dashboard/FloorSummaryBar'
import FinanceCharts from '../../components/admin/dashboard/FinanceCharts'
import RecentActivity from '../../components/admin/dashboard/RecentActivity'

export default function AdminDashboard() {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const navigate = useNavigate()

  const { data: summaryData } = useQuery({
    queryKey: ['billing-summary', currentMonth, currentYear],
    queryFn: () => billingApi.getSummary(currentMonth, currentYear),
  })
  const { data: recentBillsData } = useQuery({
    queryKey: ['bills', 'dashboard-recent', currentMonth, currentYear],
    queryFn: () => billingApi.list({ month: currentMonth, year: currentYear, status: 'paid', limit: 5 }),
  })
  const { data: defaultersData } = useQuery({
    queryKey: ['billing-defaulters'],
    queryFn: () => billingApi.getDefaulters(),
  })
  const { data: complaintsData } = useQuery({
    queryKey: ['complaints', 'dashboard'],
    queryFn: () => complaintsApi.list({ status: 'open', limit: 5 }),
  })
  const { data: visitorsData } = useQuery({
    queryKey: ['visitors', 'today'],
    queryFn: () => visitorsApi.getTodaysVisitors(),
  })
  const { data: noticesData } = useQuery({
    queryKey: ['notices', 'dashboard'],
    queryFn: () => noticesApi.list({ limit: 3 }),
  })
  const { data: floorStatusData } = useQuery({
    queryKey: ['billing-floor-status', currentMonth, currentYear],
    queryFn: () => billingApi.getFloorStatus(currentMonth, currentYear),
  })
  const { data: trendData } = useQuery({
    queryKey: ['billing-monthly-trend'],
    queryFn: () => billingApi.getMonthlyTrend(6),
  })
  const { data: expenseTrendData } = useQuery({
    queryKey: ['expense-monthly-summary'],
    queryFn: () => expensesApi.getMonthlySummary(6),
  })

  const { data: alertsData } = useQuery({
    queryKey: ['alerts-summary'],
    queryFn: alertsApi.getSummary,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })

  // Onboarding progress — show amber banner if society not yet activated
  const qc = useQueryClient()
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const { data: onboardingProgress } = useQuery({
    queryKey: ['onboarding-progress'],
    queryFn: () => onboardingApi.getProgress().catch(() => null),
    staleTime: 60_000,
  })
  const setupIncomplete = !bannerDismissed && (
    onboardingProgress?.society?.status === 'setup' ||
    onboardingProgress?.society?.status === 'pending'
  )

  const activateMutation = useMutation({
    mutationFn: () => onboardingApi.activate(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['onboarding-progress'] })
      setBannerDismissed(true)
    },
  })

  const summary = summaryData
  const recentPayments = recentBillsData?.data ?? []
  const defaulters = defaultersData ?? []
  const openComplaints = complaintsData?.data ?? []
  const todaysVisitors = visitorsData?.data ?? []
  const recentNotices = noticesData?.data ?? []

  const alerts: AlertSummary | undefined = alertsData
  const totalAlerts = alerts?.totalAlerts ?? 0

  const chartData = (trendData ?? []).map((t) => {
    const expensePoint = (expenseTrendData ?? []).find((e) => e.month === t.month && e.year === t.year)
    return {
      label: t.label,
      billed: t.totalBilled,
      collected: t.totalCollected,
      expenses: expensePoint?.totalExpenses ?? 0,
      rate: t.collectionRate,
    }
  })

  return (
    <div className="space-y-6">
      {/* Setup Incomplete Banner */}
      {setupIncomplete && (
        <div className="sticky top-0 z-20 bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 flex items-center gap-4 shadow-sm">
          <span className="text-2xl flex-shrink-0">🚧</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-amber-900">Society setup is incomplete</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You have added properties and residents manually. Click "Mark Active" to activate your portal.
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {activateMutation.isPending ? 'Activating…' : '✓ Mark Active'}
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-amber-700 hover:text-amber-900 text-sm px-2 py-2"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{format(now, 'EEEE, d MMMM yyyy')}</p>
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard to="/admin/billing" title="Outstanding Bills"
          value={summary ? summary.unpaidCount + summary.overdueCount : '—'}
          icon="💰" color="text-red-600"
          subtitle={summary ? `₹${summary.totalDue.toLocaleString('en-IN')} pending` : 'Loading...'} />
        <StatCard to="/admin/billing" title="Collected This Month"
          value={summary ? `₹${summary.totalCollected.toLocaleString('en-IN')}` : '—'}
          icon="✅" color="text-green-600"
          subtitle={summary ? `${summary.paidCount} bills paid · ${summary.collectionRate}% rate` : 'Loading...'} />
        <StatCard to="/admin/complaints" title="Open Complaints"
          value={openComplaints.length} icon="📝" color="text-orange-600"
          subtitle="requires attention" />
        <StatCard to="/admin/visitors" title="Visitors Today"
          value={todaysVisitors.length} icon="🚶" color="text-blue-600"
          subtitle={`${todaysVisitors.filter(v => !v.exitTime).length} currently inside`} />
      </div>

      {/* KPI Cards — Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard to="/admin/billing" title="Overdue Bills"
          value={summary?.overdueCount ?? '—'} icon="⚠️" color="text-red-700"
          subtitle="past due date" />
        <StatCard to="/admin/billing" title="Defaulters"
          value={defaulters.length} icon="🚨" color="text-red-600"
          subtitle={defaulters.length > 0
            ? `₹${defaulters.reduce((s, d) => s + d.totalOutstanding, 0).toLocaleString('en-IN')} total`
            : 'All paid up!'} />
        <StatCard title="Collection Rate"
          value={summary ? `${summary.collectionRate}%` : '—'} icon="📊"
          color={summary && summary.collectionRate >= 80 ? 'text-green-600' : 'text-orange-600'}
          subtitle={`${summary?.totalBills ?? 0} total bills this month`} />
      </div>

      {/* Action Required Panel */}
      {totalAlerts > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <span>🔔</span> Action Required
              <span className="ml-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{totalAlerts}</span>
            </h2>
            <button
              onClick={() => navigate('/admin/alerts')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View all alerts →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {((alerts?.overdueAssets?.length ?? 0) + (alerts?.amcOverdue?.length ?? 0)) > 0 && (
              <button
                onClick={() => navigate('/admin/alerts')}
                className="flex flex-col items-start gap-1 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-left"
              >
                <span className="text-lg">🔴</span>
                <span className="text-sm font-semibold text-red-800">Service Overdue</span>
                <span className="text-xs text-red-600">{(alerts!.overdueAssets.length + alerts!.amcOverdue.length)} item{((alerts!.overdueAssets.length + alerts!.amcOverdue.length)) !== 1 ? 's' : ''}</span>
              </button>
            )}
            {((alerts?.assetsDueSoon?.length ?? 0) + (alerts?.amcDueSoon?.length ?? 0)) > 0 && (
              <button
                onClick={() => navigate('/admin/alerts')}
                className="flex flex-col items-start gap-1 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-left"
              >
                <span className="text-lg">🟠</span>
                <span className="text-sm font-semibold text-orange-800">Due Soon</span>
                <span className="text-xs text-orange-600">{(alerts!.assetsDueSoon.length + alerts!.amcDueSoon.length)} item{((alerts!.assetsDueSoon.length + alerts!.amcDueSoon.length)) !== 1 ? 's' : ''}</span>
              </button>
            )}
            {(alerts?.amcExpiringSoon?.length ?? 0) > 0 && (
              <button
                onClick={() => navigate('/admin/alerts')}
                className="flex flex-col items-start gap-1 p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition text-left"
              >
                <span className="text-lg">🟡</span>
                <span className="text-sm font-semibold text-yellow-800">AMC Expiring</span>
                <span className="text-xs text-yellow-600">{alerts!.amcExpiringSoon.length} contract{alerts!.amcExpiringSoon.length !== 1 ? 's' : ''}</span>
              </button>
            )}
            {(alerts?.overdueBillsCount ?? 0) > 0 && (
              <button
                onClick={() => navigate('/admin/billing')}
                className="flex flex-col items-start gap-1 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition text-left"
              >
                <span className="text-lg">💰</span>
                <span className="text-sm font-semibold text-red-800">Overdue Bills</span>
                <span className="text-xs text-red-600">{alerts!.overdueBillsCount} bills · ₹{alerts!.overdueBillsAmount.toLocaleString('en-IN')}</span>
              </button>
            )}
            {(alerts?.openComplaintsCount ?? 0) > 0 && (
              <button
                onClick={() => navigate('/admin/complaints')}
                className="flex flex-col items-start gap-1 p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition text-left"
              >
                <span className="text-lg">📝</span>
                <span className="text-sm font-semibold text-orange-800">Open Complaints</span>
                <span className="text-xs text-orange-600">{alerts!.openComplaintsCount} pending</span>
              </button>
            )}
            {(alerts?.unreadResidentMessages ?? 0) > 0 && (
              <button
                onClick={() => navigate('/admin/alerts')}
                className="flex flex-col items-start gap-1 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition text-left"
              >
                <span className="text-lg">💬</span>
                <span className="text-sm font-semibold text-blue-800">Resident Messages</span>
                <span className="text-xs text-blue-600">{alerts!.unreadResidentMessages} unread</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Urgent Notices */}
      {recentNotices.some(n => n.priority === 'urgent') && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-800 mb-2">🚨 Urgent Notices</h2>
          <ul className="space-y-1">
            {recentNotices.filter(n => n.priority === 'urgent').map(n => (
              <li key={n.id} className="text-sm text-red-700 font-medium">{n.title}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recent Activity Grid */}
      <RecentActivity
        recentPayments={recentPayments}
        openComplaints={openComplaints}
        todaysVisitors={todaysVisitors}
        defaulters={defaulters}
      />

      {/* Floor Summary Bar */}
      <FloorSummaryBar
        floorData={floorStatusData ?? []}
        month={currentMonth}
        year={currentYear}
      />

      {/* Finance Charts */}
      <FinanceCharts chartData={chartData} />

      {/* Recent Notices */}
      {recentNotices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Recent Notices</h2>
            <a href="/admin/notices" className="text-xs text-blue-600 hover:underline">View all →</a>
          </div>
          <div className="space-y-3">
            {recentNotices.map(n => (
              <div key={n.id} className="flex items-start gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize whitespace-nowrap ${
                  n.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  n.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{n.priority}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-xs text-gray-400">{format(new Date(n.postedOn), 'dd MMM yyyy')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}