import api from './axios'
import { Visitor, PaginatedResponse } from '../types'

export interface VisitorStats {
  byType:      Record<string, number>
  totalInside: number
}

export interface VisitorFilters {
  skip?:        number
  limit?:       number
  flatId?:      string
  search?:      string
  visitorType?: string
  dateFrom?:    string
  dateTo?:      string
  hasExit?:     'true' | 'false'
}

export const visitorsApi = {
  list: async (params?: VisitorFilters): Promise<PaginatedResponse<Visitor>> => {
    const res = await api.get('/visitors', { params })
    return res.data
  },

  getById: async (id: string): Promise<Visitor> => {
    const res = await api.get(`/visitors/${id}`)
    return res.data
  },

  getMyVisitors: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Visitor>> => {
    const res = await api.get('/visitors/my', { params })
    return res.data
  },

  getTodaysVisitors: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Visitor>> => {
    const res = await api.get('/visitors/today', { params })
    return res.data
  },

  logEntry: async (payload: {
    flatId:       string
    visitorName:  string
    visitorType:  string
    phone?:       string
    vehicleNumber?: string
    purpose?:     string
  }): Promise<Visitor> => {
    const res = await api.post('/visitors/entry', payload)
    return res.data
  },

  logExit: async (id: string): Promise<Visitor> => {
    const res = await api.put(`/visitors/${id}/exit`)
    return res.data
  },

  getStats: async (params?: { dateFrom?: string; dateTo?: string }): Promise<VisitorStats> => {
    const res = await api.get('/visitors/stats', { params })
    return res.data
  },

  exportCSV: async (filters?: Omit<VisitorFilters, 'skip' | 'limit'>): Promise<void> => {
    const res = await api.get('/visitors/export', {
      params:       filters,
      responseType: 'blob',
    })
    // Trigger browser file download
    const url      = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
    const link     = document.createElement('a')
    link.href      = url
    const date     = new Date().toISOString().slice(0, 10)
    link.download  = `visitors-${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  },
}