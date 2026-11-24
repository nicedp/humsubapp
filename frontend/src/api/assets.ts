import api from './axios'
import { Asset, PaginatedResponse } from '../types'

export const assetsApi = {
  list: async (params?: { skip?: number; limit?: number; type?: string; status?: string; search?: string }): Promise<PaginatedResponse<Asset>> => {
    const res = await api.get('/assets', { params })
    return res.data
  },

  getById: async (id: string): Promise<Asset> => {
    const res = await api.get(`/assets/${id}`)
    return res.data
  },

  create: async (payload: Partial<Asset>): Promise<Asset> => {
    const res = await api.post('/assets', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<Asset>): Promise<Asset> => {
    const res = await api.put(`/assets/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`)
  },
}