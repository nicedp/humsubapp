import api from './axios'

export interface FinanceSummaryPoint {
  month: number
  year: number
  label: string
  totalBilled: number
  totalCollected: number
  collectionRate: number
  totalExpenses: number
  totalIncome: number
  netBalance: number
  openingBalance: number
  closingBalance: number
}

export interface MonthlyReportData {
  month: number
  year: number
  monthLabel: string
  billing: {
    totalBilled: number
    totalCollected: number
    totalOutstanding: number
    totalBills: number
    paidBills: number
    unpaidBills: number
    collectionRate: number
  }
  expenses: {
    grandTotal: number
    byCategory: Array<{ category: string; total: number; percentage: number }>
  }
  netBalance: number
  societyName: string
}

export const financeApi = {
  getSummary: async (months = 24): Promise<FinanceSummaryPoint[]> => {
    const { data } = await api.get<FinanceSummaryPoint[]>(`/finance/summary?months=${months}`)
    return data
  },

  getMonthlyReport: async (month: number, year: number): Promise<MonthlyReportData> => {
    const { data } = await api.get<MonthlyReportData>(`/finance/monthly-report`, { params: { month, year } })
    return data
  },
}