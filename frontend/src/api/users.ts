import api from './axios'
import { AdminUser, PaginatedResponse } from '../types'

export const usersApi = {
  list: async (params?: { skip?: number; limit?: number; search?: string; role?: string; isActive?: boolean }): Promise<PaginatedResponse<AdminUser>> => {
    const res = await api.get('/users', { params })
    return res.data
  },

  getById: async (id: string): Promise<AdminUser> => {
    const res = await api.get(`/users/${id}`)
    return res.data
  },

  create: async (payload: { username: string; password: string; role: 'admin' | 'security' }): Promise<AdminUser> => {
    const res = await api.post('/users', payload)
    return res.data
  },

  update: async (id: string, payload: { password?: string; isActive?: boolean; role?: 'admin' | 'security' }): Promise<AdminUser> => {
    const res = await api.patch(`/users/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}