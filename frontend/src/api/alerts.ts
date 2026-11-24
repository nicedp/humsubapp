import api from './axios'

export interface AlertItem {
  id: string
  label: string
  detail: string
  daysUntil?: number
  daysOverdue?: number
  link: string
}

export interface AlertSummary {
  overdueAssets: AlertItem[]
  assetsDueSoon: AlertItem[]
  amcOverdue: AlertItem[]
  amcDueSoon: AlertItem[]
  amcExpiringSoon: AlertItem[]
  overdueBillsCount: number
  overdueBillsAmount: number
  openComplaintsCount: number
  unreadResidentMessages: number
  totalAlerts: number
}

export const alertsApi = {
  getSummary: async (): Promise<AlertSummary> => {
    const res = await api.get('/alerts/summary')
    return res.data
  },
}