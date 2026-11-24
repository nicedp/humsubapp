import { useRef } from 'react'
import { format } from 'date-fns'
import { MaintenanceBill } from '../../types'
import { MONTHS_LONG as MONTHS_FULL } from '../../constants/labels'

interface Props {
  bill: MaintenanceBill
  societyName: string
  onClose: () => void
}

export default function PrintBillModal({ bill, societyName, onClose }: Props) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current?.innerHTML ?? ''
    const win = window.open('', '_blank', 'width=700,height=900')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Maintenance Bill — ${bill.flatNumber} — ${MONTHS_FULL[bill.month - 1]} ${bill.year}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 14px; color: #1a1a1a; background: #fff; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; font-weight: bold; color: #2563eb; }
        .header p { font-size: 13px; color: #666; margin-top: 4px; }
        .bill-title { text-align: center; font-size: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #374151; margin-bottom: 24px; }
        .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .meta-item label { font-size: 11px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
        .meta-item p { font-size: 14px; font-weight: 600; color: #111; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #475569; border: 1px solid #e2e8f0; }
        td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 14px; }
        .total-row td { font-weight: bold; background: #eff6ff; font-size: 15px; }
        .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
        .status-paid { background: #dcfce7; color: #166534; }
        .status-unpaid { background: #fef9c3; color: #854d0e; }
        .status-overdue { background: #fee2e2; color: #991b1b; }
        .payment-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 24px; }
        .payment-box h3 { font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 8px; text-transform: uppercase; }
        .footer { text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px; }
      </style>
    </head><body>${content}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 400)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Bill Preview</h2>
          <div className="flex gap-2">
            <button onClick={handlePrint}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-1.5">
              🖨 Print / Save PDF
            </button>
            <button onClick={onClose} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">✕ Close</button>
          </div>
        </div>
        <div className="p-6">
          <div ref={printRef}>
            <div className="header text-center border-b-2 border-blue-600 pb-4 mb-5">
              <h1 className="text-xl font-bold text-blue-700">{societyName}</h1>
              <p className="text-xs text-gray-500 mt-1">Maintenance Bill</p>
            </div>
            <p className="bill-title text-center text-sm font-bold tracking-widest text-gray-600 uppercase mb-5">
              Maintenance Receipt
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4 mb-5 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Flat No.</p>
                <p className="font-semibold text-gray-900">{bill.flatNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Bill Period</p>
                <p className="font-semibold text-gray-900">{MONTHS_FULL[bill.month - 1]} {bill.year}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Due Date</p>
                <p className="font-semibold text-gray-900">{format(new Date(bill.dueDate), 'dd MMM yyyy')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                  bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                  bill.status === 'overdue' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{bill.status}</span>
              </div>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2.5 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-gray-600 text-xs uppercase tracking-wide">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2.5 text-gray-700">Maintenance Charges</td>
                  <td className="px-4 py-2.5 text-right text-gray-900">₹{bill.amount.toLocaleString('en-IN')}</td>
                </tr>
                {bill.lateFee > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 text-red-600">Late Fee</td>
                    <td className="px-4 py-2.5 text-right text-red-600">₹{bill.lateFee.toLocaleString('en-IN')}</td>
                  </tr>
                )}
                <tr className="bg-blue-50 font-bold">
                  <td className="px-4 py-3 text-gray-900">Total Due</td>
                  <td className="px-4 py-3 text-right text-blue-700 text-base">₹{bill.totalDue.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
            {bill.status === 'paid' && bill.payment && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">✓ Payment Received</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Amount Paid</p>
                    <p className="font-semibold text-green-800">₹{bill.payment.amountPaid.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Paid On</p>
                    <p className="font-semibold text-green-800">{format(new Date(bill.payment.paidOn), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payment Mode</p>
                    <p className="font-semibold text-green-800 capitalize">{bill.payment.paymentMode.replace('_', ' ')}</p>
                  </div>
                  {bill.payment.notes && (
                    <div>
                      <p className="text-xs text-gray-400">Notes</p>
                      <p className="font-semibold text-green-800">{bill.payment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="text-center text-xs text-gray-400 border-t border-gray-100 pt-4 mt-2">
              <p>This is a computer-generated bill. No signature required.</p>
              <p className="mt-1">Generated on {format(new Date(), 'dd MMM yyyy, HH:mm')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}