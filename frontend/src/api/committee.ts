import api from './axios'

export interface CommitteeMemberResident {
  id: string
  name: string
  flatNumber: string | null
  floor: number | null
  flatId: string
}

export interface CommitteeMember {
  id: string
  committeeId: string
  residentId: string
  designation: string
  isActive: boolean
  joinedOn: string
  leftOn: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  resident?: CommitteeMemberResident
}

export interface CommitteeAchievement {
  id: string
  committeeId: string
  title: string
  description: string | null
  achievedOn: string
  category: string
  createdAt: string
  updatedAt: string
}

export interface Committee {
  id: string
  societyId: number
  name: string
  formedOn: string
  dissolvedOn: string | null
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  memberCount: number
  achievementCount: number
  members?: CommitteeMember[]
  achievements?: CommitteeAchievement[]
}

// ─── Committees ───────────────────────────────────────────────────────────────

export const committeeApi = {
  list: async (): Promise<Committee[]> => {
    const res = await api.get('/committees')
    return res.data
  },

  get: async (id: string): Promise<Committee> => {
    const res = await api.get(`/committees/${id}`)
    return res.data
  },

  create: async (payload: {
    name: string
    formedOn: string
    dissolvedOn?: string | null
  }): Promise<Committee> => {
    const res = await api.post('/committees', payload)
    return res.data
  },

  update: async (
    id: string,
    payload: { name?: string; formedOn?: string; dissolvedOn?: string | null }
  ): Promise<Committee> => {
    const res = await api.patch(`/committees/${id}`, payload)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/committees/${id}`)
  },

  activate: async (id: string): Promise<Committee> => {
    const res = await api.post(`/committees/${id}/activate`)
    return res.data
  },

  // ─── Members ────────────────────────────────────────────────────────────────

  addMember: async (
    committeeId: string,
    payload: {
      residentId: string
      designation: string
      joinedOn?: string
      notes?: string | null
    }
  ): Promise<CommitteeMember> => {
    const res = await api.post(`/committees/${committeeId}/members`, payload)
    return res.data
  },

  updateMember: async (
    committeeId: string,
    memberId: string,
    payload: {
      designation?: string
      isActive?: boolean
      leftOn?: string | null
      notes?: string | null
    }
  ): Promise<CommitteeMember> => {
    const res = await api.patch(`/committees/${committeeId}/members/${memberId}`, payload)
    return res.data
  },

  removeMember: async (committeeId: string, memberId: string): Promise<void> => {
    await api.delete(`/committees/${committeeId}/members/${memberId}`)
  },

  // ─── Achievements ────────────────────────────────────────────────────────────

  addAchievement: async (
    committeeId: string,
    payload: {
      title: string
      description?: string | null
      achievedOn: string
      category: string
    }
  ): Promise<CommitteeAchievement> => {
    const res = await api.post(`/committees/${committeeId}/achievements`, payload)
    return res.data
  },

  deleteAchievement: async (committeeId: string, achievementId: string): Promise<void> => {
    await api.delete(`/committees/${committeeId}/achievements/${achievementId}`)
  },
}