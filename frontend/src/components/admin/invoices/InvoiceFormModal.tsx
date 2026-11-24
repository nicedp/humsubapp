import React from 'react'
import { CreateInvoicePayload, InvoiceItemPayload } from '../../../api/invoices'
import { emptyItem, calcTotals } from './invoiceHelpers'

export interface InvoiceForm extends CreateInvoicePayload {}

interface Props {
  open: boolean
  editId: string | null
  form: InvoiceForm
  onChange: (form: InvoiceForm) => void
  onSubmit: () => void
  onClose: () => void
  isPending: boolean
}

export default function InvoiceFormModal({ open, editId, form, onChange, onSubmit, onClose, isPending }: Props) {
  if (!open) return null

  const setField = (patch: Partial<InvoiceForm>) => onChange({ ...form, ...patch })

  const setItem = (idx: number, patch: Partial<InvoiceItemPayload>) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], ...patch }
    onChange({ ...form, items })
  }

  const addItem = () => onChange({ ...form, items: [...form.items, emptyItem()] })

  const removeItem = (idx: number) =>
    onChange({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const { subtotal, taxAmount, total } = calcTotals(form.items, form.taxRate ?? 0)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 pt-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{editId ? 'Edit Invoice' : 'New Invoice'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>

          <div className="p-6 space-y-5">
            {/* Status (edit only) */}
            {editId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setField({ status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {['draft', 'sent', 'paid', 'cancelled'].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">From (Society)</h3>
                <input placeholder="Name *" value={form.fromName} onChange={e => setField({ fromName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <textarea placeholder="Address" value={form.fromAddress ?? ''} onChange={e => setField({ fromAddress: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                <input placeholder="Phone" value={form.fromPhone ?? ''} onChange={e => setField({ fromPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Email" type="email" value={form.fromEmail ?? ''} onChange={e => setField({ fromEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bill To (Recipient)</h3>
                <input placeholder="Name *" value={form.toName} onChange={e => setField({ toName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <textarea placeholder="Address" value={form.toAddress ?? ''} onChange={e => setField({ toAddress: e.target.value })}
                  rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
                <input placeholder="Phone" value={form.toPhone ?? ''} onChange={e => setField({ toPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input placeholder="Email" type="email" value={form.toEmail ?? ''} onChange={e => setField({ toEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input type="date" value={form.invoiceDate ?? ''} onChange={e => setField({ invoiceDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate ?? ''} onChange={e => setField({ dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Items</label>
                <button onClick={addItem} className="text-xs text-blue-600 hover:underline font-medium">+ Add item</button>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-1">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2 text-right">Qty</span>
                  <span className="col-span-3 text-right">Unit Price</span>
                  <span className="col-span-2 text-right">Amount</span>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      placeholder="Item description"
                      value={item.description}
                      onChange={e => setItem(idx, { description: e.target.value })}
                      className="col-span-5 px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number" min={0.01} step="0.01"
                      value={item.quantity}
                      onChange={e => setItem(idx, { quantity: Number(e.target.value) })}
                      className="col-span-2 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                    />
                    <input
                      type="number" min={0} step="0.01"
                      value={item.unitPrice}
                      onChange={e => setItem(idx, { unitPrice: Number(e.target.value) })}
                      className="col-span-3 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-right"
                    />
                    <div className="col-span-1 text-right text-sm text-gray-700 font-medium">
                      ₹{(item.quantity * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      disabled={form.items.length <= 1}
                      className="col-span-1 text-red-400 hover:text-red-600 disabled:opacity-30 text-center"
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tax + Totals */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number" min={0} max={100} step="0.5"
                  value={form.taxRate ?? 0}
                  onChange={e => setField({ taxRate: Number(e.target.value) })}
                  className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="text-right space-y-1 text-sm">
                <p className="text-gray-600">
                  Subtotal: <span className="font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </p>
                {(form.taxRate ?? 0) > 0 && (
                  <p className="text-gray-600">
                    Tax ({form.taxRate}%): <span className="font-medium">₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                )}
                <p className="text-base font-bold text-gray-900 border-t border-gray-200 pt-1">
                  Total: ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes ?? ''}
                onChange={e => setField({ notes: e.target.value })}
                rows={2}
                placeholder="Any additional notes or payment instructions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!form.fromName || !form.toName || form.items.length === 0 || isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium"
              >
                {isPending ? 'Saving...' : editId ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}