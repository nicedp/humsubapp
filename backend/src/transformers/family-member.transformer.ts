export interface FamilyMemberResponse {
  id: string
  residentId: string
  name: string
  relation: string
  phone: string | null
  dateOfBirth: Date | null
  isEmergency: boolean
  createdAt: Date
  updatedAt: Date
}

export function transformFamilyMember(fm: any): FamilyMemberResponse {
  return {
    id: fm.id,
    residentId: fm.residentId,
    name: fm.name,
    relation: fm.relation,
    phone: fm.phone ?? null,
    dateOfBirth: fm.dateOfBirth ?? null,
    isEmergency: fm.isEmergency,
    createdAt: fm.createdAt,
    updatedAt: fm.updatedAt,
  }
}

export function transformFamilyMembers(fms: any[]): FamilyMemberResponse[] {
  return fms.map(transformFamilyMember)
}