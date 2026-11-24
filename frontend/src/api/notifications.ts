import api from './axios'
import { Notification, PaginatedResponse } from '../types'

export const notificationsApi = {
  getMyNotifications: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Notification>> => {
    const res = await api.get('/notifications/me', { params })
    return res.data
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const res = await api.get('/notifications/unread-count')
    return res.data
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const res = await api.put(`/notifications/${id}/read`)
    return res.data
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const res = await api.put('/notifications/read-all')
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  },

  notifyAdmin: async (payload: { message: string }): Promise<{ notified: number }> => {
    const res = await api.post('/notifications/notify-admin', payload)
    return res.data
  },
}