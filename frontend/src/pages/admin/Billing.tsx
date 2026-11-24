import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { billingApi, QuickPayDto } from '../../api/billing'
import { flatsApi } from '../../api/flats'
import { settingsApi } from '../../api/settings'
import { MaintenanceBill } from '../../types'
import { MONTHS_SHORT as MONTHS } from '../../constants/labels'
import PropertyMapTab from '../../components/admin/billing/PropertyMapTab'
import BillsTab from '../../components/admin/billing/BillsTab'
import DefaultersTab from '../../components/admin/billing/DefaultersTab'
import PrintBillModal from '../../components/admin/billing/PrintBillModal'
import BillingTrendChart from '../../components/admin/billing/BillingTrendChart'
import {
  GenerateBillsModal,
  SingleBillModal,
  RecordPaymentModal,
  EditBillModal,
  ConfirmModal,
} from '../../components/admin/billing/BillingModals'

const now = new Date()
type Tab = 'overview' | 'bills' | 'defaulters'
const BILLS_PAGE_SIZE = 20

export default function AdminBilling() {
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()

  // ── Period ──
  const [month, setMonth] = useState(() => {
    const m = searchParams.get('month'); return m ? parseInt(m) : now.getMonth() + 1
  })
  const [year, setYear] = useState(() => {
    const y = searchParams.get('year'); return y ? parseInt(y) : now.getFullYear()
  })
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  // ── Tab ──
  const [activeTab, setActiveTab] = useState<Tab>(() => searchParams.get('month') ? 'bills' : 'overview')

  // ── Bills table state ──
  const [filterStatus, setFilterStatus] = useState('')
  const [billsSkip, setBillsSkip] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // ── Flat combobox (single bill modal) ──
  const [flatSearch, setFlatSearch] = useState('')
  const [showFlatDropdown, setShowFlatDropdown] = useState(false)

  // ── Modal visibility ──
  const [showGenModal, setShowGenModal] = useState(false)
  const [showSingleModal, setShowSingleModal] = useState(false)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [selectedBill, setSelectedBill] = useState<MaintenanceBill | null>(null)

  // ── Confirm modal state (Group 2) ──
  const [confirmState, setConfirmState] = useState<{ msg: string; onOk: () => void } | null>(null)
  function askConfirm(msg: string, onOk: () => void) { setConfirmState({ msg, onOk }) }

  // ── Trend chart toggle (Group 5) ──
  const [showTrend, setShowTrend] = useState(false)

  // ── Forms ──
  const [genForm, setGenForm] = useState({ month: now.getMonth() + 1, year: now.getFullYear(), dueDayOfMonth: 10 })
  const [singleForm, setSingleForm] = useState({
    flatId: '', months: [now.getMonth() + 1] as number[], year: now.getFullYear(),
    rangeMode: false, fromMonth: now.getMonth() + 1, fromYear: now.getFullYear(),
    toMonth: now.getMonth() + 1, toYear: now.getFullYear(), dueDate: '', amount: '',
  })
  const [payForm, setPayForm] = useState({ amountPaid: 0, paymentMode: 'cash', notes: '', paidOn: '' })
  const [editForm, setEditForm] = useState({ dueDate: '', amount: '' })

  // ── Queries ──
  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: () => settingsApi.get() })
  const summaryQuery = useQuery({ queryKey: ['billing-summary', month, year], queryFn: () => billingApi.getSummary(month, year) })
  const floorQuery = useQuery({ queryKey: ['billing-floor', month, year], queryFn: () => billingApi.getFloorStatus(month, year), enabled: activeTab === 'overview' })
  const billsQuery = useQuery({
    queryKey: ['bills', month, year, filterStatus, billsSkip],
    queryFn: () => billingApi.list({ month, year, status: filterStatus || undefined, skip: billsSkip, limit: BILLS_PAGE_SIZE }),
    enabled: activeTab === 'bills',
  })
  const defaultersQuery = useQuery({ queryKey: ['billing-defaulters'], queryFn: () => billingApi.getDefaulters(), enabled: activeTab === 'defaulters' })
  const flatsQuery = useQuery({ queryKey: ['flats-all'], queryFn: () => flatsApi.list({ limit: 100 }), enabled: showSingleModal })
  // Group 5: trend data (only fetched when chart is open)
  const trendQuery = useQuery({ queryKey: ['billing-trend'], queryFn: () => billingApi.getMonthlyTrend(6), enabled: showTrend, staleTime: 5 * 60 * 1000 })
  // Group 6: summary for the modal's selected month (to show preview)
  const genSummaryQuery = useQuery({ queryKey: ['billing-summary', genForm.month, genForm.year], queryFn: () => billingApi.getSummary(genForm.month, genForm.year), enabled: showGenModal })
  const flatsCountQuery = useQuery({ queryKey: ['flats-occupied-count'], queryFn: () => flatsApi.list({ limit: 1, status: 'occupied' }), enabled: showGenModal })

  // ── Mutations ──
  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ['bills'] })
    qc.invalidateQueries({ queryKey: ['billing-summary'] })
    qc.invalidateQueries({ queryKey: ['billing-floor'] })
    qc.invalidateQueries({ queryKey: ['billing-defaulters'] })
    qc.invalidateQueries({ queryKey: ['flat-billing-history'] })
    setSelectedIds(new Set())
  }

  const genMutation = useMutation({
    mutationFn: () => billingApi.generateMonthlyBills({ month: genForm.month, year: genForm.year, dueDayOfMonth: genForm.dueDayOfMonth }),
    onSuccess: (r) => { invalidateAll(); setShowGenModal(false); toast.success(`${r.created} bills generated (${r.skipped} skipped)`) },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Generation failed'),
  })
  const singleMutation = useMutation({
    mutationFn: async () => {
      let periods: Array<{ month: number; year: number }>
      if (singleForm.rangeMode) {
        periods = []
        let y = singleForm.fromYear, m = singleForm.fromMonth
        const toKey = singleForm.toYear * 100 + singleForm.toMonth
        while (y * 100 + m <= toKey) { periods.push({ month: m, year: y }); m++; if (m > 12) { m = 1; y++ } }
      } else {
        periods = singleForm.months.map((m) => ({ month: m, year: singleForm.year }))
      }
      if (periods.length === 0) throw new Error('No periods selected')
      return billingApi.createBulkSingleBills({ flatId: singleForm.flatId, periods, dueDate: singleForm.dueDate, amount: singleForm.amount ? Number(singleForm.amount) : undefined })
    },
    onSuccess: (result) => {
      invalidateAll(); setShowSingleModal(false); setFlatSearch('')
      const parts = []
      if (result.created > 0) parts.push(`${result.created} created`)
      if (result.updated > 0) parts.push(`${result.updated} updated`)
      if (result.skipped > 0) parts.push(`${result.skipped} skipped (already paid)`)
      toast.success(`${result.flatNumber}: ${parts.join(', ')}`)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create bills'),
  })
  const payMutation = useMutation({
    mutationFn: () => billingApi.recordPayment(selectedBill!.id, { amountPaid: payForm.amountPaid, paymentMode: payForm.paymentMode, notes: payForm.notes || undefined, paidOn: payForm.paidOn || undefined, lateFeeCharged: selectedBill?.lateFee ?? 0 }),
    onSuccess: () => { invalidateAll(); setShowPayModal(false); setSelectedBill(null); toast.success('Payment recorded') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Payment failed'),
  })
  const editMutation = useMutation({
    mutationFn: () => billingApi.updateBill(selectedBill!.id, { dueDate: editForm.dueDate || undefined, amount: editForm.amount ? Number(editForm.amount) : undefined }),
    onSuccess: () => { invalidateAll(); setShowEditModal(false); setSelectedBill(null); toast.success('Bill updated') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Update failed'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => billingApi.deleteBill(id),
    onSuccess: () => { invalidateAll(); toast.success('Bill deleted') },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Delete failed'),
  })
  // Group 6 derived
  const genExistingCount = genSummaryQuery.data?.totalBills
  const genOccupiedCount = flatsCountQuery.data?.total
  const markOverdueMutation = useMutation({
    mutationFn: () => billingApi.markOverdue(),
    onSuccess: (r) => { invalidateAll(); toast.success(`${r.updated} bills marked overdue`) },
    onError: () => toast.error('Failed to mark overdue'),
  })
  const bulkPayMutation = useMutation({
    mutationFn: async () => {
      const ids = Array.from(selectedIds)
      const results = await Promise.allSettled(
        ids.map(id => {
          const bill = bills.find(b => b.id === id)
          return billingApi.recordPayment(id, { amountPaid: bill?.totalDue ?? 0, paymentMode: 'cash', paidOn: format(new Date(), 'yyyy-MM-dd'), lateFeeCharged: bill?.lateFee ?? 0 })
        })
      )
      const failed = results.filter(r => r.status === 'rejected')
      if (failed.length > 0) throw new Error(`${failed.length} payment(s) failed`)
      return results.length
    },
    onSuccess: (count) => { invalidateAll(); toast.success(`${count} bill${count > 1 ? 's' : ''} marked as paid`) },
    onError: (e: any) => toast.error(e?.message ?? 'Bulk pay failed'),
  })
  const quickPayMutation = useMutation({
    mutationFn: (dto: QuickPayDto) => billingApi.quickPay(dto),
    onSuccess: (r) => {
      invalidateAll()
      const msg = r.skipped > 0
        ? `${r.paid} paid, ${r.skipped} already paid — ₹${r.totalAmountPaid.toLocaleString('en-IN')} recorded`
        : `✅ ₹${r.totalAmountPaid.toLocaleString('en-IN')} received from ${r.flatNumber}`
      toast.success(msg)
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Quick pay failed'),
  })

  // ── Derived ──
  const societyName = settingsQuery.data?.societyName ?? 'Society Management Portal'
  const summary = summaryQuery.data
  const bills = billsQuery.data?.data ?? []
  const defaulters = defaultersQuery.data ?? []
  const flats = flatsQuery.data?.data ?? []

  const openPayModal = (bill: MaintenanceBill) => {
    setSelectedBill(bill)
    setPayForm({ amountPaid: bill.totalDue, paymentMode: 'cash', notes: '', paidOn: format(new Date(), 'yyyy-MM-dd') })
    setShowPayModal(true)
  }
  const openEditModal = (bill: MaintenanceBill) => {
    setSelectedBill(bill)
    setEditForm({ dueDate: format(new Date(bill.dueDate), 'yyyy-MM-dd'), amount: String(bill.amount) })
    setShowEditModal(true)
  }
  const openSingleForFlat = (flatId: string) => {
    setSingleForm({ flatId, months: [month], year, rangeMode: false, fromMonth: month, fromYear: year, toMonth: month, toYear: year, dueDate: '', amount: '' })
    setFlatSearch(''); setShowFlatDropdown(false); setShowSingleModal(true)
  }
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds); next.has(id) ? next.delete(id) : next.add(id); setSelectedIds(next)
  }
  const toggleAll = () => {
    const unpaid = bills.filter(b => b.status !== 'paid')
    if (selectedIds.size === unpaid.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(unpaid.map(b => b.id)))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">Maintenance payment tracking & management</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <select value={month} onChange={e => { setMonth(Number(e.target.value)); setBillsSkip(0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => { setYear(Number(e.target.value)); setBillsSkip(0) }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => markOverdueMutation.mutate()}
            className="px-3 py-2 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50">
            Mark Overdue
          </button>
          <button onClick={() => { openSingleForFlat('') }}
            className="px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50">
            + Single Bill
          </button>
          <button onClick={() => { setGenForm({ month, year, dueDayOfMonth: 10 }); setShowGenModal(true) }}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
            Generate Bills
          </button>
        </div>
      </div>

      {/* Overdue Banner */}
      {summary && summary.overdueCount > 0 && (
        <div className="sticky top-0 z-20 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl px-5 py-3 flex items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-bold">
                {summary.overdueCount} overdue bill{summary.overdueCount !== 1 ? 's' : ''} — ₹{summary.totalDue.toLocaleString('en-IN')} outstanding
              </p>
              <p className="text-xs opacity-90 mt-0.5">{MONTHS[month - 1]} {year} · Residents need to be reminded</p>
            </div>
          </div>
          <button
            onClick={() => askConfirm(`Mark all ${summary.overdueCount} overdue bill(s)?`, () => markOverdueMutation.mutate())}
            disabled={markOverdueMutation.isPending}
            className="flex-shrink-0 px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 disabled:opacity-70 transition-colors">
            {markOverdueMutation.isPending ? '⏳ Processing...' : '⚡ Mark All Overdue'}
          </button>
        </div>
      )}

      {/* KPI Bar — cards are clickable (Group 4) */}
      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* Collected — not filterable but shows paid tab */}
          <button onClick={() => { setActiveTab('bills'); setFilterStatus('paid'); setBillsSkip(0) }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-green-200 transition-all group">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Collected</p>
            <p className="text-xl font-bold text-green-600 mt-1">₹{summary.totalCollected.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-green-600">{summary.paidCount} bills paid ↗</p>
          </button>
          {/* Outstanding — navigates to unpaid bills */}
          <button onClick={() => { setActiveTab('bills'); setFilterStatus('unpaid'); setBillsSkip(0) }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-red-200 transition-all group">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Outstanding</p>
            <p className="text-xl font-bold text-red-600 mt-1">₹{summary.totalDue.toLocaleString('en-IN')}</p>
            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-red-600">{summary.unpaidCount + summary.overdueCount} bills pending ↗</p>
          </button>
          {/* Overdue — navigates to overdue bills */}
          <button onClick={() => { setActiveTab('bills'); setFilterStatus('overdue'); setBillsSkip(0) }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-orange-200 transition-all group">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Overdue</p>
            <p className="text-xl font-bold text-orange-600 mt-1">{summary.overdueCount}</p>
            <p className="text-xs text-gray-400 mt-0.5 group-hover:text-orange-600">bills past due date ↗</p>
          </button>
          {/* Collection Rate — opens trend chart */}
          <button onClick={() => setShowTrend(v => !v)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-blue-200 transition-all">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Collection Rate</p>
            <p className="text-xl font-bold text-blue-600 mt-1">{summary.collectionRate}%</p>
            <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${summary.collectionRate}%` }} />
            </div>
            <p className="text-xs text-blue-400 mt-0.5">{showTrend ? '▲ Hide trend' : '📈 View trend'}</p>
          </button>
          {/* Total Bills */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Bills</p>
            <p className="text-xl font-bold text-gray-800 mt-1">{summary.totalBills}</p>
            <p className="text-xs text-gray-400 mt-0.5">{MONTHS[month - 1]} {year}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-400 text-sm">
          No billing data for {MONTHS[month - 1]} {year} — generate bills first
        </div>
      )}

      {/* Trend Chart — Group 5 */}
      {showTrend && (
        <BillingTrendChart data={trendQuery.data ?? []} isLoading={trendQuery.isLoading} />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {(['overview', 'bills', 'defaulters'] as Tab[]).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize transition-colors ${activeTab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'defaulters' ? `⚠️ Defaulters${defaulters.length > 0 ? ` (${defaulters.length})` : ''}` : t === 'overview' ? '🏘️ Property Map' : '📋 All Bills'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <PropertyMapTab
          floorData={floorQuery.data ?? []}
          isLoading={floorQuery.isLoading}
          month={month} year={year} bills={bills}
          onOpenPayModal={openPayModal}
          onOpenSingleModal={openSingleForFlat}
          setActiveTab={setActiveTab}
          onQuickPay={(dto) => quickPayMutation.mutate(dto)}
          quickPayPending={quickPayMutation.isPending}
        />
      )}
      {activeTab === 'bills' && (
        <BillsTab
          bills={bills} isLoading={billsQuery.isLoading}
          total={billsQuery.data?.total ?? 0}
          skip={billsSkip} pageSize={BILLS_PAGE_SIZE}
          filterStatus={filterStatus} selectedIds={selectedIds}
          bulkPayPending={bulkPayMutation.isPending}
          onFilterStatus={(s) => { setFilterStatus(s); setBillsSkip(0) }}
          onPageChange={(s) => { setBillsSkip(s); setSelectedIds(new Set()) }}
          onToggleSelect={toggleSelect} onToggleAll={toggleAll}
          onOpenPayModal={openPayModal} onOpenEditModal={openEditModal}
          onDelete={(id) => deleteMutation.mutate(id)}
          onPrint={(b) => { setSelectedBill(b); setShowPrintModal(true) }}
          onBulkPay={() => bulkPayMutation.mutate()}
          onConfirm={askConfirm}
        />
      )}
      {activeTab === 'defaulters' && (
        <DefaultersTab
          defaulters={defaulters}
          isLoading={defaultersQuery.isLoading}
          societyName={societyName}
          onQuickPay={(dto) => quickPayMutation.mutate(dto)}
          quickPayPending={quickPayMutation.isPending}
        />
      )}

      {/* Modals */}
      {showGenModal && (
        <GenerateBillsModal
          form={genForm} years={years} isPending={genMutation.isPending}
          existingCount={genExistingCount}
          occupiedCount={genOccupiedCount}
          onChange={setGenForm} onSubmit={() => genMutation.mutate()} onClose={() => setShowGenModal(false)} />
      )}
      {showSingleModal && (
        <SingleBillModal form={singleForm} flats={flats} flatsLoading={flatsQuery.isLoading}
          isPending={singleMutation.isPending} years={years}
          flatSearch={flatSearch} showFlatDropdown={showFlatDropdown}
          onChange={setSingleForm} onFlatSearch={setFlatSearch} onFlatDropdown={setShowFlatDropdown}
          onSubmit={() => singleMutation.mutate()} onClose={() => setShowSingleModal(false)} />
      )}
      {showPayModal && selectedBill && (
        <RecordPaymentModal
          billLabel={`Flat ${selectedBill.flatNumber}${selectedBill.residentName ? ` — ${selectedBill.residentName}` : ''} · ${MONTHS[selectedBill.month - 1]} ${selectedBill.year}`}
          baseAmount={selectedBill.amount}
          lateFee={selectedBill.lateFee}
          totalDue={selectedBill.totalDue}
          form={payForm} isPending={payMutation.isPending}
          onChange={setPayForm} onSubmit={() => payMutation.mutate()} onClose={() => setShowPayModal(false)} />
      )}

      {/* Confirm Modal (Group 2) */}
      {confirmState && (
        <ConfirmModal
          message={confirmState.msg}
          onConfirm={() => { confirmState.onOk(); setConfirmState(null) }}
          onCancel={() => setConfirmState(null)} />
      )}
      {showEditModal && selectedBill && (
        <EditBillModal
          billLabel={`Flat ${selectedBill.flatNumber} — ${MONTHS[selectedBill.month - 1]} ${selectedBill.year}`}
          form={editForm} isPending={editMutation.isPending}
          onChange={setEditForm} onSubmit={() => editMutation.mutate()} onClose={() => setShowEditModal(false)} />
      )}
      {showPrintModal && selectedBill && (
        <PrintBillModal bill={selectedBill} societyName={societyName}
          onClose={() => { setShowPrintModal(false); setSelectedBill(null) }} />
      )}
    </div>
  )
}
