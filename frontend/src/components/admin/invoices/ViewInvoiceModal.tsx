import React from 'react'
import { format } from 'date-fns'
import { Invoice } from '../../../api/invoices'
import { INVOICE_STATUS_COLORS as STATUS_COLORS } from '../../../constants/labels'
import { fmtINR } from './invoiceHelpers'

interface Props {
  inv: Invoice
  onClose: () => void
  onPrint: (inv: Invoice) => void
  onEdit: (inv: Invoice) => void
}

export default function ViewInvoiceModal({ inv, onClose, onPrint, onEdit }: Props) {
  const statusColor = STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 pt-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900 font-mono">{inv.invoiceNumber}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${statusColor}`}>{inv.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { onClose(); onEdit(inv) }} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">✏️ Edit</button>
              <button onClick={() => onPrint(inv)} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">🖨 Print</button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl ml-2">×</button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* From / To parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">From</p>
                <p className="font-semibold text-gray-900">{inv.fromName}</p>
                {inv.fromAddress && <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{inv.fromAddress}</p>}
                {inv.fromPhone && <p className="text-sm text-gray-500">📞 {inv.fromPhone}</p>}
                {inv.fromEmail && <p className="text-sm text-gray-500">✉ {inv.fromEmail}</p>}
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">Bill To</p>
                <p className="font-semibold text-gray-900">{inv.toName}</p>
                {inv.toAddress && <p className="text-sm text-gray-500 mt-1 whitespace-pre-line">{inv.toAddress}</p>}
                {inv.toPhone && <p className="text-sm text-gray-500">📞 {inv.toPhone}</p>}
                {inv.toEmail && <p className="text-sm text-gray-500">✉ {inv.toEmail}</p>}
              </div>
            </div>

            {/* Dates */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Invoice Date</span>
                <span className="font-medium text-gray-900">{format(new Date(inv.invoiceDate), 'dd MMM yyyy')}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Due Date</span>
                <span className="font-medium text-gray-900">{inv.dueDate ? format(new Date(inv.dueDate), 'dd MMM yyyy') : '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Created</span>
                <span className="font-medium text-gray-900">{format(new Date(inv.createdAt), 'dd MMM yyyy')}</span>
              </div>
            </div>

            {/* Items table */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase w-1/2">Description</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-1/6">Qty</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-1/6">Unit Price</th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase w-1/6">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {inv.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2.5 text-gray-800">{item.description}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-2.5 text-right text-gray-600">{fmtINR(item.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-gray-900">{fmtINR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{fmtINR(inv.subtotal)}</span>
                </div>
                {inv.taxRate > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({inv.taxRate}%)</span>
                    <span className="font-medium">{fmtINR(inv.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-blue-700">{fmtINR(inv.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {inv.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-gray-700">
                <p className="font-semibold text-amber-700 mb-1">Notes</p>
                <p className="whitespace-pre-line">{inv.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}