import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { billingApi } from '../../api/billing'
import { settingsApi } from '../../api/settings'
import { notificationsApi } from '../../api/notifications'

// ─── Copy button ──────────────────────────────────────────────────────────────
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
      className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-md transition"
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

// ─── QR full-screen modal ─────────────────────────────────────────────────────
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
          <h3 className="font-semibold text-gray-900">Scan to Pay</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <img src={src} alt="UPI QR Code" className="w-64 h-64 object-contain border border-gray-100 rounded-xl" />
        <p className="text-xs text-gray-500 text-center">Open any UPI app and scan to pay maintenance</p>
      </div>
    </div>
  )
}

// ─── "I've Paid" confirmation modal ──────────────────────────────────────────
function PaidConfirmModal({
  totalDue,
  isPending,
  onConfirm,
  onClose,
}: {
  totalDue: number
  isPending: boolean
  onConfirm: (notes: string) => void
  onClose: () => void
}) {
  const [notes, setNotes] = useState('')
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Notify Admin of Payment</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          This will send a notification to the admin to verify and record your payment of{' '}
          <span className="font-bold text-gray-900">₹{totalDue.toLocaleString()}</span>.
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction ID / Reference <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. UPI ref 12345678 or cheque no."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes)}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-lg transition"
          >
            {isPending ? 'Sending…' : "✓ Notify Admin"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResidentPay() {
  const qc = useQueryClient()
  const [qrOpen, setQrOpen] = useState(false)
  const [paidModalOpen, setPaidModalOpen] = useState(false)

  const { data: billsData } = useQuery({
    queryKey: ['my-bills'],
    queryFn: () => billingApi.getMyBills({ limit: 50 }),
  })

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60_000,
  })

  const bills         = billsData?.data ?? []
  const pendingBills  = bills.filter(b => b.status !== 'paid')
  const totalDue      = pendingBills.reduce((s, b) => s + b.totalDue, 0)
  const hasUpi        = !!(settings?.upiId || settings?.upiQrCode)
  const hasBank       = !!(settings?.bankAccountNumber)
  const hasPayment    = hasUpi || hasBank

  // ── UPI deep link (for mobile) ─────────────────────────────────────────────
  const upiDeepLink = settings?.upiId && totalDue > 0
    ? `upi://pay?pa=${encodeURIComponent(settings.upiId)}&am=${totalDue}&cu=INR&tn=${encodeURIComponent('Society maintenance payment')}`
    : null

  // ── "I've Paid" notification mutation ──────────────────────────────────────
  const notifyMutation = useMutation({
    mutationFn: (notes: string) =>
      notificationsApi.notifyAdmin({
        message: `Resident has paid ₹${totalDue.toLocaleString()} for maintenance.${notes ? ` Ref: ${notes}` : ''}`,
      }),
    onSuccess: () => {
      toast.success('Admin has been notified! They will update your bill status shortly.')
      setPaidModalOpen(false)
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => toast.error('Failed to notify admin. Please contact the office directly.'),
  })

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pay Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Use the details below to transfer your dues</p>
        </div>
        <Link to="/resident/bills" className="text-sm text-blue-600 hover:underline">← My Bills</Link>
      </div>

      {/* Outstanding Amount Hero */}
      {totalDue > 0 ? (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl px-6 py-5">
          <p className="text-sm font-semibold text-red-700 mb-1">Total Outstanding</p>
          <p className="text-4xl font-bold text-red-700">₹{totalDue.toLocaleString()}</p>
          <p className="text-sm text-red-500 mt-1">
            {pendingBills.length} bill{pendingBills.length !== 1 ? 's' : ''} pending
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {pendingBills.map(b => (
              <span key={b.id} className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
                {new Date(0, b.month - 1).toLocaleString('default', { month: 'short' })} {b.year} — ₹{b.totalDue.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-5 flex items-center gap-4">
          <span className="text-4xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">No dues pending!</p>
            <p className="text-sm text-green-600 mt-0.5">You're fully up to date. Great job!</p>
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {!hasPayment ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-6 py-5 text-center">
          <div className="text-3xl mb-2">🏦</div>
          <p className="font-medium text-amber-800">Payment details not configured</p>
          <p className="text-sm text-amber-600 mt-1">The society admin hasn't set up bank or UPI details yet. Please contact the office directly.</p>
        </div>
      ) : (
        <div className="space-y-4">

          {/* UPI Section */}
          {hasUpi && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
                <span className="text-lg">📲</span>
                <h2 className="font-semibold text-purple-900">UPI Payment</h2>
                <span className="ml-auto text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Instant</span>
              </div>
              <div className="px-5 py-4 flex items-start gap-5">
                {/* QR */}
                {settings?.upiQrCode && (
                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    title="Click to enlarge"
                    className="flex-shrink-0 w-28 h-28 rounded-xl border-2 border-purple-200 overflow-hidden hover:border-purple-500 transition cursor-zoom-in shadow-sm"
                  >
                    <img src={settings.upiQrCode} alt="UPI QR" className="w-full h-full object-contain" />
                  </button>
                )}
                <div className="flex-1 space-y-3">
                  {settings?.upiId && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-semibold text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          {settings.upiId}
                        </span>
                        <CopyButton text={settings.upiId} label="UPI ID" />
                      </div>
                    </div>
                  )}
                  {upiDeepLink && (
                    <a
                      href={upiDeepLink}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
                    >
                      📲 Open UPI App
                    </a>
                  )}
                  {settings?.upiQrCode && (
                    <button
                      type="button"
                      onClick={() => setQrOpen(true)}
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium border border-purple-200 rounded-lg px-3 py-1.5 hover:bg-purple-50 transition"
                    >
                      🔳 Scan QR Code
                    </button>
                  )}
                  <p className="text-xs text-gray-400">Enter exact amount: ₹{totalDue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank Section */}
          {hasBank && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                <span className="text-lg">🏦</span>
                <h2 className="font-semibold text-blue-900">Bank Transfer (NEFT/IMPS)</h2>
              </div>
              <div className="px-5 py-4 space-y-3">
                {settings?.bankName && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Bank</span>
                    <span className="text-sm font-semibold text-gray-900">{settings.bankName}</span>
                  </div>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-gray-900">{settings?.bankAccountNumber}</span>
                    <CopyButton text={settings!.bankAccountNumber!} label="Account No." />
                  </div>
                </div>
                {settings?.bankIfsc && (
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm text-gray-500">IFSC Code</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">{settings.bankIfsc}</span>
                      <CopyButton text={settings.bankIfsc} label="IFSC" />
                    </div>
                  </div>
                )}
                {settings?.bankBranch && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Branch</span>
                    <span className="text-sm text-gray-900">{settings.bankBranch}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Transfer Amount</span>
                  <span className="text-lg font-bold text-gray-900">₹{totalDue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Society Contact */}
      {(settings?.phone || settings?.whatsapp) && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-5 py-3 flex items-center gap-4 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Need help?</span>
          {settings.phone && (
            <a href={`tel:${settings.phone}`} className="text-sm text-blue-600 hover:underline font-medium">
              📞 Call {settings.phone}
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

      {/* "I've Paid" CTA */}
      {totalDue > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-5">
          <p className="font-semibold text-green-800 mb-1">Paid already?</p>
          <p className="text-sm text-green-700 mb-4">
            After making the transfer, tap the button below to notify the admin. They will verify and update your bill status within 24 hours.
          </p>
          <button
            type="button"
            onClick={() => setPaidModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            ✅ I've Paid — Notify Admin
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 space-y-2">
        <p className="text-xs font-semibold text-blue-700">📋 How it works</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Transfer the exact amount shown above using UPI, NEFT, or IMPS</li>
          <li>Use your flat number as the payment remarks (e.g. "A-101 maintenance")</li>
          <li>Click "I've Paid" to send a notification to the admin for verification</li>
          <li>Admin will confirm and update your bill status — usually within 24 hours</li>
        </ul>
      </div>

      {/* QR Modal */}
      {qrOpen && settings?.upiQrCode && (
        <QRModal src={settings.upiQrCode} onClose={() => setQrOpen(false)} />
      )}

      {/* Paid Confirm Modal */}
      {paidModalOpen && (
        <PaidConfirmModal
          totalDue={totalDue}
          isPending={notifyMutation.isPending}
          onConfirm={(notes) => notifyMutation.mutate(notes)}
          onClose={() => setPaidModalOpen(false)}
        />
      )}
    </div>
  )
}