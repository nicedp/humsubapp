import api from './axios'
import { Block } from '../types'

export const blocksApi = {
  list: async (): Promise<Block[]> => {
    const res = await api.get('/blocks')
    return res.data
  },

  getById: async (id: string): Promise<Block> => {
    const res = await api.get(`/blocks/${id}`)
    return res.data
  },

  create: async (payload: {
    name: string
    description?: string | null
    blockType: 'flats' | 'rowhouses' | 'mixed'
    totalFloors?: number | null
  }): Promise<Block> => {
    const res = await api.post('/blocks', payload)
    return res.data
  },

  update: async (id: string, payload: {
    name?: string
    description?: string | null
    blockType?: 'flats' | 'rowhouses' | 'mixed'
    totalFloors?: number | null
    isActive?: boolean
  }): Promise<Block> => {
    const res = await api.patch(`/blocks/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/blocks/${id}`)
  },
}