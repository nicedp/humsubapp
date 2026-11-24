import api from './axios'
import { Staff, PaginatedResponse } from '../types'

export interface BulkStaffItem {
  name: string
  role: string
  phone?: string
  shift?: string
  joinDate?: string
  username?: string
  password?: string
}

export interface BulkStaffRowResult {
  index: number
  status: 'created' | 'error'
  id?: string
  name?: string
  reason?: string
}

export interface BulkStaffResult {
  total: number
  created: number
  errors: number
  rows: BulkStaffRowResult[]
}

export const staffApi = {
  list: async (params?: { skip?: number; limit?: number; role?: string; isActive?: boolean; search?: string }): Promise<PaginatedResponse<Staff>> => {
    const res = await api.get('/staff', { params })
    return res.data
  },

  getById: async (id: string): Promise<Staff> => {
    const res = await api.get(`/staff/${id}`)
    return res.data
  },

  create: async (payload: Partial<Staff> & { password?: string; username?: string }): Promise<Staff> => {
    const res = await api.post('/staff', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<Staff>): Promise<Staff> => {
    const res = await api.put(`/staff/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/staff/${id}`)
  },

  bulkCreate: async (staff: BulkStaffItem[]): Promise<BulkStaffResult> => {
    const res = await api.post('/staff/bulk', { staff })
    return res.data
  },
}