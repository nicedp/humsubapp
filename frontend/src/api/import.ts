import api from './axios'

export interface ImportRowResult {
  sr: number
  flatNumber: string
  residentName: string
  status: 'created' | 'skipped' | 'error'
  reason?: string
}

export interface ImportResult {
  total: number
  created: number
  skipped: number
  errors: number
  rows: ImportRowResult[]
}

export const importApi = {
  importResidents: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/import/residents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  /** Download a CSV template for the resident import (with example rows) */
  downloadTemplate: () => {
    const header = 'Sr,FlatNumber,FlatSize,ResidentName,PhoneNumber,Email,OwnerType,ParkingNumber,BlockName,PropertyType,Floor'
    const example1 = '1,A-101,1000,John Smith,9876543210,john.smith@email.com,owner,P-001,Block A,Flat,1'
    const example2 = '2,A-201,1200,Jane Doe,9876543211,jane.doe@email.com,tenant,not allotted,Block A,Flat,2'
    const example3 = '3,RH-01,1500,Raj Kumar,9876543212,raj.kumar@email.com,owner,P-002,Block B,Row House,'
    const csv = [header, example1, example2, example3].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resident_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  },
}