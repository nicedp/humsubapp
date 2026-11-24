import api from './axios'
import { ParkingSlot, PaginatedResponse } from '../types'

export const parkingApi = {
  list: async (params?: { skip?: number; limit?: number; isOccupied?: boolean; search?: string }): Promise<PaginatedResponse<ParkingSlot>> => {
    const res = await api.get('/parking', { params })
    return res.data
  },

  getById: async (id: string): Promise<ParkingSlot> => {
    const res = await api.get(`/parking/${id}`)
    return res.data
  },

  create: async (payload: Partial<ParkingSlot>): Promise<ParkingSlot> => {
    const res = await api.post('/parking', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<ParkingSlot>): Promise<ParkingSlot> => {
    const res = await api.put(`/parking/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/parking/${id}`)
  },

  assign: async (id: string, payload: { flatId: string; vehicleNumber?: string; vehicleType?: string }): Promise<ParkingSlot> => {
    const res = await api.patch(`/parking/${id}/assign`, payload)
    return res.data
  },

  unassign: async (id: string): Promise<ParkingSlot> => {
    const res = await api.patch(`/parking/${id}/unassign`)
    return res.data
  },
}