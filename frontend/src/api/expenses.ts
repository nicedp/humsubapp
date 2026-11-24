import api from './axios'

export interface Expense {
  id: string
  societyId: number
  title: string
  category: string
  amount: number
  paidOn: string
  vendor: string | null
  notes: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface ExpenseCategoryItem {
  id: number
  societyId: number
  name: string
  slug: string
  color: string | null
  isDefault: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseMonthlySummary {
  month: number
  year: number
  label: string
  totalExpenses: number
}

export interface ExpenseCategoryBreakdown {
  category: string
  total: number
  percentage: number
}

export interface ExpenseYearOverYear {
  year: number
  categories: Record<string, number>
  grandTotal: number
}

export interface ExpenseVendorSummaryItem {
  vendor: string
  total: number
  count: number
}

export interface PaginatedExpenses {
  data: Expense[]
  total: number
  skip: number
  limit: number
}

// ── Bulk create result types ──────────────────────────────────────────────────
export interface BulkExpenseRowResult {
  index: number
  status: 'created' | 'error'
  id?: string
  title?: string
  reason?: string
}

export interface BulkExpenseResult {
  total: number
  created: number
  errors: number
  rows: BulkExpenseRowResult[]
}

// ── CSV import result types ───────────────────────────────────────────────────
export interface ImportExpenseRowResult {
  row: number
  title: string
  status: 'imported' | 'skipped' | 'error'
  reason?: string
}

export interface ImportExpenseResult {
  total: number
  imported: number
  skipped: number
  errors: number
  rows: ImportExpenseRowResult[]
}

export const expensesApi = {
  list: async (params?: {
    skip?: number
    limit?: number
    category?: string
    month?: number
    year?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<PaginatedExpenses> => {
    const res = await api.get('/expenses', { params })
    return res.data
  },

  getById: async (id: string): Promise<Expense> => {
    const res = await api.get(`/expenses/${id}`)
    return res.data
  },

  create: async (payload: {
    title: string
    category: string
    amount: number
    paidOn: string
    vendor?: string
    notes?: string
  }): Promise<Expense> => {
    const res = await api.post('/expenses', payload)
    return res.data
  },

  update: async (id: string, payload: {
    title?: string
    category?: string
    amount?: number
    paidOn?: string
    vendor?: string | null
    notes?: string | null
  }): Promise<Expense> => {
    const res = await api.put(`/expenses/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<{ deleted: boolean }> => {
    const res = await api.delete(`/expenses/${id}`)
    return res.data
  },

  // ── Bulk create (JSON array, max 100) ─────────────────────────────────────
  bulkCreate: async (expenses: Array<{
    title: string
    category: string
    amount: number
    paidOn: string
    vendor?: string
    notes?: string
  }>): Promise<BulkExpenseResult> => {
    const res = await api.post('/expenses/bulk', { expenses })
    return res.data
  },

  // ── CSV import (raw text body) ────────────────────────────────────────────
  importCsv: async (csv: string): Promise<ImportExpenseResult> => {
    const res = await api.post('/expenses/import', { csv })
    return res.data
  },

  // ── Download CSV template ─────────────────────────────────────────────────
  downloadTemplate: () => {
    const header = 'Title,Date,Amount,Category,Vendor,Notes'
    const examples = [
      'Elevator AMC payment,2026-06-01,5000,maintenance,Otis Elevators,Annual contract',
      'Generator diesel refill,2026-06-05,1200,utilities,,',
      'Garden maintenance,2026-06-10,800,housekeeping,Greenleaf Services,Monthly visit',
    ].join('\n')
    const content = `${header}\n${examples}`
    const blob = new Blob([content], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'expense_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  },

  getMonthlySummary: async (months = 6): Promise<ExpenseMonthlySummary[]> => {
    const res = await api.get('/expenses/monthly-summary', { params: { months } })
    return res.data
  },

  getCategoryBreakdown: async (year?: number): Promise<ExpenseCategoryBreakdown[]> => {
    const res = await api.get('/expenses/category-breakdown', { params: { year } })
    return res.data
  },

  getYearOverYear: async (years = 3): Promise<ExpenseYearOverYear[]> => {
    const res = await api.get('/expenses/year-over-year', { params: { years } })
    return res.data
  },

  getVendorSummary: async (year?: number): Promise<ExpenseVendorSummaryItem[]> => {
    const res = await api.get('/expenses/vendor-summary', { params: { year } })
    return res.data
  },

  // ── Category management ───────────────────────────────────────────────────
  categories: {
    list: async (): Promise<ExpenseCategoryItem[]> => {
      const res = await api.get('/expenses/categories')
      return res.data
    },

    create: async (payload: {
      name: string
      slug: string
      color?: string
      sortOrder?: number
    }): Promise<ExpenseCategoryItem> => {
      const res = await api.post('/expenses/categories', payload)
      return res.data
    },

    update: async (id: number, payload: {
      name?: string
      color?: string | null
      sortOrder?: number
      isActive?: boolean
    }): Promise<ExpenseCategoryItem> => {
      const res = await api.put(`/expenses/categories/${id}`, payload)
      return res.data
    },

    delete: async (id: number): Promise<{ deleted: boolean }> => {
      const res = await api.delete(`/expenses/categories/${id}`)
      return res.data
    },
  },
}