import api from './axios'
import { MaintenanceBill, PaginatedResponse } from '../types'

export interface MonthlyTrendPoint {
  month: number
  year: number
  label: string
  totalBilled: number
  totalCollected: number
  collectionRate: number
}

export interface BillingSummary {
  month: number
  year: number
  totalBills: number
  paidCount: number
  unpaidCount: number
  overdueCount: number
  totalCollected: number
  totalDue: number
  collectionRate: number
}

export interface FlatBillStatus {
  flatId: string
  flatNumber: string
  floor: number | null
  type: string
  sqFt: number
  flatStatus: string
  blockId: string | null
  blockName: string | null
  residentName: string | null
  residentType: string | null
  billId: string | null
  billStatus: 'paid' | 'unpaid' | 'overdue' | 'no_bill'
  amount: number
  lateFee: number
  totalDue: number
  dueDate: string | null
  // Cumulative across ALL unpaid months (not just selected month)
  cumulativeDue: number
  unpaidMonths: number
}

export interface FlatBillHistoryRow {
  billId: string
  month: number
  year: number
  amount: number
  lateFee: number
  totalDue: number
  status: 'paid' | 'unpaid' | 'overdue'
  dueDate: string
  paidOn: string | null
  paidAmount: number | null
  paymentMode: string | null
}

export interface FlatBillingHistory {
  flatId: string
  flatNumber: string
  blockName: string | null
  floor: number | null
  type: string
  sqFt: number
  residentName: string | null
  residentType: string | null
  residentPhone: string | null
  cumulativeDue: number
  unpaidMonths: number
  totalPaid: number
  totalBills: number
  bills: FlatBillHistoryRow[]
}

export interface Defaulter {
  flatId: string
  flatNumber: string
  residentName: string | null
  phone: string | null
  unpaidMonths: number
  totalOutstanding: number
  bills: Array<{
    month: number
    year: number
    amount: number
    lateFee: number
    totalDue: number
    status: string
    dueDate: string
  }>
}

export interface QuickPayDto {
  flatId: string
  periods: Array<{ month: number; year: number }>
  amountPaid?: number
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  paidOn?: string
  notes?: string
}

export interface QuickPayResult {
  flatNumber: string
  totalPeriods: number
  paid: number
  skipped: number
  totalAmountPaid: number
  rows: Array<{ month: number; year: number; status: 'paid' | 'already_paid'; billId: string; amountPaid: number }>
}

export const billingApi = {
  list: async (params?: { skip?: number; limit?: number; month?: number; year?: number; status?: string; flatId?: string }): Promise<PaginatedResponse<MaintenanceBill>> => {
    const res = await api.get('/billing', { params })
    return res.data
  },

  getById: async (id: string): Promise<MaintenanceBill> => {
    const res = await api.get(`/billing/${id}`)
    return res.data
  },

  getMyBills: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<MaintenanceBill>> => {
    const res = await api.get('/billing/my', { params })
    return res.data
  },

  generateMonthlyBills: async (payload: { month: number; year: number; dueDayOfMonth: number }): Promise<{ created: number; skipped: number; month: number; year: number }> => {
    const res = await api.post('/billing/generate', payload)
    return res.data
  },

  createSingleBill: async (payload: { flatId: string; month: number; year: number; dueDate: string; amount?: number }): Promise<MaintenanceBill> => {
    const res = await api.post('/billing/single', payload)
    return res.data
  },

  createBulkSingleBills: async (payload: { flatId: string; periods: Array<{ month: number; year: number }>; dueDate: string; amount?: number }): Promise<{ flatNumber: string; created: number; updated: number; skipped: number; total: number }> => {
    const res = await api.post('/billing/bulk-single', payload)
    return res.data
  },

  updateBill: async (billId: string, payload: { dueDate?: string; amount?: number }): Promise<MaintenanceBill> => {
    const res = await api.put(`/billing/${billId}`, payload)
    return res.data
  },

  deleteBill: async (billId: string): Promise<{ deleted: boolean }> => {
    const res = await api.delete(`/billing/${billId}`)
    return res.data
  },

  recordPayment: async (billId: string, payload: { amountPaid: number; paymentMode: string; notes?: string; paidOn?: string; lateFeeCharged?: number }): Promise<MaintenanceBill> => {
    const res = await api.post(`/billing/${billId}/payment`, payload)
    return res.data
  },

  markOverdue: async (): Promise<{ updated: number }> => {
    const res = await api.post('/billing/overdue')
    return res.data
  },

  getSummary: async (month: number, year: number): Promise<BillingSummary> => {
    const res = await api.get('/billing/summary', { params: { month, year } })
    return res.data
  },

  getFloorStatus: async (month: number, year: number): Promise<FlatBillStatus[]> => {
    const res = await api.get('/billing/floor-status', { params: { month, year } })
    return res.data
  },

  getDefaulters: async (): Promise<Defaulter[]> => {
    const res = await api.get('/billing/defaulters')
    return res.data
  },

  getMonthlyTrend: async (months = 6): Promise<MonthlyTrendPoint[]> => {
    const res = await api.get('/billing/monthly-trend', { params: { months } })
    return res.data
  },

  quickPay: async (payload: QuickPayDto): Promise<QuickPayResult> => {
    const res = await api.post('/billing/quick-pay', payload)
    return res.data
  },

  getFlatHistory: async (flatId: string): Promise<FlatBillingHistory> => {
    const res = await api.get(`/billing/flat/${flatId}`)
    return res.data
  },
}