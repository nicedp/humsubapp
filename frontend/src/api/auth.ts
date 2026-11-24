import api from './axios'
import { AuthUser } from '../types'

/** Path A: standard login — account number + username + password */
export interface LoginPayloadStandard {
  accountNumber: string
  username: string
  password: string
  rememberMe?: boolean
}

/** Path B: admin email/phone login — identifier (email or phone) + password only */
export interface LoginPayloadIdentifier {
  identifier: string
  password: string
  rememberMe?: boolean
}

export type LoginPayload = LoginPayloadStandard | LoginPayloadIdentifier

export interface LoginResponse {
  token: string
  user: AuthUser
}

/** Returned when 2FA is required — frontend shows TOTP input */
export interface TotpRequiredResponse {
  tempToken: string
  step: 'totp_required'
}

export interface TotpSetupData {
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
}

export interface TotpStatus {
  isEnabled: boolean
  backupCodesRemaining: number
}

export interface LoginSession {
  id: string
  ipAddress: string
  userAgent: string
  browser: string | null
  device: string | null
  city: string | null
  loggedAt: string
  isActive: boolean
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<LoginResponse | TotpRequiredResponse> => {
    const res = await api.post('/auth/login', payload)
    return res.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get('/auth/me')
    return res.data
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }): Promise<void> => {
    await api.put('/auth/change-password', payload)
  },

  // ─── Forgot / Reset Password ──────────────────────────────────────────────

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post(`/auth/reset-password/${token}`, { token, newPassword })
  },

  // ─── TOTP 2FA ─────────────────────────────────────────────────────────────

  /** Initiate TOTP setup — returns QR code + secret. Call before enabling. */
  setupTotp: async (): Promise<TotpSetupData> => {
    const res = await api.post('/auth/2fa/setup')
    return res.data
  },

  /** Confirm TOTP setup with code — activates 2FA and returns backup codes */
  enableTotp: async (code: string): Promise<{ message: string; backupCodes: string[] }> => {
    const res = await api.post('/auth/2fa/enable', { code })
    return res.data
  },

  /** Exchange tempToken + TOTP code for full JWT (called from login page TOTP step) */
  verifyTotpLogin: async (tempToken: string, code: string, rememberMe = false): Promise<LoginResponse> => {
    const res = await api.post('/auth/2fa/verify', { tempToken, code, rememberMe })
    return res.data
  },

  /** Disable TOTP (requires current TOTP code) */
  disableTotp: async (code: string): Promise<void> => {
    await api.delete('/auth/2fa', { data: { code } })
  },

  /** Get TOTP status for current user */
  getTotpStatus: async (): Promise<TotpStatus> => {
    const res = await api.get('/auth/2fa/status')
    return res.data
  },

  // ─── Login Sessions ───────────────────────────────────────────────────────

  getSessions: async (): Promise<LoginSession[]> => {
    const res = await api.get('/auth/sessions')
    return res.data
  },

  invalidateSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`)
  },
}