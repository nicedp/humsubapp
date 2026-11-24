import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi, TotpSetupData } from '../../api/auth'

// ─── TOTP Setup Section ───────────────────────────────────────────────────────

function TotpSection() {
  const qc = useQueryClient()
  const [setupData, setSetupData] = useState<TotpSetupData | null>(null)
  const [codeInput, setCodeInput] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showDisable, setShowDisable] = useState(false)

  const { data: status, isLoading } = useQuery({
    queryKey: ['totp-status'],
    queryFn: authApi.getTotpStatus,
  })

  const setupMutation = useMutation({
    mutationFn: authApi.setupTotp,
    onSuccess: (data) => setSetupData(data),
    onError: () => toast.error('Failed to start 2FA setup'),
  })

  const enableMutation = useMutation({
    mutationFn: (code: string) => authApi.enableTotp(code),
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes)
      setShowBackupCodes(true)
      setSetupData(null)
      setCodeInput('')
      qc.invalidateQueries({ queryKey: ['totp-status'] })
      toast.success('Two-factor authentication enabled!')
    },
    onError: () => toast.error('Invalid code — try again'),
  })

  const disableMutation = useMutation({
    mutationFn: (code: string) => authApi.disableTotp(code),
    onSuccess: () => {
      setShowDisable(false)
      setDisableCode('')
      qc.invalidateQueries({ queryKey: ['totp-status'] })
      toast.success('Two-factor authentication disabled')
    },
    onError: () => toast.error('Invalid TOTP code'),
  })

  if (isLoading) {
    return <div className="text-sm text-gray-400 py-4">Loading 2FA status...</div>
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
        status?.isEnabled
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        <span className="text-lg">{status?.isEnabled ? '🛡️' : '⚠️'}</span>
        {status?.isEnabled
          ? `2FA is ENABLED — ${status.backupCodesRemaining} backup codes remaining`
          : '2FA is DISABLED — your account is less secure'}
      </div>

      {/* Backup codes shown after enabling */}
      {showBackupCodes && backupCodes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-5">
          <p className="text-sm font-semibold text-yellow-800 mb-1">⚠️ Save your backup codes</p>
          <p className="text-xs text-yellow-700 mb-3">
            These are shown only once. Store them safely — each can be used once if you lose your authenticator.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {backupCodes.map((code) => (
              <code key={code} className="bg-white border border-yellow-200 rounded px-3 py-1.5 text-xs font-mono text-center">
                {code}
              </code>
            ))}
          </div>
          <button
            onClick={() => setShowBackupCodes(false)}
            className="text-xs text-yellow-700 hover:underline"
          >
            I've saved them — dismiss
          </button>
        </div>
      )}

      {/* Enable flow */}
      {!status?.isEnabled && !setupData && (
        <button
          onClick={() => setupMutation.mutate()}
          disabled={setupMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {setupMutation.isPending ? 'Generating QR...' : '🔐 Enable Two-Factor Authentication'}
        </button>
      )}

      {/* QR code + verify */}
      {setupData && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <p className="text-sm font-semibold text-gray-800">
            Step 1: Scan this QR code with your authenticator app
          </p>
          <p className="text-xs text-gray-500">
            Use Google Authenticator, Authy, or any TOTP app.
          </p>
          <div className="flex justify-center">
            <img
              src={setupData.qrCodeDataUrl}
              alt="TOTP QR Code"
              className="w-48 h-48 rounded-lg border border-gray-200"
            />
          </div>
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">
              Can't scan? Enter key manually
            </summary>
            <code className="mt-1 block break-all bg-gray-50 border rounded px-2 py-1 font-mono text-xs">
              {setupData.secret}
            </code>
          </details>

          <p className="text-sm font-semibold text-gray-800 mt-2">
            Step 2: Enter the 6-digit code from your app
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => enableMutation.mutate(codeInput)}
              disabled={codeInput.length !== 6 || enableMutation.isPending}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {enableMutation.isPending ? 'Verifying...' : 'Activate'}
            </button>
            <button
              onClick={() => setSetupData(null)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Cancel
            </button>
          </div>
          {enableMutation.isError && (
            <p className="text-sm text-red-600">❌ Invalid code — check your app and try again</p>
          )}
        </div>
      )}

      {/* Disable flow */}
      {status?.isEnabled && !showDisable && (
        <button
          onClick={() => setShowDisable(true)}
          className="text-sm text-red-600 hover:text-red-700 hover:underline"
        >
          Disable Two-Factor Authentication
        </button>
      )}

      {showDisable && (
        <div className="border border-red-200 bg-red-50 rounded-xl p-5 space-y-3">
          <p className="text-sm font-semibold text-red-800">Disable 2FA</p>
          <p className="text-xs text-red-700">Enter your current TOTP code to confirm.</p>
          <div className="flex gap-3">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-32 px-3 py-2 border border-red-300 rounded-lg text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            <button
              onClick={() => disableMutation.mutate(disableCode)}
              disabled={disableCode.length !== 6 || disableMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {disableMutation.isPending ? 'Disabling...' : 'Confirm Disable'}
            </button>
            <button
              onClick={() => { setShowDisable(false); setDisableCode('') }}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Login Sessions Section ───────────────────────────────────────────────────

function SessionsSection() {
  const qc = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['login-sessions'],
    queryFn: authApi.getSessions,
  })

  const invalidateMutation = useMutation({
    mutationFn: (id: string) => authApi.invalidateSession(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['login-sessions'] })
      toast.success('Session revoked')
    },
    onError: () => toast.error('Failed to revoke session'),
  })

  if (isLoading) {
    return <div className="text-sm text-gray-400 py-4">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📋</div>
        <p className="text-sm">No login sessions recorded</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm ${
            session.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">
              {session.device === 'Mobile' ? '📱' : session.device === 'Tablet' ? '💻' : '🖥️'}
            </span>
            <div className="min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {session.browser ?? 'Unknown'} on {session.device ?? 'Unknown'}
              </p>
              <p className="text-xs text-gray-400">
                {session.ipAddress} · {new Date(session.loggedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {session.isActive && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
            {session.isActive && (
              <button
                onClick={() => invalidateMutation.mutate(session.id)}
                disabled={invalidateMutation.isPending}
                className="text-xs text-red-500 hover:text-red-700 hover:underline"
                title="Revoke this session"
              >
                Revoke
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Change Password Section ──────────────────────────────────────────────────

function ChangePasswordSection() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters'); return }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      setForm({ currentPassword: '', newPassword: '', confirm: '' })
      toast.success('Password changed successfully')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {(['currentPassword', 'newPassword', 'confirm'] as const).map((field) => (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field === 'currentPassword' ? 'Current Password'
              : field === 'newPassword' ? 'New Password'
              : 'Confirm New Password'}
          </label>
          <input
            type="password"
            value={form[field]}
            onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
            required
            placeholder={field === 'newPassword' ? 'Min 8 characters' : ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {loading ? 'Saving...' : 'Change Password'}
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'totp' | 'sessions' | 'password'

export default function SecuritySettings() {
  const [activeTab, setActiveTab] = useState<Tab>('totp')

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'totp',     label: 'Two-Factor Auth',  icon: '🛡️' },
    { key: 'sessions', label: 'Login Sessions',   icon: '📋' },
    { key: 'password', label: 'Change Password',  icon: '🔒' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account security and active sessions</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'totp'     && <TotpSection />}
        {activeTab === 'sessions' && <SessionsSection />}
        {activeTab === 'password' && <ChangePasswordSection />}
      </div>
    </div>
  )
}