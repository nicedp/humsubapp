import React from 'react'
import { format } from 'date-fns'
import { Invoice } from '../../../api/invoices'
import { INVOICE_STATUS_COLORS as STATUS_COLORS } from '../../../constants/labels'

interface Props {
  invoices: Invoice[]
  isLoading: boolean
  filterStatus: string
  onFilterChange: (status: string) => void
  onView: (inv: Invoice) => void
  onEdit: (inv: Invoice) => void
  onPrint: (inv: Invoice) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: string) => void
}

const STATUS_FILTERS = ['', 'draft', 'sent', 'paid', 'cancelled']

export default function InvoiceTable({
  invoices,
  isLoading,
  filterStatus,
  onFilterChange,
  onView,
  onEdit,
  onPrint,
  onDelete,
  onStatusChange,
}: Props) {
  return (
    <>
      {/* Filter bar */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => onFilterChange(s)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
              filterStatus === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">🧾</div>
            <p className="font-semibold text-gray-700">No invoices found</p>
            <p className="text-sm text-gray-400 mt-1">Create your first invoice using the button above</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Invoice #', 'Date', 'To', 'Amount', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-blue-700">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{inv.toName}</p>
                    {inv.toEmail && <p className="text-xs text-gray-400">{inv.toEmail}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inv.status}
                      onChange={e => onStatusChange(inv.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${STATUS_COLORS[inv.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {['draft', 'sent', 'paid', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 items-center whitespace-nowrap">
                      <button onClick={() => onView(inv)} className="text-indigo-500 hover:underline text-xs font-medium">View</button>
                      <button onClick={() => onEdit(inv)} className="text-blue-500 hover:underline text-xs">Edit</button>
                      <button onClick={() => onPrint(inv)} className="text-gray-500 hover:text-gray-800 text-xs" title="Print invoice">🖨 Print</button>
                      <button
                        onClick={() => { if (confirm('Delete this invoice?')) onDelete(inv.id) }}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}