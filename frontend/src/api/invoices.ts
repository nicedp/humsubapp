import api from './axios'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
}

export interface Invoice {
  id: string
  invoiceNumber: string
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  fromName: string
  fromAddress: string | null
  fromPhone: string | null
  fromEmail: string | null
  toName: string
  toAddress: string | null
  toPhone: string | null
  toEmail: string | null
  invoiceDate: string
  dueDate: string | null
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  notes: string | null
  createdBy: string | null
  items: InvoiceItem[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceListResponse {
  data: Invoice[]
  total: number
  skip: number
  limit: number
}

export interface InvoiceItemPayload {
  id?: string
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoicePayload {
  fromName: string
  fromAddress?: string
  fromPhone?: string
  fromEmail?: string
  toName: string
  toAddress?: string
  toPhone?: string
  toEmail?: string
  invoiceDate?: string
  dueDate?: string
  items: InvoiceItemPayload[]
  taxRate?: number
  notes?: string
  status?: string
}

export const invoicesApi = {
  list: async (params?: Record<string, unknown>): Promise<InvoiceListResponse> => {
    const { data } = await api.get('/invoices', { params })
    return data
  },
  getById: async (id: string): Promise<Invoice> => {
    const { data } = await api.get(`/invoices/${id}`)
    return data
  },
  create: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    const { data } = await api.post('/invoices', payload)
    return data
  },
  update: async (id: string, payload: Partial<CreateInvoicePayload>): Promise<Invoice> => {
    const { data } = await api.put(`/invoices/${id}`, payload)
    return data
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/invoices/${id}`)
  },
}