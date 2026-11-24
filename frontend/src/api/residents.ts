import api from './axios'
import { Resident, Vehicle, VehicleType, PaginatedResponse } from '../types'

// ─── Family Member types ──────────────────────────────────────────────────────

export type FamilyRelation = 'spouse' | 'child' | 'parent' | 'sibling' | 'other'

export interface FamilyMember {
  id: string
  residentId: string
  name: string
  relation: FamilyRelation
  phone: string | null
  dateOfBirth: string | null
  isEmergency: boolean
  createdAt: string
  updatedAt: string
}

// ─── Resident Profile (aggregated) ───────────────────────────────────────────

export interface ResidentProfile {
  resident: Resident & {
    dateOfBirth: string | null
    idProofType: string | null
    idProofNumber: string | null
    emergencyContactName: string | null
    emergencyContactPhone: string | null
  }
  flat: {
    id: string
    flatNumber: string
    floor: number | null
    type: string
    sqFt: number
    status: string
    block: { id: string; name: string; blockType: string } | null
    parkingSlots: Array<{ id: string; slotNumber: string; vehicleNumber: string | null; vehicleType: string | null }>
  }
  vehicles: Vehicle[]
  familyMembers: FamilyMember[]
  billing: {
    summary: { outstanding: number; totalPaid: number; billCount: number }
    recent: Array<{
      id: string; month: number; year: number; amount: number; status: string; dueDate: string
      payment: { amountPaid: number; paidOn: string; paymentMode: string } | null
    }>
  }
  complaints: {
    openCount: number
    recent: Array<{ id: string; category: string; description: string; status: string; raisedOn: string; resolvedOn: string | null }>
  }
  recentVisitors: Array<{ id: string; visitorName: string; visitorType: string; purpose: string | null; entryTime: string; exitTime: string | null }>
  committeeRoles: Array<{ id: string; committeeName: string; designation: string; isActive: boolean; joinedOn: string; leftOn: string | null }>
  adminNotes: Array<{ id: string; title: string; content: string; color: string; isPinned: boolean; createdAt: string; updatedAt: string }>
  portalAccount: { userId: string; username: string; role: string; isActive: boolean; lastLogin: string | null } | null
}

export interface BulkResidentItem {
  name: string
  email: string
  phone: string
  whatsapp?: string
  flatId: string
  residentType: 'owner' | 'tenant'
  moveInDate?: string
  numCars?: number
  numBikes?: number
  username?: string
  password?: string
}

export interface BulkResidentRowResult {
  index: number
  status: 'created' | 'error'
  id?: string
  name?: string
  reason?: string
}

export interface BulkResidentResult {
  total: number
  created: number
  errors: number
  rows: BulkResidentRowResult[]
}

export const residentsApi = {
  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    residentType?: 'owner' | 'tenant'
    isActive?: boolean
    flatId?: string
  }): Promise<PaginatedResponse<Resident>> => {
    const res = await api.get('/residents', { params })
    return res.data
  },

  getById: async (id: string): Promise<Resident> => {
    const res = await api.get(`/residents/${id}`)
    return res.data
  },

  create: async (payload: Partial<Resident> & { password?: string }): Promise<Resident> => {
    const res = await api.post('/residents', payload)
    return res.data
  },

  update: async (id: string, payload: Partial<Resident>): Promise<Resident> => {
    const res = await api.put(`/residents/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/residents/${id}`)
  },

  deactivate: async (id: string): Promise<Resident> => {
    const res = await api.put(`/residents/${id}`, { isActive: false })
    return res.data
  },

  // ─── Vehicle methods ──────────────────────────────────────────
  getVehicles: async (residentId: string): Promise<Vehicle[]> => {
    const res = await api.get(`/residents/${residentId}/vehicles`)
    return res.data
  },

  addVehicle: async (
    residentId: string,
    payload: { vehicleType: VehicleType; vehicleNumber: string; make?: string; model?: string; color?: string }
  ): Promise<Vehicle> => {
    const res = await api.post(`/residents/${residentId}/vehicles`, payload)
    return res.data
  },

  updateVehicle: async (
    residentId: string,
    vehicleId: string,
    payload: { vehicleType?: VehicleType; vehicleNumber?: string; make?: string; model?: string; color?: string; isActive?: boolean }
  ): Promise<Vehicle> => {
    const res = await api.put(`/residents/${residentId}/vehicles/${vehicleId}`, payload)
    return res.data
  },

  deleteVehicle: async (residentId: string, vehicleId: string): Promise<void> => {
    await api.delete(`/residents/${residentId}/vehicles/${vehicleId}`)
  },

  // ─── Self-service "me" endpoints (owner / tenant) ─────────────
  getMyProfile: async (): Promise<Resident> => {
    const res = await api.get('/residents/me')
    return res.data
  },

  updateMyProfile: async (payload: { name?: string; phone?: string; whatsapp?: string | null }): Promise<Resident> => {
    const res = await api.patch('/residents/me', payload)
    return res.data
  },

  getMyVehicles: async (): Promise<Vehicle[]> => {
    const res = await api.get('/residents/me/vehicles')
    return res.data
  },

  bulkCreate: async (residents: BulkResidentItem[]): Promise<BulkResidentResult> => {
    const res = await api.post('/residents/bulk', { residents })
    return res.data
  },

  // ─── Profile (aggregated) ─────────────────────────────────────
  getProfile: async (id: string): Promise<ResidentProfile> => {
    const res = await api.get(`/residents/${id}/profile`)
    return res.data
  },

  // ─── Family Members ───────────────────────────────────────────
  getFamilyMembers: async (residentId: string): Promise<FamilyMember[]> => {
    const res = await api.get(`/residents/${residentId}/family`)
    return res.data
  },

  addFamilyMember: async (
    residentId: string,
    payload: { name: string; relation: FamilyRelation; phone?: string | null; dateOfBirth?: string | null; isEmergency?: boolean }
  ): Promise<FamilyMember> => {
    const res = await api.post(`/residents/${residentId}/family`, payload)
    return res.data
  },

  updateFamilyMember: async (
    residentId: string,
    memberId: string,
    payload: Partial<{ name: string; relation: FamilyRelation; phone: string | null; dateOfBirth: string | null; isEmergency: boolean }>
  ): Promise<FamilyMember> => {
    const res = await api.patch(`/residents/${residentId}/family/${memberId}`, payload)
    return res.data
  },

  deleteFamilyMember: async (residentId: string, memberId: string): Promise<void> => {
    await api.delete(`/residents/${residentId}/family/${memberId}`)
  },

  // ─── Admin: Change resident password ─────────────────────────
  changePassword: async (
    residentId: string,
    payload: { newPassword: string; notify: 'email' | 'whatsapp' | 'none' }
  ): Promise<{ success: boolean; notified: string }> => {
    const res = await api.post(`/residents/${residentId}/change-password`, payload)
    return res.data
  },
}