import api from './axios'

export interface UserNote {
  id: string
  userId: string
  societyId: number
  title: string
  content: string
  color: 'yellow' | 'blue' | 'pink' | 'green' | 'purple' | 'white'
  isPinned: boolean
  isPublic: boolean
  authorUsername: string | null
  createdAt: string
  updatedAt: string
}

export interface NotesResponse {
  myNotes: UserNote[]
  publicNotes: UserNote[]
}

export const notesApi = {
  list: async (): Promise<NotesResponse> => {
    const { data } = await api.get('/notes')
    return data
  },

  create: async (payload: {
    title: string
    content?: string
    color?: string
    isPinned?: boolean
    isPublic?: boolean
  }): Promise<UserNote> => {
    const { data } = await api.post('/notes', payload)
    return data
  },

  update: async (id: string, payload: Partial<{
    title: string
    content: string
    color: string
    isPinned: boolean
    isPublic: boolean
  }>): Promise<UserNote> => {
    const { data } = await api.patch(`/notes/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`)
  },
}