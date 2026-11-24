import api from './axios'

export interface SocietyEvent {
  id: string
  name: string
  description: string | null
  eventDate: string
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  budgetTarget: number | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
  totalCollected: number
  totalSpent: number
  netBalance: number
  contributorCount: number
  contributions?: EventContribution[]
  expenses?: EventExpense[]
  teamMembers?: EventTeamMember[]
}

export interface EventContribution {
  id: string
  eventId: string
  contributorName: string
  flatId: string | null
  flatNumber: string | null
  amount: number
  paymentMode: string
  paidOn: string
  notes: string | null
  recordedBy: string | null
  createdAt: string
}

export interface EventExpense {
  id: string
  eventId: string
  title: string
  category: string
  amount: number
  paidOn: string
  vendor: string | null
  notes: string | null
  recordedBy: string | null
  createdAt: string
}

export interface EventTeamMember {
  id: string
  eventId: string
  residentId: string
  residentName: string | null
  flatId: string | null
  role: string
  notes: string | null
  createdAt: string
}

export interface EventListResponse {
  data: SocietyEvent[]
  total: number
  skip: number
  limit: number
}

export interface BulkContributionRow {
  index: number
  status: 'created' | 'error'
  id?: string
  contributorName?: string
  reason?: string
}

export interface BulkContributionResult {
  total: number
  created: number
  errors: number
  rows: BulkContributionRow[]
}

export interface ImportContributionRow {
  row: number
  contributorName: string
  status: 'imported' | 'skipped' | 'error'
  reason?: string
}

export interface ImportContributionResult {
  total: number
  imported: number
  skipped: number
  errors: number
  rows: ImportContributionRow[]
}

export const eventsApi = {
  list: async (params?: Record<string, unknown>): Promise<EventListResponse> => {
    const { data } = await api.get('/events', { params })
    return data
  },

  getById: async (id: string): Promise<SocietyEvent> => {
    const { data } = await api.get(`/events/${id}`)
    return data
  },

  create: async (payload: {
    name: string
    description?: string
    eventDate: string
    status?: string
    budgetTarget?: number
  }): Promise<SocietyEvent> => {
    const { data } = await api.post('/events', payload)
    return data
  },

  update: async (id: string, payload: Partial<{
    name: string
    description: string
    eventDate: string
    status: string
    budgetTarget: number
  }>): Promise<SocietyEvent> => {
    const { data } = await api.patch(`/events/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`)
  },

  // Contributions
  addContribution: async (eventId: string, payload: {
    contributorName: string
    flatId?: string
    amount: number
    paymentMode?: string
    paidOn?: string
    notes?: string
  }): Promise<EventContribution> => {
    const { data } = await api.post(`/events/${eventId}/contributions`, payload)
    return data
  },

  deleteContribution: async (eventId: string, contributionId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/contributions/${contributionId}`)
  },

  bulkAddContributions: async (
    eventId: string,
    contributions: Array<{
      contributorName: string
      amount: number
      paymentMode?: string
      paidOn?: string
      flatId?: string
      notes?: string
    }>,
  ): Promise<BulkContributionResult> => {
    const { data } = await api.post(`/events/${eventId}/contributions/bulk`, { contributions })
    return data
  },

  importContributions: async (
    eventId: string,
    csv: string,
  ): Promise<ImportContributionResult> => {
    const { data } = await api.post(`/events/${eventId}/contributions/import`, { csv })
    return data
  },

  downloadContributionTemplate: (): void => {
    const header = 'contributorName,amount,paymentMode,paidOn,notes'
    const sample = [
      'Ramesh Kumar,500,cash,2026-09-15,Diwali donation',
      'Priya Sharma,1000,upi,2026-09-16,',
      'Suresh Nair,250,bank_transfer,,Thanks for organizing',
    ].join('\n')
    const csv = `${header}\n${sample}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contribution_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  },

  // Expenses
  addExpense: async (eventId: string, payload: {
    title: string
    category: string
    amount: number
    paidOn?: string
    vendor?: string
    notes?: string
  }): Promise<EventExpense> => {
    const { data } = await api.post(`/events/${eventId}/expenses`, payload)
    return data
  },

  deleteExpense: async (eventId: string, expenseId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/expenses/${expenseId}`)
  },

  // Team members
  addTeamMember: async (eventId: string, payload: {
    residentId: string
    role: string
    notes?: string
  }): Promise<EventTeamMember> => {
    const { data } = await api.post(`/events/${eventId}/team`, payload)
    return data
  },

  deleteTeamMember: async (eventId: string, memberId: string): Promise<void> => {
    await api.delete(`/events/${eventId}/team/${memberId}`)
  },
}