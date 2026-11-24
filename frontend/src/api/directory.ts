import api from './axios'
import { DirectoryEntry, PaginatedResponse } from '../types'

export const directoryApi = {
  list: async (params?: { skip?: number; limit?: number; floor?: number }): Promise<PaginatedResponse<DirectoryEntry>> => {
    const res = await api.get('/directory', { params })
    return res.data
  },
}