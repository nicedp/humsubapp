import api from './axios'
import { AuthUser } from '../types'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SocietyPublic {
  id: number
  name: string
  contactEmail: string | null
  contactPhone: string | null
  city: string | null
  state: string | null
  pincode: string | null
  address: string | null
  registrationNumber: string | null
  logoUrl: string | null
  status: 'pending' | 'setup' | 'active' | 'suspended'
  activatedAt: string | null
  // Added Sprint 7: society login identifiers
  accountNumber: string | null
  societyUrl: string | null
}

export interface SessionProgress {
  id: string
  societyId: number
  currentStep: number
  step1Data: Record<string, unknown> | null
  step2Data: { username?: string } | null
  step3Data: { ratePerSqft?: number; fixedCharge?: number; lateFeeGraceDays?: number; lateFeePerDay?: number; billVacantFlats?: boolean } | null
  step4Data: { blockIds?: string[] } | null
  completedAt: string | null
}

/** Alias for convenience in consumer components */
export type OnboardingProgress = ProgressResponse

export interface SocietyLookupResult {
  id: number
  name: string
  city: string | null
  state: string | null
  accountNumber: string  // partially masked e.g. "2026**1001"
  societyUrl: string | null
  status: string
}

export interface RegisterPayload {
  name: string
  contactEmail: string
  contactPhone: string
  city?: string
  state?: string
  /** Optional preferred slug — backend will use this if provided, falling back to name-derived slug */
  societyUrl?: string
}

export interface Step1Payload {
  name: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  registrationNumber?: string
  contactEmail?: string
  contactPhone?: string
}

export interface Step2Payload {
  fullName: string
  username: string
  password: string
  confirmPassword: string
}

export interface Step2Response {
  message: string
  token: string
  user: AuthUser
}

export interface Step3Payload {
  ratePerSqft: number
  fixedCharge: number
  lateFeeGraceDays: number
  lateFeePerDay: number
  billVacantFlats: boolean
}

export interface ValidateTokenResponse {
  society: SocietyPublic
  session: SessionProgress | null
}

export interface ProgressResponse {
  society: SocietyPublic
  session: SessionProgress | null
}

// ─── API Methods ───────────────────────────────────────────────────────────────

export const onboardingApi = {
  /** POST /onboarding/register — public, rate-limited */
  register: async (payload: RegisterPayload): Promise<{ message: string; societyId: number; setupUrl?: string }> => {
    const res = await api.post('/onboarding/register', payload)
    return res.data
  },

  /** GET /onboarding/check-url?slug=<slug> — check if a society URL slug is available */
  checkUrl: async (slug: string): Promise<{ available: boolean }> => {
    const res = await api.get('/onboarding/check-url', { params: { slug } })
    return res.data
  },

  /** GET /onboarding/:token/validate — validate token + get society + session */
  validateToken: async (token: string): Promise<ValidateTokenResponse> => {
    const res = await api.get(`/onboarding/${token}/validate`)
    return res.data
  },

  /** POST /onboarding/:token/step1 — save society profile (token-gated, no JWT) */
  saveStep1: async (token: string, payload: Step1Payload): Promise<{ message: string }> => {
    const res = await api.post(`/onboarding/${token}/step1`, payload)
    return res.data
  },

  /** POST /onboarding/:token/step2 — create admin account; returns JWT */
  saveStep2: async (token: string, payload: Step2Payload): Promise<Step2Response> => {
    const res = await api.post(`/onboarding/${token}/step2`, payload)
    return res.data
  },

  /** POST /onboarding/step3 — save billing config (JWT auth) */
  saveStep3: async (payload: Step3Payload): Promise<{ message: string }> => {
    const res = await api.post('/onboarding/step3', payload)
    return res.data
  },

  /** GET /onboarding/progress — get session progress (JWT auth) */
  getProgress: async (): Promise<ProgressResponse> => {
    const res = await api.get('/onboarding/progress')
    return res.data
  },

  /** POST /onboarding/activate — activate society (JWT auth) */
  activate: async (): Promise<{ message: string }> => {
    const res = await api.post('/onboarding/activate')
    return res.data
  },

  /** GET /onboarding/find-account?q=<query> — public; search society by name/email/phone */
  findAccount: async (q: string): Promise<{ results: SocietyLookupResult[] }> => {
    const res = await api.get('/onboarding/find-account', { params: { q } })
    return res.data
  },
}