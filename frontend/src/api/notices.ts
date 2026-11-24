import api from './axios'
import { Notice, PaginatedResponse } from '../types'

export const noticesApi = {
  list: async (params?: { skip?: number; limit?: number; activeOnly?: boolean }): Promise<PaginatedResponse<Notice>> => {
    const res = await api.get('/notices', { params })
    return res.data
  },

  getById: async (id: string): Promise<Notice> => {
    const res = await api.get(`/notices/${id}`)
    return res.data
  },

  create: async (payload: { title: string; body: string; priority?: string; expiresOn?: string }): Promise<Notice> => {
    const res = await api.post('/notices', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<Notice>): Promise<Notice> => {
    const res = await api.put(`/notices/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notices/${id}`)
  },
}