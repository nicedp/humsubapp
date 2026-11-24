import api from './axios'
import { SocietySettings } from '../types'

export const settingsApi = {
  get: async (): Promise<SocietySettings> => {
    const res = await api.get('/settings')
    return res.data
  },

  update: async (payload: Partial<SocietySettings>): Promise<SocietySettings> => {
    const res = await api.put('/settings', payload)
    return res.data
  },

  generateAccountNumber: async (): Promise<{ accountNumber: string }> => {
    const res = await api.post('/settings/generate-account-number')
    return res.data
  },
}