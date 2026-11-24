import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Defaulter } from '../../../api/billing'
import { MONTHS_SHORT as MONTHS, MONTHS_LONG } from '../../../constants/labels'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PayIntent {
  flatId: string
  flatNumber: string
  residentName: string | null
  periods: Array<{ month: number; year: number }>
  totalAmount: number
  label: string // e.g. "Jun 2026" or "3 months"
}

interface PayForm {
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  notes: string
  referenceNumber: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_ICONS: Record<string, string> = {
  cash: '💵', upi: '📱', bank_transfer: '🏦', cheque: '📝',
}
const MODE_LABELS: Record<string, string> = {
  cash: 'Cash', upi: 'UPI', bank_transfer: 'Bank Transfer', cheque: 'Cheque',
}
const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque'] as const

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  defaulters: Defaulter[]
  isLoading: boolean
  societyName: string
  onQuickPay: (dto: {
    flatId: string
    periods: Array<{ month: number; year: number }>
    paymentMode: string
    notes?: string
  }) => void
  quickPayPending: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DefaultersTab({ defaulters, isLoading, societyName, onQuickPay, quickPayPending }: Props) {
  const [detailItem, setDetailItem] = useState<Defaulter | null>(null)
  const [payIntent, setPayIntent] = useState<PayIntent | null>(null)
  const [payForm, setPayForm] = useState<PayForm>({ paymentMode: 'cash', notes: '', referenceNumber: '' })
  // Track whether we submitted a payment — only then close on pending→false
  const didSubmitRef = useRef(false)

  const openPayModal = (intent: PayIntent) => {
    didSubmitRef.current = false
    setPayIntent(intent)
    setPayForm({ paymentMode: 'cash', notes: '', referenceNumber: '' })
  }

  // Auto-close pay modal when mutation completes after submission
  useEffect(() => {
    if (!quickPayPending && didSubmitRef.current) {
      didSubmitRef.current = false
      setPayIntent(null)
    }
  }, [quickPayPending])

  const submitPay = () => {
    if (!payIntent) return
    const noteParts: string[] = []
    if (payForm.referenceNumber.trim()) noteParts.push(`Ref: ${payForm.referenceNumber.trim()}`)
    if (payForm.notes.trim()) noteParts.push(payForm.notes.trim())
    didSubmitRef.current = true
    onQuickPay({
      flatId: payIntent.flatId,
      periods: payIntent.periods,
      paymentMode: payForm.paymentMode,
      notes: noteParts.length > 0 ? noteParts.join(' | ') : undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
      </div>
    )
  }

  if (defaulters.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">🎉</div>
        <p className="text-gray-600 font-semibold text-lg">No Defaulters!</p>
        <p className="text-gray-400 text-sm mt-1">All residents are up to date on payments</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {defaulters.map(d => (
          <div key={d.flatId} className="bg-white rounded-xl border border-red-100 shadow-sm p-4">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-900">{d.flatNumber}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {d.unpaidMonths} month{d.unpaidMonths !== 1 ? 's' : ''} unpaid
                  </span>
                </div>
                {d.residentName && (
                  <p className="text-sm text-gray-600 mt-0.5">{d.residentName}{d.phone ? ` · ${d.phone}` : ''}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">₹{d.totalOutstanding.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400">total outstanding</p>
              </div>
            </div>

            {/* Month chips — click to pay single month */}
            <div className="mt-3 flex flex-wrap gap-2">
              {d.bills.map(b => (
                <button
                  key={`${b.month}-${b.year}`}
                  onClick={() => openPayModal({
                    flatId: d.flatId,
                    flatNumber: d.flatNumber,
                    residentName: d.residentName,
                    periods: [{ month: b.month, year: b.year }],
                    totalAmount: b.totalDue,
                    label: `${MONTHS_LONG[b.month - 1]} ${b.year}`,
                  })}
                  title={`Record payment for ${MONTHS[b.month - 1]} ${b.year}`}
                  className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-100 hover:border-red-300 text-xs transition-all cursor-pointer text-left group"
                >
                  <span className="font-medium text-red-800">{MONTHS[b.month - 1]} {b.year}</span>
                  <span className="text-red-600 ml-1.5">₹{b.totalDue.toLocaleString('en-IN')}</span>
                  {b.lateFee > 0 && <span className="text-red-400 ml-1">(+₹{b.lateFee.toLocaleString('en-IN')} late)</span>}
                  <span className="ml-1.5 text-red-300 group-hover:text-red-500 transition-colors">💳</span>
                </button>
              ))}
            </div>

            {/* Action row */}
            <div className="mt-3 flex flex-wrap gap-3 items-center">
              {/* Pay All button — opens modal with all periods */}
              <button
                onClick={() => openPayModal({
                  flatId: d.flatId,
                  flatNumber: d.flatNumber,
                  residentName: d.residentName,
                  periods: d.bills.map(b => ({ month: b.month, year: b.year })),
                  totalAmount: d.totalOutstanding,
                  label: `${d.unpaidMonths} month${d.unpaidMonths !== 1 ? 's' : ''}`,
                })}
                className="inline-flex items-center gap-1.5 text-xs text-white font-medium bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                ⚡ Pay All ({d.unpaidMonths}) — ₹{d.totalOutstanding.toLocaleString('en-IN')}
              </button>

              <button
                onClick={() => setDetailItem(d)}
                className="text-xs text-blue-600 hover:underline"
              >
                View Details
              </button>

              {d.phone && (
                <a
                  href={`https://wa.me/91${d.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Dear ${d.residentName ?? 'Resident'},\n\nThis is a reminder that your society maintenance for ${d.unpaidMonths} month${d.unpaidMonths !== 1 ? 's' : ''} totalling ₹${d.totalOutstanding.toLocaleString('en-IN')} is overdue.\n\nPlease pay at your earliest convenience.\n\n— ${societyName}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg hover:bg-green-100 transition"
                >
                  <span>💬</span> WhatsApp Reminder
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Pay Modal ──────────────────────────────────────────────────────── */}
      {payIntent && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => !quickPayPending && setPayIntent(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Record Payment</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {payIntent.flatNumber}{payIntent.residentName ? ` — ${payIntent.residentName}` : ''}
                </p>
              </div>
              <button
                onClick={() => setPayIntent(null)}
                disabled={quickPayPending}
                className="text-gray-400 hover:text-gray-600 text-xl disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Amount summary */}
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Amount Due</p>
                  <p className="text-2xl font-black text-red-700">₹{payIntent.totalAmount.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-red-500 mt-0.5">{payIntent.label}</p>
                </div>
                {payIntent.periods.length > 1 && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                    {payIntent.periods.length} months
                  </span>
                )}
              </div>

              {/* Payment mode */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Payment Method *</p>
                <div className="grid grid-cols-4 gap-2">
                  {PAYMENT_MODES.map(mode => (
                    <button
                      key={mode}
                      onClick={() => setPayForm(f => ({ ...f, paymentMode: mode }))}
                      className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${
                        payForm.paymentMode === mode
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{MODE_ICONS[mode]}</span>
                      <span>{MODE_LABELS[mode].split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference number */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Reference / Transaction ID
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="UPI ref, cheque no., transaction ID..."
                  value={payForm.referenceNumber}
                  onChange={e => setPayForm(f => ({ ...f, referenceNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Notes
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Any additional notes..."
                  value={payForm.notes}
                  onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
                />
              </div>

              {/* Submit */}
              <button
                onClick={submitPay}
                disabled={quickPayPending}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl text-base transition-colors flex items-center justify-center gap-2"
              >
                {quickPayPending
                  ? <><span className="animate-spin">⏳</span> Processing...</>
                  : <>✓ Confirm — ₹{payIntent.totalAmount.toLocaleString('en-IN')} via {MODE_LABELS[payForm.paymentMode]}</>
                }
              </button>

              <button
                onClick={() => setPayIntent(null)}
                disabled={quickPayPending}
                className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail Modal ──────────────────────────────────────────────────── */}
      {detailItem && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{detailItem.flatNumber} — Defaulter Detail</h2>
                {detailItem.residentName && (
                  <p className="text-sm text-gray-500">{detailItem.residentName}{detailItem.phone ? ` · ${detailItem.phone}` : ''}</p>
                )}
              </div>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="bg-red-50 rounded-lg p-3 mb-4 flex justify-between">
              <div>
                <p className="text-xs text-red-500 font-medium uppercase">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-600">₹{detailItem.totalOutstanding.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-red-500 font-medium uppercase">Months Unpaid</p>
                <p className="text-2xl font-bold text-red-600">{detailItem.unpaidMonths}</p>
              </div>
            </div>
            <div className="space-y-2">
              {detailItem.bills.map(b => (
                <div key={`${b.month}-${b.year}`} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{MONTHS[b.month - 1]} {b.year}</p>
                    <p className="text-xs text-gray-500 capitalize">{b.status} · Due {format(new Date(b.dueDate), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{b.amount.toLocaleString('en-IN')}</p>
                    {b.lateFee > 0 && <p className="text-xs text-red-500">+₹{b.lateFee.toLocaleString('en-IN')} late</p>}
                    <p className="text-xs font-bold text-red-700">₹{b.totalDue.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setDetailItem(null)
                openPayModal({
                  flatId: detailItem.flatId,
                  flatNumber: detailItem.flatNumber,
                  residentName: detailItem.residentName,
                  periods: detailItem.bills.map(b => ({ month: b.month, year: b.year })),
                  totalAmount: detailItem.totalOutstanding,
                  label: `${detailItem.unpaidMonths} month${detailItem.unpaidMonths !== 1 ? 's' : ''}`,
                })
              }}
              className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              ⚡ Pay All Outstanding — ₹{detailItem.totalOutstanding.toLocaleString('en-IN')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}