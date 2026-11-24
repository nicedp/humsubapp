import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { billingApi } from '../../api/billing'
import { settingsApi } from '../../api/settings'
import { MaintenanceBill, SocietySettings } from '../../types'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { MONTHS_SHORT as MONTH_NAMES } from '../../constants/labels'
import PrintBillModal from '../../components/shared/PrintBillModal'

// ─── Copy button ──────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          toast.success(`${label} copied!`)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

// ─── QR full-screen modal ─────────────────────────────────────
function QRModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-xs w-full mx-4 flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-gray-900">UPI QR Code</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <img src={src} alt="UPI QR Code" className="w-60 h-60 object-contain border border-gray-100 rounded-xl" />
        <p className="text-xs text-gray-500 text-center">Scan with any UPI app to pay</p>
      </div>
    </div>
  )
}

// ─── Inline payment info strip ────────────────────────────────
function PayStrip({ settings, onViewQR }: { settings: SocietySettings; onViewQR: () => void }) {
  const hasBank = !!(settings.bankAccountNumber)
  const hasUpi = !!(settings.upiId || settings.upiQrCode)
  if (!hasBank && !hasUpi) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pay via</p>
      <div className="flex flex-wrap gap-3 items-start">
        {hasUpi && (
          <div className="flex items-center gap-2.5">
            {settings.upiQrCode && (
              <button
                type="button"
                onClick={onViewQR}
                title="Tap to scan QR"
                className="w-12 h-12 rounded-lg border-2 border-purple-200 overflow-hidden hover:border-purple-400 transition cursor-zoom-in flex-shrink-0 bg-white"
              >
                <img src={settings.upiQrCode} alt="QR" className="w-full h-full object-contain" />
              </button>
            )}
            <div className="space-y-0.5">
              {settings.upiId && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-500">UPI:</span>
                  <span className="text-sm font-mono font-semibold text-gray-800">{settings.upiId}</span>
                  <CopyButton text={settings.upiId} label="UPI ID" />
                </div>
              )}
              {settings.upiQrCode && !settings.upiId && (
                <button
                  type="button"
                  onClick={onViewQR}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium border border-purple-200 rounded-lg px-2.5 py-1 hover:bg-purple-50 transition"
                >
                  🔳 Scan QR Code
                </button>
              )}
              <p className="text-xs text-gray-400">Any UPI app</p>
            </div>
          </div>
        )}
        {hasBank && (
          <div className="space-y-0.5">
            {settings.bankName && <p className="text-xs text-gray-600 font-medium">{settings.bankName}</p>}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-gray-500">A/C:</span>
              <span className="text-sm font-mono font-medium text-gray-800">{settings.bankAccountNumber}</span>
              <CopyButton text={settings.bankAccountNumber!} label="Account No." />
            </div>
            {settings.bankIfsc && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-gray-500">IFSC:</span>
                <span className="text-sm font-mono font-medium text-gray-800">{settings.bankIfsc}</span>
                <CopyButton text={settings.bankIfsc} label="IFSC" />
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 pt-1">
        After paying, inform the office — admin will record & update your bill status.
      </p>
    </div>
  )
}

// ─── Unpaid bill action card ──────────────────────────────────
interface UnpaidCardProps {
  bill: MaintenanceBill
  settings: SocietySettings | undefined
  onViewQR: () => void
  onPrint: () => void
}

function UnpaidBillCard({ bill, settings, onViewQR, onPrint }: UnpaidCardProps) {
  const isOverdue = bill.status === 'overdue'

  const style = isOverdue
    ? { headerBg: 'bg-gradient-to-r from-red-50 to-orange-50', border: 'border-red-300', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
    : { headerBg: 'bg-gradient-to-r from-amber-50 to-yellow-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' }

  return (
    <div className={`rounded-xl border-2 ${style.border} overflow-hidden`}>
      {/* Header */}
      <div className={`${style.headerBg} px-5 py-4 flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${style.dot} flex-shrink-0 animate-pulse`} />
          <div>
            <p className="font-bold text-gray-900 text-lg leading-none">
              {MONTH_NAMES[bill.month - 1]} {bill.year}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Due: {format(new Date(bill.dueDate), 'dd MMM yyyy')}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold text-gray-900">₹{bill.totalDue.toLocaleString()}</p>
          {bill.lateFee > 0 && (
            <p className="text-xs text-red-600 mt-0.5">incl. ₹{bill.lateFee.toLocaleString()} late fee</p>
          )}
          <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${style.badge}`}>
            {bill.status}
          </span>
          <button
            type="button"
            onClick={onPrint}
            className="block mt-1.5 text-xs text-gray-400 hover:text-gray-700 ml-auto"
            title="Print / Save PDF"
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Breakdown + Pay strip */}
      <div className="px-5 py-4 bg-white">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Base maintenance</span>
            <span className="font-medium text-gray-900">₹{bill.amount.toLocaleString()}</span>
          </div>
          {bill.lateFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600">Late fee</span>
              <span className="font-medium text-red-600">+ ₹{bill.lateFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-1.5 border-t border-gray-100">
            <span>Total Due</span>
            <span>₹{bill.totalDue.toLocaleString()}</span>
          </div>
        </div>

        {/* Inline payment info */}
        {settings && <PayStrip settings={settings} onViewQR={onViewQR} />}
      </div>
    </div>
  )
}

// ─── Paid bills compact history ───────────────────────────────
function PaidBillsHistory({ bills, onPrint }: { bills: MaintenanceBill[]; onPrint: (b: MaintenanceBill) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <span className="text-green-500">✓</span>
          <h2 className="font-semibold text-gray-900">Payment History</h2>
          <span className="text-sm font-normal text-gray-400">({bills.length} paid)</span>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {bills.map((b) => (
            <div key={b.id} className="px-5 py-3 border-b border-gray-50 last:border-b-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm flex-shrink-0">✓</div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {MONTH_NAMES[b.month - 1]} {b.year}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {b.payment?.paidOn ? format(new Date(b.payment.paidOn), 'dd MMM yyyy') : 'Unknown date'}
                    {b.payment?.paymentMode && ` · ${b.payment.paymentMode.replace('_', ' ')}`}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                <p className="text-sm font-bold text-gray-900">₹{b.amount.toLocaleString()}</p>
                {b.lateFee > 0 && (
                  <p className="text-xs text-gray-400">+₹{b.lateFee.toLocaleString()} late</p>
                )}
                <button
                  type="button"
                  onClick={() => onPrint(b)}
                  className="text-xs text-gray-400 hover:text-gray-700"
                  title="Print receipt"
                >
                  🖨 Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function ResidentBills() {
  const [qrOpen, setQrOpen] = useState(false)
  const [printBill, setPrintBill] = useState<MaintenanceBill | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-bills'],
    queryFn: () => billingApi.getMyBills({ limit: 50 }),
  })

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  })

  const bills = data?.data ?? []
  const paidBills = bills.filter((b) => b.status === 'paid')
  const pendingBills = bills.filter((b) => b.status !== 'paid')
  const totalUnpaid = pendingBills.reduce((s, b) => s + b.totalDue, 0)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
        <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} bills total</p>
      </div>

      {/* Outstanding Banner */}
      {totalUnpaid > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-red-800">Total Outstanding</p>
            <p className="text-xs text-red-600 mt-0.5">
              {pendingBills.length} bill{pendingBills.length !== 1 ? 's' : ''} pending payment
            </p>
          </div>
          <p className="text-3xl font-bold text-red-700 shrink-0">₹{totalUnpaid.toLocaleString()}</p>
        </div>
      )}

      {totalUnpaid === 0 && bills.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-green-800">All bills paid!</p>
            <p className="text-xs text-green-600">You're fully up to date. Great job!</p>
          </div>
        </div>
      )}

      {/* Society Contact strip (top-level, not per-bill) */}
      {(settings?.phone || settings?.whatsapp) && (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Society Office:</span>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="text-sm text-blue-600 hover:underline font-medium">
              📞 {settings.phone}
            </a>
          )}
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:underline font-medium"
            >
              💬 WhatsApp
            </a>
          )}
        </div>
      )}

      {/* Bills */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border-2 border-gray-200 overflow-hidden animate-pulse">
              <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24" />
                  <div className="h-3 bg-gray-200 rounded w-32" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : bills.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-14 text-center">
          <div className="text-5xl mb-3">💵</div>
          <p className="text-gray-700 font-semibold">No bills yet</p>
          <p className="text-gray-400 text-sm mt-1">Bills will appear here once generated by the admin for your flat</p>
        </div>
      ) : (
        <>
          {/* Pending bills as action cards */}
          {pendingBills.length > 0 && (
            <div className="space-y-4">
              {pendingBills.map((b) => (
                <UnpaidBillCard
                  key={b.id}
                  bill={b}
                  settings={settings}
                  onViewQR={() => setQrOpen(true)}
                  onPrint={() => setPrintBill(b)}
                />
              ))}
            </div>
          )}

          {/* Paid bills compact history */}
          {paidBills.length > 0 && (
            <PaidBillsHistory bills={paidBills} onPrint={(b) => setPrintBill(b)} />
          )}
        </>
      )}

      {/* QR Modal */}
      {qrOpen && settings?.upiQrCode && (
        <QRModal src={settings.upiQrCode} onClose={() => setQrOpen(false)} />
      )}

      {/* Print Bill Modal */}
      {printBill && (
        <PrintBillModal
          bill={printBill}
          societyName={settings?.societyName ?? 'Society Management Portal'}
          onClose={() => setPrintBill(null)}
        />
      )}
    </div>
  )
}