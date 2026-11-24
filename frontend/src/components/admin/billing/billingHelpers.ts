import { format } from 'date-fns'
import { MaintenanceBill } from '../../../types'
import { FlatBillStatus } from '../../../api/billing'
import { MONTHS_SHORT as MONTHS } from '../../../constants/labels'

export function agingLabel(dueDate: string, status: string): { label: string; cls: string } {
  if (status === 'paid') return { label: 'Paid', cls: 'bg-green-100 text-green-700' }
  const days = Math.floor((Date.now() - new Date(dueDate).getTime()) / 86400000)
  if (days <= 0) return { label: 'Due soon', cls: 'bg-yellow-100 text-yellow-700' }
  if (days <= 30) return { label: `${days}d overdue`, cls: 'bg-orange-100 text-orange-700' }
  if (days <= 60) return { label: `${days}d overdue`, cls: 'bg-red-100 text-red-700' }
  return { label: `${days}d overdue`, cls: 'bg-red-200 text-red-900 font-bold' }
}

export function statusBadge(status: string): string {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'overdue') return 'bg-red-100 text-red-700'
  if (status === 'no_bill') return 'bg-gray-100 text-gray-400'
  return 'bg-yellow-100 text-yellow-700'
}

export function flatGridColor(status: FlatBillStatus['billStatus']): string {
  if (status === 'paid') return 'bg-green-100 border-green-300 text-green-800'
  if (status === 'overdue') return 'bg-red-100 border-red-300 text-red-800'
  if (status === 'unpaid') return 'bg-yellow-50 border-yellow-300 text-yellow-800'
  return 'bg-gray-50 border-gray-200 text-gray-400'
}

export function flatPipColor(status: FlatBillStatus['billStatus']): string {
  if (status === 'paid') return 'bg-green-500'
  if (status === 'overdue') return 'bg-red-500'
  if (status === 'unpaid') return 'bg-yellow-400'
  return 'bg-gray-300'
}

export function flatAmountColor(status: FlatBillStatus['billStatus']): string {
  if (status === 'paid') return 'text-green-700'
  if (status === 'overdue') return 'text-red-700'
  if (status === 'unpaid') return 'text-yellow-700'
  return 'text-gray-400'
}

export function exportCSV(bills: MaintenanceBill[]): void {
  const now = new Date()
  const headers = ['Flat', 'Resident', 'Period', 'Amount', 'Late Fee', 'Total Due', 'Due Date', 'Status', 'Paid On', 'Payment Mode']
  const rows = bills.map(b => [
    b.flatNumber ?? '',
    b.residentName ?? '',
    `${MONTHS[b.month - 1]} ${b.year}`,
    b.amount,
    b.lateFee,
    b.totalDue,
    format(new Date(b.dueDate), 'dd MMM yyyy'),
    b.status,
    b.payment ? format(new Date(b.payment.paidOn), 'dd MMM yyyy') : '',
    b.payment?.paymentMode ?? '',
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `billing-${now.getFullYear()}-${now.getMonth() + 1}.csv`
  a.click()
  URL.revokeObjectURL(url)
}