// ─── Shared Frontend Types ────────────────────────────────────────────────────

export type AppRole = 'admin' | 'sub_admin' | 'member' | 'owner' | 'tenant' | 'security'

export interface AuthUser {
  id: string
  username: string
  role: AppRole
  residentId: string | null
  staffId: string | null
}