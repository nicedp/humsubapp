import api from './axios'

export interface Vendor {
  id: string
  societyId: number
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
  serviceType: string
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AmcContract {
  id: string
  societyId: number
  vendorId: string
  vendorName: string | null
  vendorPhone: string | null
  assetId: string | null
  assetName: string | null
  contractNumber: string | null
  serviceType: string
  annualCost: number
  startDate: string
  endDate: string
  serviceFrequencyDays: number
  lastServiceDate: string | null
  nextServiceDue: string | null
  daysUntilDue: number | null
  dueStatus: 'overdue' | 'due_soon' | 'ok' | 'unknown'
  status: 'active' | 'expired' | 'cancelled' | 'pending_renewal'
  notes: string | null
  createdAt: string
  updatedAt: string
  serviceLogs?: ServiceLog[]
}

export interface ServiceLog {
  id: string
  contractId: string
  serviceDate: string
  technicianName: string | null
  workDone: string
  serviceCost: number | null
  nextServiceDue: string | null
  remarks: string | null
  recordedBy: string | null
  createdAt: string
}

export interface VendorListResponse {
  data: Vendor[]
  total: number
  skip: number
  limit: number
}

export interface ContractListResponse {
  data: AmcContract[]
  total: number
  skip: number
  limit: number
}

export const vendorsApi = {
  // Vendors
  listVendors: async (params?: Record<string, unknown>): Promise<VendorListResponse> => {
    const { data } = await api.get('/vendors', { params })
    return data
  },

  getVendor: async (id: string): Promise<Vendor> => {
    const { data } = await api.get(`/vendors/${id}`)
    return data
  },

  createVendor: async (payload: {
    name: string
    contactPerson?: string
    phone?: string
    email?: string
    serviceType: string
    notes?: string
    isActive?: boolean
  }): Promise<Vendor> => {
    const { data } = await api.post('/vendors', payload)
    return data
  },

  updateVendor: async (id: string, payload: Partial<{
    name: string
    contactPerson: string
    phone: string
    email: string
    serviceType: string
    notes: string
    isActive: boolean
  }>): Promise<Vendor> => {
    const { data } = await api.patch(`/vendors/${id}`, payload)
    return data
  },

  deleteVendor: async (id: string): Promise<void> => {
    await api.delete(`/vendors/${id}`)
  },

  // Contracts
  listContracts: async (params?: Record<string, unknown>): Promise<ContractListResponse> => {
    const { data } = await api.get('/vendors/contracts', { params })
    return data
  },

  getContract: async (id: string): Promise<AmcContract> => {
    const { data } = await api.get(`/vendors/contracts/${id}`)
    return data
  },

  createContract: async (payload: {
    vendorId: string
    assetId?: string
    contractNumber?: string
    serviceType: string
    annualCost: number
    startDate: string
    endDate: string
    serviceFrequencyDays?: number
    nextServiceDue?: string
    status?: string
    notes?: string
  }): Promise<AmcContract> => {
    const { data } = await api.post('/vendors/contracts', payload)
    return data
  },

  updateContract: async (id: string, payload: Partial<{
    vendorId: string
    assetId: string
    contractNumber: string
    serviceType: string
    annualCost: number
    startDate: string
    endDate: string
    serviceFrequencyDays: number
    nextServiceDue: string
    status: string
    notes: string
  }>): Promise<AmcContract> => {
    const { data } = await api.patch(`/vendors/contracts/${id}`, payload)
    return data
  },

  deleteContract: async (id: string): Promise<void> => {
    await api.delete(`/vendors/contracts/${id}`)
  },

  // Service Logs
  addServiceLog: async (contractId: string, payload: {
    serviceDate: string
    technicianName?: string
    workDone: string
    serviceCost?: number
    nextServiceDue?: string
    remarks?: string
  }): Promise<ServiceLog> => {
    const { data } = await api.post(`/vendors/contracts/${contractId}/logs`, payload)
    return data
  },

  deleteServiceLog: async (contractId: string, logId: string): Promise<void> => {
    await api.delete(`/vendors/contracts/${contractId}/logs/${logId}`)
  },
}