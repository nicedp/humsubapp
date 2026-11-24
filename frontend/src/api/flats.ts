import api from './axios'
import { Flat, PaginatedResponse, PropertyType } from '../types'

export interface BulkFlatPayload {
  flatNumber: string
  blockId?: string | null
  floor?: number | null
  type: PropertyType
  sqFt: number
  status?: 'occupied' | 'vacant'
}

export interface BulkCreatedFlat {
  id: string
  flatNumber: string
  floor: number | null
  type: string
}

export interface BulkCreateResult {
  created: number
  skipped: string[]
  flats: BulkCreatedFlat[]
}

export const flatsApi = {
  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    status?: 'occupied' | 'vacant'
    floor?: number
    type?: PropertyType
    blockId?: string
  }): Promise<PaginatedResponse<Flat>> => {
    const res = await api.get('/flats', { params })
    return res.data
  },

  getById: async (id: string): Promise<Flat> => {
    const res = await api.get(`/flats/${id}`)
    return res.data
  },

  create: async (payload: {
    flatNumber: string
    blockId?: string | null
    floor?: number | null
    type: PropertyType
    sqFt: number
    status?: 'occupied' | 'vacant'
  }): Promise<Flat> => {
    const res = await api.post('/flats', payload)
    return res.data
  },

  update: async (id: string, payload: {
    flatNumber?: string
    blockId?: string | null
    floor?: number | null
    type?: PropertyType
    sqFt?: number
    status?: 'occupied' | 'vacant'
  }): Promise<Flat> => {
    const res = await api.patch(`/flats/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/flats/${id}`)
  },

  bulkCreate: async (flats: BulkFlatPayload[]): Promise<BulkCreateResult> => {
    const res = await api.post('/flats/bulk', flats)
    return res.data
  },
}