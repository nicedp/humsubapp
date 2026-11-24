import api from './axios'
import { Complaint, PaginatedResponse } from '../types'

export const complaintsApi = {
  list: async (params?: { skip?: number; limit?: number; status?: string; flatId?: string; category?: string }): Promise<PaginatedResponse<Complaint>> => {
    const res = await api.get('/complaints', { params })
    return res.data
  },

  getById: async (id: string): Promise<Complaint> => {
    const res = await api.get(`/complaints/${id}`)
    return res.data
  },

  getMyComplaints: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Complaint>> => {
    const res = await api.get('/complaints/my', { params })
    return res.data
  },

  create: async (payload: { category: string; description: string }): Promise<Complaint> => {
    const res = await api.post('/complaints', payload)
    return res.data
  },

  update: async (id: string, payload: { status: string; adminRemark?: string }): Promise<Complaint> => {
    const res = await api.put(`/complaints/${id}`, payload)
    return res.data
  },

  updateStatus: async (id: string, payload: { status: string; adminRemark?: string }): Promise<Complaint> => {
    const res = await api.put(`/complaints/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/complaints/${id}`)
  },
}