import api from './axios'

export interface IncomeRecord {
  id: string
  title: string
  source: string
  amount: number
  receivedOn: string
  payer: string | null
  notes: string | null
  recordedBy: string | null
  createdAt: string
  updatedAt: string
}

export interface IncomeListResponse {
  data: IncomeRecord[]
  total: number
  skip: number
  limit: number
}

export interface CreateIncomePayload {
  title: string
  source: string
  amount: number
  receivedOn: string
  payer?: string
  notes?: string
}

export const incomeApi = {
  list: async (params?: Record<string, unknown>): Promise<IncomeListResponse> => {
    const { data } = await api.get('/income', { params })
    return data
  },
  getById: async (id: string): Promise<IncomeRecord> => {
    const { data } = await api.get(`/income/${id}`)
    return data
  },
  create: async (payload: CreateIncomePayload): Promise<IncomeRecord> => {
    const { data } = await api.post('/income', payload)
    return data
  },
  update: async (id: string, payload: Partial<CreateIncomePayload>): Promise<IncomeRecord> => {
    const { data } = await api.put(`/income/${id}`, payload)
    return data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/income/${id}`)
  },
}