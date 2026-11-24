
import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { FlatBillStatus, FlatBillingHistory, FlatBillHistoryRow, billingApi } from '../../../api/billing'
import { MaintenanceBill } from '../../../types'
import { MONTHS_SHORT as MONTHS, MONTHS_LONG } from '../../../constants/labels'
import { flatGridColor, flatPipColor, flatAmountColor, statusBadge } from './billingHelpers'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickPayForm {
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  notes: string
  advanceMode: 'range' | 'pick'
  fromMonth: number
  fromYear: number
  toMonth: number
  toYear: number
  pickedMonths: Array<{ month: number; year: number }>
  customAmount: string
}

export interface Props {
  floorData: FlatBillStatus[]
  isLoading: boolean
  month: number
  year: number
  bills: MaintenanceBill[]
  onOpenPayModal: (bill: MaintenanceBill) => void
  onOpenSingleModal: (flatId: string) => void
  setActiveTab: (tab: 'overview' | 'bills' | 'defaulters') => void
  onQuickPay: (dto: {
    flatId: string
    periods: Array<{ month: number; year: number }>
    amountPaid?: number
    paymentMode: string
    notes?: string
  }) => void
  quickPayPending: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_ICONS: Record<string, string> = {
  cash: '💵', upi: '📱', bank_transfer: '🏦', cheque: '📝',
}
const MODE_LABELS: Record<string, string> = {
  cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque',
}
const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque'] as const

const nowDate = new Date()

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function buildRangePeriods(fromMonth: number, fromYear: number, toMonth: number, toYear: number) {
  const periods: Array<{ month: number; year: number }> = []
  let y = fromYear, m = fromMonth
  const toKey = toYear * 100 + toMonth
  while (y * 100 + m <= toKey && periods.length < 24) {
    periods.push({ month: m, year: y })
    m++; if (m > 12) { m = 1; y++ }
  }
  return periods
}

function historyRowBg(status: 'paid' | 'unpaid' | 'overdue') {
  if (status === 'paid') return 'bg-green-50 border-green-100'
  if (status === 'overdue') return 'bg-red-50 border-red-100'
  return 'bg-yellow-50 border-yellow-100'
}

function historyStatusBadge(status: 'paid' | 'unpaid' | 'overdue') {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'overdue') return 'bg-red-100 text-red-700'
  return 'bg-yellow-100 text-yellow-700'
}

// ─── Billing History Sub-component ───────────────────────────────────────────

function BillingHistoryTable({
  history,
  onPayAllUnpaid,
  onPaySingleMonth,
  quickPayPending,
  month,
  year,
  qpForm,
  setQpForm,
}: {
  history: FlatBillingHistory
  onPayAllUnpaid: (periods: Array<{ month: number; year: number }>) => void
  onPaySingleMonth: (period: { month: number; year: number }) => void
  quickPayPending: boolean
  month: number
  year: number
  qpForm: QuickPayForm
  setQpForm: React.Dispatch<React.SetStateAction<QuickPayForm>>
}) {
  const [activePayRow, setActivePayRow] = useState<string | null>(null)

  const unpaidPeriods = history.bills
    .filter(b => b.status !== 'paid')
    .map(b => ({ month: b.month, year: b.year }))

  const hasUnpaid = unpaidPeriods.length > 0
  const currentMonthUnpaid = history.bills.find(b => b.month === month && b.year === year && b.status !== 'paid')
  // Single past unpaid month (not the selected month) — show its pay button
  const singlePastUnpaid = !currentMonthUnpaid && unpaidPeriods.length === 1 ? unpaidPeriods[0] : null
  const singlePastUnpaidRow = singlePastUnpaid
    ? history.bills.find(b => b.month === singlePastUnpaid.month && b.year === singlePastUnpaid.year)
    : null

  return (
    <div className="space-y-3">
      {/* Cumulative Outstanding Banner */}
      {history.cumulativeDue > 0 && (
        <div className="rounded-xl px-4 py-3 bg-red-50 border border-red-200">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-red-600 font-semibold uppercase tracking-wide">Total Outstanding</p>
              <p className="text-2xl font-black text-red-700">₹{history.cumulativeDue.toLocaleString('en-IN')}</p>
              <p className="text-xs text-red-500 mt-0.5">
                {history.unpaidMonths} unpaid month{history.unpaidMonths !== 1 ? 's' : ''}
              </p>
            </div>
            {history.unpaidMonths > 0 && (
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {currentMonthUnpaid && (
                  <button
                    onClick={() => onPaySingleMonth({ month, year })}
                    disabled={quickPayPending}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {quickPayPending ? '⏳' : `💳 Pay ${MONTHS_LONG[month - 1]}`}
                  </button>
                )}
                {/* Single past unpaid month (selected month has no bill) */}
                {singlePastUnpaidRow && (
                  <button
                    onClick={() => onPaySingleMonth({ month: singlePastUnpaidRow.month, year: singlePastUnpaidRow.year })}
                    disabled={quickPayPending}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {quickPayPending ? '⏳' : `💳 Pay ${MONTHS_LONG[singlePastUnpaidRow.month - 1]}`}
                  </button>
                )}
                {history.unpaidMonths > 1 && (
                  <button
                    onClick={() => onPayAllUnpaid(unpaidPeriods)}
                    disabled={quickPayPending}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                  >
                    {quickPayPending ? '⏳' : `⚡ Pay All (${history.unpaidMonths})`}
                  </button>
                )}
              </div>
            )}
          </div>
          {/* Inline payment mode picker — shown whenever there's anything to pay */}
          {hasUnpaid && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs font-semibold text-red-700 mb-2">Payment Method</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PAYMENT_MODES.map(mode => (
                  <button key={mode}
                    onClick={() => setQpForm(f => ({ ...f, paymentMode: mode }))}
                    className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${qpForm.paymentMode === mode ? 'border-red-500 bg-red-600 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                  >
                    <span>{MODE_ICONS[mode]}</span>
                    <span>{MODE_LABELS[mode].split(' ')[0]}</span>
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Notes (optional)"
                value={qpForm.notes}
                onChange={e => setQpForm(f => ({ ...f, notes: e.target.value }))}
                className="mt-2 w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-300 text-gray-700 placeholder-gray-400"
              />
            </div>
          )}
        </div>
      )}

      {/* All-paid state */}
      {history.cumulativeDue === 0 && history.totalPaid > 0 && (
        <div className="rounded-xl px-4 py-3 bg-green-50 border border-green-200 text-center">
          <p className="text-green-700 font-bold">✅ All bills paid</p>
          <p className="text-xs text-green-600 mt-0.5">₹{history.totalPaid.toLocaleString('en-IN')} collected total</p>
        </div>
      )}

      {/* History list */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Billing History ({history.totalBills} bill{history.totalBills !== 1 ? 's' : ''})
        </p>
        {history.bills.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">No bills generated for this flat yet</div>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
            {history.bills.map((row: FlatBillHistoryRow) => {
              const isCurrentMonth = row.month === month && row.year === year
              const isPayOpen = activePayRow === row.billId
              return (
                <div
                  key={row.billId}
                  className={`rounded-lg border ${historyRowBg(row.status)} ${isCurrentMonth ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                >
                  {/* Row header */}
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700">
                          {MONTHS_LONG[row.month - 1]} {row.year}
                        </span>
                        {isCurrentMonth && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${historyStatusBadge(row.status)}`}>
                          {row.status === 'paid' ? '✓ Paid' : row.status === 'overdue' ? '⚠️ Overdue' : '⏳ Unpaid'}
                        </span>
                        {row.status !== 'paid' && (
                          <button
                            onClick={() => setActivePayRow(isPayOpen ? null : row.billId)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors whitespace-nowrap ${isPayOpen ? 'bg-gray-200 text-gray-600' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                          >
                            {isPayOpen ? '✕ Cancel' : '💳 Pay'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs text-gray-500">
                        ₹{row.amount.toLocaleString('en-IN')}
                        {row.lateFee > 0 && (
                          <span className="text-red-500 ml-1">+₹{row.lateFee.toLocaleString('en-IN')} late</span>
                        )}
                      </div>
                      <div className="text-xs font-semibold">
                        {row.status === 'paid' ? (
                          <span className="text-green-600">
                            Paid {row.paidOn ? format(new Date(row.paidOn), 'dd MMM yy') : ''}
                            {row.paymentMode && (
                              <span className="text-gray-400 ml-1 font-normal">
                                ({row.paymentMode.replace('_', ' ')})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-red-600">₹{row.totalDue.toLocaleString('en-IN')} due</span>
                        )}
                      </div>
                    </div>
                    {row.status !== 'paid' && row.dueDate && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        Due: {format(new Date(row.dueDate), 'dd MMM yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Inline pay form — expands on row Pay click */}
                  {isPayOpen && (
                    <div className="border-t border-gray-200 px-3 py-2.5 bg-white rounded-b-lg space-y-2">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                        Payment Method
                      </p>
                      <div className="grid grid-cols-4 gap-1">
                        {PAYMENT_MODES.map(mode => (
                          <button key={mode}
                            onClick={() => setQpForm(f => ({ ...f, paymentMode: mode }))}
                            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${qpForm.paymentMode === mode ? 'border-green-500 bg-green-600 text-white' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'}`}
                          >
                            <span>{MODE_ICONS[mode]}</span>
                            <span>{MODE_LABELS[mode].split(' ')[0]}</span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={qpForm.notes}
                        onChange={e => setQpForm(f => ({ ...f, notes: e.target.value }))}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-700 placeholder-gray-400"
                      />
                      <button
                        onClick={() => {
                          onPaySingleMonth({ month: row.month, year: row.year })
                          setActivePayRow(null)
                        }}
                        disabled={quickPayPending}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        {quickPayPending ? '⏳ Processing...' : `✓ Confirm — Pay ₹${row.totalDue.toLocaleString('en-IN')} (${MODE_LABELS[qpForm.paymentMode]})`}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Quick Pay form for unpaid/overdue flats ──────────────────────────────────

function QuickPayPanel({
  flat,
  month,
  year,
  qpForm,
  setQpForm,
  quickPayPending,
  onPay,
  onFullModal,
  years,
}: {
  flat: FlatBillStatus
  month: number
  year: number
  qpForm: QuickPayForm
  setQpForm: React.Dispatch<React.SetStateAction<QuickPayForm>>
  quickPayPending: boolean
  onPay: () => void
  onFullModal: () => void
  years: number[]
}) {
  const MONTHS_LIST = MONTHS

  return (
    <div className="space-y-4">
      {/* Current month bill summary */}
      <div className={`rounded-xl px-4 py-3 flex items-center justify-between ${flat.billStatus === 'overdue' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div>
          <p className="text-xs text-gray-500 font-medium">{MONTHS_LIST[month - 1]} {year}</p>
          <p className="text-xl font-bold text-gray-900">₹{flat.totalDue.toLocaleString('en-IN')}</p>
          {flat.lateFee > 0 && (
            <p className="text-xs text-red-500 font-medium">incl. ₹{flat.lateFee.toLocaleString('en-IN')} late fee</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${statusBadge(flat.billStatus)}`}>
          {flat.billStatus === 'overdue' ? '⚠️ Overdue' : '⏳ Unpaid'}
        </span>
      </div>
      {flat.dueDate && (
        <p className="text-xs text-gray-400 -mt-2">Due: {format(new Date(flat.dueDate), 'dd MMM yyyy')}</p>
      )}

      {/* Payment mode */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Payment Method</p>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_MODES.map(mode => (
            <button key={mode}
              onClick={() => setQpForm(f => ({ ...f, paymentMode: mode }))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${qpForm.paymentMode === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
            >
              <span className="text-lg">{MODE_ICONS[mode]}</span>
              <span>{MODE_LABELS[mode].split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <input
        type="text"
        placeholder="Notes (optional)"
        value={qpForm.notes}
        onChange={e => setQpForm(f => ({ ...f, notes: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
      />

      {/* Pay Now */}
      <button
        onClick={onPay}
        disabled={quickPayPending}
        className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2"
      >
        {quickPayPending
          ? <><span className="animate-spin text-sm">⏳</span> Processing...</>
          : <>💳 Pay ₹{flat.totalDue.toLocaleString('en-IN')} — {MONTHS_LIST[month - 1]} {year}</>
        }
      </button>

      {/* Escape hatch */}
      <div className="text-center">
        <button onClick={onFullModal} className="text-xs text-gray-400 hover:text-gray-600 underline">
          Enter a different amount or date →
        </button>
      </div>
    </div>
  )
}

// ─── Advance Pay form for no-bill flats ──────────────────────────────────────

function AdvancePayPanel({
  flat,
  month,
  year,
  qpForm,
  setQpForm,
  quickPayPending,
  onPay,
  onCreateBill,
  years,
}: {
  flat: FlatBillStatus
  month: number
  year: number
  qpForm: QuickPayForm
  setQpForm: React.Dispatch<React.SetStateAction<QuickPayForm>>
  quickPayPending: boolean
  onPay: () => void
  onCreateBill: () => void
  years: number[]
}) {
  const MONTHS_LIST = MONTHS

  const rangePeriods = useMemo(
    () => buildRangePeriods(qpForm.fromMonth, qpForm.fromYear, qpForm.toMonth, qpForm.toYear),
    [qpForm.fromMonth, qpForm.fromYear, qpForm.toMonth, qpForm.toYear]
  )

  const pickGrid = useMemo(() => {
    const grid: Array<{ month: number; year: number; label: string }> = []
    for (let i = -6; i <= 6; i++) {
      const d = new Date(year, month - 1 + i, 1)
      grid.push({ month: d.getMonth() + 1, year: d.getFullYear(), label: `${MONTHS_LIST[d.getMonth()]} ${d.getFullYear()}` })
    }
    return grid
  }, [month, year])

  const togglePickMonth = (m: number, y: number) => {
    const key = `${y}-${m}`
    const idx = qpForm.pickedMonths.findIndex(p => `${p.year}-${p.month}` === key)
    if (idx >= 0) {
      setQpForm(prev => ({ ...prev, pickedMonths: prev.pickedMonths.filter((_, i) => i !== idx) }))
    } else if (qpForm.pickedMonths.length < 24) {
      setQpForm(prev => ({ ...prev, pickedMonths: [...prev.pickedMonths, { month: m, year: y }] }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-sm font-semibold text-blue-800">💰 Record Advance Payment</p>
        <p className="text-xs text-blue-600 mt-0.5">No bill exists yet — select months to pay in advance</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setQpForm(f => ({ ...f, advanceMode: 'range' }))}
          className={`flex-1 py-2 rounded-lg font-medium border transition-all ${qpForm.advanceMode === 'range' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
        >
          📅 Date Range
        </button>
        <button
          onClick={() => setQpForm(f => ({ ...f, advanceMode: 'pick' }))}
          className={`flex-1 py-2 rounded-lg font-medium border transition-all ${qpForm.advanceMode === 'pick' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
        >
          ☑️ Pick Months
        </button>
      </div>

      {/* Range mode */}
      {qpForm.advanceMode === 'range' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
              <div className="flex gap-1">
                <select value={qpForm.fromMonth} onChange={e => setQpForm(f => ({ ...f, fromMonth: Number(e.target.value) }))}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {MONTHS_LIST.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={qpForm.fromYear} onChange={e => setQpForm(f => ({ ...f, fromYear: Number(e.target.value) }))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
              <div className="flex gap-1">
                <select value={qpForm.toMonth} onChange={e => setQpForm(f => ({ ...f, toMonth: Number(e.target.value) }))}
                  className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {MONTHS_LIST.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select value={qpForm.toYear} onChange={e => setQpForm(f => ({ ...f, toYear: Number(e.target.value) }))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
          {rangePeriods.length > 0 && (
            <p className="text-xs text-blue-600 font-medium text-center">
              {rangePeriods.length} month{rangePeriods.length > 1 ? 's' : ''} selected
              {rangePeriods.length > 1 && ` (${MONTHS_LIST[rangePeriods[0].month - 1]} ${rangePeriods[0].year} → ${MONTHS_LIST[rangePeriods[rangePeriods.length - 1].month - 1]} ${rangePeriods[rangePeriods.length - 1].year})`}
            </p>
          )}
        </div>
      )}

      {/* Pick mode */}
      {qpForm.advanceMode === 'pick' && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Tap months to select (max 24)</p>
          <div className="grid grid-cols-3 gap-1.5">
            {pickGrid.map(({ month: m, year: y, label }) => {
              const isSelected = qpForm.pickedMonths.some(p => p.month === m && p.year === y)
              return (
                <button key={label} onClick={() => togglePickMonth(m, y)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${isSelected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                  {label}
                </button>
              )
            })}
          </div>
          {qpForm.pickedMonths.length > 0 && (
            <p className="text-xs text-blue-600 font-medium text-center">{qpForm.pickedMonths.length} month{qpForm.pickedMonths.length > 1 ? 's' : ''} selected</p>
          )}
        </div>
      )}

      {/* Custom amount */}
      <div>
        <label className="text-xs font-medium text-gray-600 block mb-1">Amount per month (₹)</label>
        <input
          type="number"
          placeholder="Auto-calculated from settings"
          value={qpForm.customAmount}
          onChange={e => setQpForm(f => ({ ...f, customAmount: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Payment method */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-2">Payment Method</p>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_MODES.map(mode => (
            <button key={mode}
              onClick={() => setQpForm(f => ({ ...f, paymentMode: mode }))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${qpForm.paymentMode === mode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
            >
              <span className="text-lg">{MODE_ICONS[mode]}</span>
              <span>{MODE_LABELS[mode].split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <input
        type="text"
        placeholder="Notes (optional)"
        value={qpForm.notes}
        onChange={e => setQpForm(f => ({ ...f, notes: e.target.value }))}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
      />

      {/* CTA */}
      <button
        onClick={onPay}
        disabled={quickPayPending || (qpForm.advanceMode === 'range' ? rangePeriods.length === 0 : qpForm.pickedMonths.length === 0)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2"
      >
        {quickPayPending
          ? <><span className="animate-spin text-sm">⏳</span> Processing...</>
          : <>
              💰 Save Advance Payment
              {(qpForm.advanceMode === 'range' ? rangePeriods.length : qpForm.pickedMonths.length) > 1
                && ` (${qpForm.advanceMode === 'range' ? rangePeriods.length : qpForm.pickedMonths.length} months)`}
            </>
        }
      </button>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <button
        onClick={onCreateBill}
        className="w-full py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
      >
        📄 Create Bill for this Flat First
      </button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyMapTab({
  floorData, isLoading, month, year, bills,
  onOpenPayModal, onOpenSingleModal, setActiveTab,
  onQuickPay, quickPayPending,
}: Props) {
  const [selectedFlat, setSelectedFlat] = useState<FlatBillStatus | null>(null)
  const [drawerTab, setDrawerTab] = useState<'history' | 'pay'>('pay')
  const [showAdvanceAfterPay, setShowAdvanceAfterPay] = useState(false)
  const [qpForm, setQpForm] = useState<QuickPayForm>({
    paymentMode: 'cash', notes: '',
    advanceMode: 'range',
    fromMonth: month, fromYear: year,
    toMonth: month, toYear: year,
    pickedMonths: [{ month, year }],
    customAmount: '',
  })

  const years = Array.from({ length: 6 }, (_, i) => nowDate.getFullYear() - 2 + i)

  // Fetch full billing history for selected flat
  const historyQuery = useQuery({
    queryKey: ['flat-billing-history', selectedFlat?.flatId],
    queryFn: () => billingApi.getFlatHistory(selectedFlat!.flatId),
    enabled: !!selectedFlat,
    staleTime: 30_000,
  })

  // Re-sync selectedFlat from updated floorData after payment invalidation
  useEffect(() => {
    if (!selectedFlat) return
    const updated = floorData.find(f => f.flatId === selectedFlat.flatId)
    if (updated) setSelectedFlat(updated)
  }, [floorData])

  // Select a flat: open drawer, reset form, start on pay tab
  const selectFlat = (flat: FlatBillStatus) => {
    setSelectedFlat(flat)
    setDrawerTab('pay')
    setShowAdvanceAfterPay(false)
    setQpForm({
      paymentMode: 'cash', notes: '',
      advanceMode: 'range',
      fromMonth: month, fromYear: year,
      toMonth: month, toYear: year,
      pickedMonths: [{ month, year }],
      customAmount: '',
    })
  }

  // ── Block / floor grouping ──────────────────────────────────────────────────
  const blockGroups = useMemo(() => {
    const blockMap = new Map<string, { blockId: string | null; blockName: string; floors: Map<number, FlatBillStatus[]> }>()
    for (const f of floorData) {
      const blockKey = f.blockId ?? '__noblock__'
      const blockName = f.blockName ?? 'Unassigned'
      if (!blockMap.has(blockKey)) blockMap.set(blockKey, { blockId: f.blockId, blockName, floors: new Map() })
      const floorKey = f.floor ?? 0
      const block = blockMap.get(blockKey)!
      block.floors.set(floorKey, [...(block.floors.get(floorKey) ?? []), f])
    }
    return Array.from(blockMap.entries())
      .sort((a, b) => a[1].blockName.localeCompare(b[1].blockName))
      .map(([blockKey, { blockId, blockName, floors }]) => ({
        blockKey, blockId, blockName,
        floorGroups: Array.from(floors.entries()).sort((a, b) => b[0] - a[0]),
      }))
  }, [floorData])

  // ── "Enter different amount" → opens full RecordPaymentModal ───────────────
  const handleOpenFullPayModal = async (flat: FlatBillStatus) => {
    const billId = flat.billId!
    let fullBill = bills.find(b => b.id === billId)
    if (!fullBill) {
      try { fullBill = await billingApi.getById(billId) }
      catch { setActiveTab('bills'); setSelectedFlat(null); return }
    }
    setSelectedFlat(null)
    onOpenPayModal(fullBill)
  }

  // ── Quick Pay for a specific period ────────────────────────────────────────
  const handleQuickPayCurrentMonth = (flat: FlatBillStatus, period?: { month: number; year: number }) => {
    onQuickPay({
      flatId: flat.flatId,
      periods: [period ?? { month, year }],
      paymentMode: qpForm.paymentMode,
      notes: qpForm.notes || undefined,
    })
  }

  // ── Pay all unpaid (from history banner) ───────────────────────────────────
  const handlePayAllUnpaid = (periods: Array<{ month: number; year: number }>) => {
    if (!selectedFlat) return
    onQuickPay({
      flatId: selectedFlat.flatId,
      periods,
      paymentMode: qpForm.paymentMode,
      notes: qpForm.notes || undefined,
    })
  }

  // ── Advance Pay submit (no_bill flat) ──────────────────────────────────────
  const handleAdvancePay = (flat: FlatBillStatus) => {
    const periods =
      qpForm.advanceMode === 'range'
        ? buildRangePeriods(qpForm.fromMonth, qpForm.fromYear, qpForm.toMonth, qpForm.toYear)
        : [...qpForm.pickedMonths]
    if (periods.length === 0) return
    onQuickPay({
      flatId: flat.flatId,
      periods,
      amountPaid: qpForm.customAmount ? Number(qpForm.customAmount) : undefined,
      paymentMode: qpForm.paymentMode,
      notes: qpForm.notes || undefined,
    })
  }

  // ── Tile amount: show cumulativeDue including no_bill flats with past arrears ──
  const tileAmount = (flat: FlatBillStatus) => {
    if (flat.billStatus === 'paid') return '✓ Paid'
    // no_bill for selected month but has past unpaid months — show cumulative
    if (flat.billStatus === 'no_bill') {
      return flat.cumulativeDue > 0 ? `₹${flat.cumulativeDue.toLocaleString('en-IN')}` : ''
    }
    const due = flat.cumulativeDue > flat.totalDue ? flat.cumulativeDue : flat.totalDue
    return due > 0 ? `₹${due.toLocaleString('en-IN')}` : '—'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs items-center">
        {[
          { color: 'bg-green-100 border-green-300', label: 'Paid' },
          { color: 'bg-yellow-50 border-yellow-300', label: 'Unpaid' },
          { color: 'bg-red-100 border-red-300', label: 'Overdue' },
          { color: 'bg-gray-50 border-gray-200', label: 'No Bill' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded border ${color}`} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
        <span className="ml-auto text-gray-400 italic hidden sm:block text-[11px]">
          🔢 Orange badge = arrears · Click flat to view history & pay
        </span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-16 h-6 bg-gray-200 rounded" />
              <div className="flex gap-2 flex-1">
                {[...Array(12)].map((__, j) => <div key={j} className="h-16 bg-gray-200 rounded flex-1" />)}
              </div>
            </div>
          ))}
        </div>
      ) : blockGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-2">🏘️</div>
          <p className="text-gray-500 font-medium">No property data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {blockGroups.map(({ blockKey, blockName, floorGroups: bFloorGroups }) => {
            const allFlats = bFloorGroups.flatMap(([, flats]) => flats)
            const blockPaid = allFlats.filter(f => f.billStatus === 'paid').length
            const blockOverdue = allFlats.filter(f => f.billStatus === 'overdue').length
            const blockUnpaid = allFlats.filter(f => f.billStatus === 'unpaid').length
            const blockDue = allFlats.reduce(
              (s, f) => s + (f.billStatus !== 'paid' ? (f.cumulativeDue || f.totalDue) : 0), 0,
            )
            return (
              <div key={blockKey} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-sm font-bold text-gray-700">🏗️ {blockName}</span>
                  <div className="flex items-center gap-3 text-xs">
                    {blockPaid > 0 && <span className="text-green-600 font-medium">✓ {blockPaid} paid</span>}
                    {blockUnpaid > 0 && <span className="text-yellow-600 font-medium">⏳ {blockUnpaid} pending</span>}
                    {blockOverdue > 0 && <span className="text-red-600 font-medium">⚠ {blockOverdue} overdue</span>}
                    {blockDue > 0 && <span className="text-gray-500 font-medium">₹{blockDue.toLocaleString('en-IN')} due</span>}
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {bFloorGroups.map(([floor, flats]) => {
                    const floorPaid = flats.filter(f => f.billStatus === 'paid').length
                    const floorOverdue = flats.filter(f => f.billStatus === 'overdue').length
                    const floorUnpaid = flats.filter(f => f.billStatus === 'unpaid').length
                    const floorDue = flats.reduce(
                      (s, f) => s + (f.billStatus !== 'paid' ? (f.cumulativeDue || f.totalDue) : 0), 0,
                    )
                    const floorLbl = floor === 0 ? 'Ground' : `Floor ${floor}`
                    return (
                      <div key={floor}>
                        <div className="flex items-start gap-3">
                          <div className="w-16 flex-shrink-0 text-right pt-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">{floorLbl}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 flex-1">
                            {flats.map(flat => {
                              const hasArrears = flat.unpaidMonths >= 1
                              return (
                                <button
                                  key={flat.flatId}
                                  onClick={() => selectFlat(flat)}
                                  className={`relative border-2 rounded-xl p-2 text-center transition-all hover:scale-105 hover:shadow-md active:scale-95 ${flatGridColor(flat.billStatus)}`}
                                  style={{ minWidth: '80px', minHeight: '72px' }}
                                  title={`${flat.flatNumber}${flat.residentName ? ` — ${flat.residentName}` : ''}${flat.cumulativeDue > 0 ? ` · ₹${flat.cumulativeDue.toLocaleString('en-IN')} total due` : ''}`}
                                >
                                  <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${flatPipColor(flat.billStatus)}`} />
                                  {hasArrears && (
                                    <span
                                      className="absolute top-1 left-1 w-3.5 h-3.5 rounded-full bg-orange-500 text-white flex items-center justify-center"
                                      style={{ fontSize: '8px', fontWeight: 'bold' }}
                                    >
                                      {flat.unpaidMonths}
                                    </span>
                                  )}
                                  <p className="text-xs font-bold leading-tight">{flat.flatNumber}</p>
                                  {flat.residentName && (
                                    <p className="leading-tight truncate" style={{ fontSize: '9px', maxWidth: '72px' }}>
                                      {flat.residentName.split(' ')[0]}
                                    </p>
                                  )}
                                  {(flat.billStatus !== 'no_bill' || flat.cumulativeDue > 0) && (
                                    <p className={`font-semibold leading-tight mt-0.5 ${flat.billStatus === 'no_bill' ? 'text-red-600' : flatAmountColor(flat.billStatus)}`} style={{ fontSize: '10px' }}>
                                      {tileAmount(flat)}
                                    </p>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-20 mt-1 mb-0.5">
                          {floorPaid > 0 && <span className="text-xs text-green-600 font-medium">✓ {floorPaid} paid</span>}
                          {floorUnpaid > 0 && <span className="text-xs text-yellow-600 font-medium">⏳ {floorUnpaid} pending</span>}
                          {floorOverdue > 0 && <span className="text-xs text-red-600 font-medium">⚠ {floorOverdue} overdue</span>}
                          {floorDue > 0 && <span className="text-xs text-gray-400 font-medium ml-auto">₹{floorDue.toLocaleString('en-IN')}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Flat Detail Drawer ─────────────────────────────────────────────── */}
      {selectedFlat && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setSelectedFlat(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedFlat.flatNumber}</h2>
                <p className="text-sm text-gray-500">
                  {selectedFlat.blockName ? `${selectedFlat.blockName} · ` : ''}
                  {selectedFlat.floor != null ? `Floor ${selectedFlat.floor} · ` : ''}
                  {selectedFlat.type} · {selectedFlat.sqFt} sqft
                </p>
              </div>
              <button onClick={() => setSelectedFlat(null)} className="text-gray-400 hover:text-gray-600 text-xl p-1">✕</button>
            </div>

            {/* Resident info */}
            {selectedFlat.residentName && (
              <div className="mx-5 mb-3 bg-gray-50 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="text-lg">👤</span>
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFlat.residentName}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedFlat.residentType ?? ''}</p>
                </div>
              </div>
            )}

            {/* Drawer Tabs */}
            <div className="flex border-b border-gray-100 mx-5 mb-4">
              <button
                onClick={() => setDrawerTab('pay')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${drawerTab === 'pay' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                💳 Pay
              </button>
              <button
                onClick={() => setDrawerTab('history')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${drawerTab === 'history' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                📋 Billing History
              </button>
            </div>

            {/* ── HISTORY TAB ──────────────────────────────────────────────── */}
            {drawerTab === 'history' && (
              <div className="px-5 pb-5 space-y-4">
                {historyQuery.isLoading ? (
                  <div className="space-y-2 animate-pulse">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
                  </div>
                ) : historyQuery.data ? (
                  <BillingHistoryTable
                    history={historyQuery.data}
                    onPayAllUnpaid={handlePayAllUnpaid}
                    onPaySingleMonth={(period) => handleQuickPayCurrentMonth(selectedFlat, period)}
                    quickPayPending={quickPayPending}
                    month={month}
                    year={year}
                    qpForm={qpForm}
                    setQpForm={setQpForm}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">Failed to load history</div>
                )}

                {/* No bill flat — advance pay / create bill */}
                {selectedFlat.billStatus === 'no_bill' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDrawerTab('pay')}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      💰 Advance Pay →
                    </button>
                    <button
                      onClick={() => { onOpenSingleModal(selectedFlat.flatId); setSelectedFlat(null) }}
                      className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      📄 Create Bill
                    </button>
                  </div>
                )}
                {selectedFlat.billStatus === 'paid' && (
                  <div className="text-center py-2">
                    <p className="text-xs text-gray-400">All bills for selected month are paid ✓</p>
                  </div>
                )}
              </div>
            )}

            {/* ── PAY TAB ───────────────────────────────────────────────────── */}
            {drawerTab === 'pay' && (
              <div className="px-5 pb-5">
                {/* Paid flat — show confirmation + next actions */}
                {selectedFlat.billStatus === 'paid' && !showAdvanceAfterPay && (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <div className="text-4xl mb-2">✅</div>
                      <p className="text-green-700 font-bold text-base">{MONTHS[month - 1]} {year} — Paid</p>
                      <p className="text-xs text-gray-400 mt-1">₹{selectedFlat.amount.toLocaleString('en-IN')} collected</p>
                      {selectedFlat.dueDate && (
                        <p className="text-xs text-gray-400">Due was {format(new Date(selectedFlat.dueDate), 'dd MMM yyyy')}</p>
                      )}
                    </div>
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 text-center font-medium uppercase tracking-wide">Next Actions</p>
                      <button
                        onClick={() => setShowAdvanceAfterPay(true)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                      >
                        💰 Record Advance Payment
                      </button>
                      <button
                        onClick={() => { onOpenSingleModal(selectedFlat.flatId); setSelectedFlat(null) }}
                        className="w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        📄 Create New Bill
                      </button>
                    </div>
                  </div>
                )}

                {/* Paid flat — advance pay mode */}
                {selectedFlat.billStatus === 'paid' && showAdvanceAfterPay && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowAdvanceAfterPay(false)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      ← Back
                    </button>
                    <AdvancePayPanel
                      flat={selectedFlat}
                      month={month}
                      year={year}
                      qpForm={qpForm}
                      setQpForm={setQpForm}
                      quickPayPending={quickPayPending}
                      onPay={() => handleAdvancePay(selectedFlat)}
                      onCreateBill={() => { onOpenSingleModal(selectedFlat.flatId); setSelectedFlat(null) }}
                      years={years}
                    />
                  </div>
                )}

                {/* Unpaid / Overdue flat */}
                {(selectedFlat.billStatus === 'unpaid' || selectedFlat.billStatus === 'overdue') && (
                  <QuickPayPanel
                    flat={selectedFlat}
                    month={month}
                    year={year}
                    qpForm={qpForm}
                    setQpForm={setQpForm}
                    quickPayPending={quickPayPending}
                    onPay={() => handleQuickPayCurrentMonth(selectedFlat)}
                    onFullModal={() => handleOpenFullPayModal(selectedFlat)}
                    years={years}
                  />
                )}

                {/* No bill flat — but has past arrears: show history tab hint + advance pay */}
                {selectedFlat.billStatus === 'no_bill' && selectedFlat.cumulativeDue > 0 && (
                  <div className="space-y-3">
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <p className="text-sm font-semibold text-red-800">⚠️ Past Arrears</p>
                      <p className="text-xs text-red-600 mt-0.5">
                        ₹{selectedFlat.cumulativeDue.toLocaleString('en-IN')} due across {selectedFlat.unpaidMonths} past month{selectedFlat.unpaidMonths !== 1 ? 's' : ''}
                      </p>
                      <button
                        onClick={() => setDrawerTab('history')}
                        className="mt-2 text-xs text-red-700 font-semibold underline"
                      >
                        View Billing History & Pay →
                      </button>
                    </div>
                    <AdvancePayPanel
                      flat={selectedFlat}
                      month={month}
                      year={year}
                      qpForm={qpForm}
                      setQpForm={setQpForm}
                      quickPayPending={quickPayPending}
                      onPay={() => handleAdvancePay(selectedFlat)}
                      onCreateBill={() => { onOpenSingleModal(selectedFlat.flatId); setSelectedFlat(null) }}
                      years={years}
                    />
                  </div>
                )}

                {/* No bill flat — no arrears */}
                {selectedFlat.billStatus === 'no_bill' && selectedFlat.cumulativeDue === 0 && (
                  <AdvancePayPanel
                    flat={selectedFlat}
                    month={month}
                    year={year}
                    qpForm={qpForm}
                    setQpForm={setQpForm}
                    quickPayPending={quickPayPending}
                    onPay={() => handleAdvancePay(selectedFlat)}
                    onCreateBill={() => { onOpenSingleModal(selectedFlat.flatId); setSelectedFlat(null) }}
                    years={years}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
