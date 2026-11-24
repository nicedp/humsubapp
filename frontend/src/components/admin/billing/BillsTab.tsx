import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { MaintenanceBill } from '../../../types'
import Pagination from '../../Pagination'
import { MONTHS_SHORT as MONTHS } from '../../../constants/labels'
import { agingLabel, statusBadge, exportCSV } from './billingHelpers'

interface Props {
  bills: MaintenanceBill[]
  isLoading: boolean
  total: number
  skip: number
  pageSize: number
  filterStatus: string
  selectedIds: Set<string>
  bulkPayPending: boolean
  onFilterStatus: (s: string) => void
  onPageChange: (newSkip: number) => void
  onToggleSelect: (id: string) => void
  onToggleAll: () => void
  onOpenPayModal: (bill: MaintenanceBill) => void
  onOpenEditModal: (bill: MaintenanceBill) => void
  onDelete: (id: string) => void
  onPrint: (bill: MaintenanceBill) => void
  onBulkPay: () => void
  onConfirm: (msg: string, onOk: () => void) => void
}

// Columns without Aging (merged into status badge)
const COLS = ['Flat', 'Resident', 'Period', 'Amount', 'Late Fee', 'Total Due', 'Due Date', 'Status', 'Actions']

export default function BillsTab({
  bills, isLoading, total, skip, pageSize, filterStatus, selectedIds, bulkPayPending,
  onFilterStatus, onPageChange, onToggleSelect, onToggleAll,
  onOpenPayModal, onOpenEditModal, onDelete, onPrint, onBulkPay, onConfirm,
}: Props) {
  // ── Local search state (client-side, debounced) ──
  const [search, setSearch] = useState('')
  const [searchDebounced, setSearchDebounced] = useState('')
  const debounceRef = useState<ReturnType<typeof setTimeout> | null>(null)

  function handleSearchChange(val: string) {
    setSearch(val)
    if (debounceRef[0]) clearTimeout(debounceRef[0])
    debounceRef[1](setTimeout(() => setSearchDebounced(val), 300))
  }

  // Filter bills client-side by search string
  const filteredBills = useMemo(() => {
    const q = searchDebounced.toLowerCase().trim()
    if (!q) return bills
    return bills.filter(b =>
      (b.flatNumber?.toLowerCase().includes(q)) ||
      (b.residentName?.toLowerCase().includes(q))
    )
  }, [bills, searchDebounced])

  return (
    <div className="space-y-3">
      {/* Sub-filters + search + bulk actions */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          {/* Text search */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search flat or resident..."
              className="pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {search && (
              <button onClick={() => { setSearch(''); setSearchDebounced('') }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">✕</button>
            )}
          </div>
          {/* Status filter */}
          <select value={filterStatus} onChange={e => { onFilterStatus(e.target.value) }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          {searchDebounced && (
            <span className="text-xs text-gray-500">{filteredBills.length} result{filteredBills.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedIds.size > 0 && (
            <>
              <span className="px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-lg font-medium">
                {selectedIds.size} selected
              </span>
              <button
                onClick={() => onConfirm(`Mark ${selectedIds.size} bill(s) as paid (cash, today)?`, onBulkPay)}
                disabled={bulkPayPending}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 font-medium">
                {bulkPayPending ? 'Processing...' : `✓ Bulk Pay (${selectedIds.size})`}
              </button>
            </>
          )}
          <button onClick={() => exportCSV(bills)}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50">
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['', ...COLS].map(h => <th key={h} className="px-3 py-3 text-left font-medium text-gray-600">{h}</th>)}</tr>
            </thead>
            <tbody className="animate-pulse divide-y divide-gray-50">
              {[...Array(8)].map((_, i) => (
                <tr key={i}>{[...Array(10)].map((__, j) => (
                  <td key={j} className="px-3 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-3 py-3">
                  <input type="checkbox"
                    checked={selectedIds.size > 0 && selectedIds.size === bills.filter(b => b.status !== 'paid').length}
                    onChange={onToggleAll}
                    className="rounded border-gray-300" />
                </th>
                {COLS.map(h => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBills.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">💰</div>
                  <p className="text-gray-500 font-medium">
                    {searchDebounced ? `No bills match "${searchDebounced}"` : 'No bills found'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {searchDebounced ? 'Try a different flat number or resident name' : 'Generate bills or adjust filters'}
                  </p>
                </td></tr>
              ) : filteredBills.map(b => {
                const aging = agingLabel(b.dueDate, b.status)
                const isSelected = selectedIds.has(b.id)
                const whatsappPhone = b.residentPhone?.replace(/\D/g, '')
                const whatsappMsg = b.status !== 'paid' && whatsappPhone
                  ? `Hi, this is a reminder that your maintenance bill for Flat ${b.flatNumber} for ${MONTHS[b.month - 1]} ${b.year} is ${b.status}. Total due: ₹${b.totalDue.toLocaleString('en-IN')}. Please pay at your earliest convenience.`
                  : null
                return (
                  <tr key={b.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}>
                    <td className="px-3 py-3">
                      {b.status !== 'paid' && (
                        <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(b.id)}
                          className="rounded border-gray-300" />
                      )}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{b.flatNumber}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {b.residentName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-800 text-xs font-medium">{b.residentName}</span>
                          {whatsappMsg && (
                            <a
                              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMsg)}`}
                              target="_blank" rel="noopener noreferrer"
                              title="Send WhatsApp reminder"
                              className="text-green-500 hover:text-green-700 text-xs leading-none"
                            >💬</a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{MONTHS[b.month - 1]} {b.year}</td>
                    <td className="px-3 py-3 text-gray-600">₹{b.amount.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3 text-red-600 font-medium">{b.lateFee > 0 ? `₹${b.lateFee.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-3 py-3 font-semibold text-gray-900">₹{b.totalDue.toLocaleString('en-IN')}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{format(new Date(b.dueDate), 'dd MMM yyyy')}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {/* Status badge — aging info merged as subtitle */}
                      <div className="flex flex-col gap-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize w-fit ${statusBadge(b.status)}`}>
                          {b.status}
                        </span>
                        {b.status !== 'paid' && (
                          <span className={`text-xs ${aging.cls.replace('bg-', 'text-').replace(/ text-\S+/, '')}`}>
                            {aging.label}
                          </span>
                        )}
                        {b.status === 'paid' && b.payment && (
                          <span className="text-xs text-gray-400">
                            {format(new Date(b.payment.paidOn), 'dd MMM')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2 items-center whitespace-nowrap">
                        {b.status !== 'paid' && (
                          <>
                            <button onClick={() => onOpenPayModal(b)}
                              className="px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded font-medium border border-green-200">
                              💳 Pay
                            </button>
                            <button onClick={() => onOpenEditModal(b)} className="text-blue-500 hover:underline text-xs">Edit</button>
                            <button
                              onClick={() => onConfirm('Delete this bill? This cannot be undone.', () => onDelete(b.id))}
                              className="text-red-400 hover:underline text-xs">Del</button>
                          </>
                        )}
                        <button onClick={() => onPrint(b)} className="text-gray-400 hover:text-gray-700 text-xs" title="Print bill">🖨</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination skip={skip} limit={pageSize} total={total}
        onPageChange={(newSkip) => onPageChange(newSkip)} />
    </div>
  )
}