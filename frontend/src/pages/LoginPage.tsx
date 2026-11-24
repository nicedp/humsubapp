import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/auth'

type Step = 'credentials' | 'totp'
type LoginMode = 'standard' | 'admin-email'

const REMEMBER_ME_KEY = 'rememberMe_username'
const REMEMBER_ACCOUNT_KEY = 'rememberMe_accountNumber'

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('credentials')
  const [loginMode, setLoginMode] = useState<LoginMode>('standard')

  // Standard mode fields
  const [accountNumber, setAccountNumber] = useState(() => localStorage.getItem(REMEMBER_ACCOUNT_KEY) ?? '')
  const [username, setUsername] = useState(() => localStorage.getItem(REMEMBER_ME_KEY) ?? '')

  // Admin email mode field
  const [identifier, setIdentifier] = useState('')

  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem(REMEMBER_ME_KEY))
  const [totpCode, setTotpCode] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (mode: LoginMode) => {
    setLoginMode(mode)
    setError('')
    setPassword('')
  }

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'owner' || user.role === 'tenant') navigate('/resident/dashboard', { replace: true })
      else if (user.role === 'security') navigate('/guard/visitor-entry', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const redirectByRole = (role: string) => {
    if (role === 'admin') navigate('/admin/dashboard')
    else if (role === 'owner' || role === 'tenant') navigate('/resident/dashboard')
    else if (role === 'security') navigate('/guard/visitor-entry')
  }

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = loginMode === 'admin-email'
        ? { identifier: identifier.trim(), password, rememberMe }
        : { accountNumber: accountNumber.trim(), username, password, rememberMe }
      const res = await authApi.login(payload)
      if ('step' in res && res.step === 'totp_required') {
        // 2FA required — show TOTP input (rememberMe preference is kept in state)
        setTempToken(res.tempToken)
        setStep('totp')
      } else if ('token' in res && res.token && res.user) {
        // Persist / clear the remembered account number + username (standard mode only)
        if (loginMode === 'standard') {
          if (rememberMe) {
            localStorage.setItem(REMEMBER_ACCOUNT_KEY, accountNumber.trim())
            localStorage.setItem(REMEMBER_ME_KEY, username)
          } else {
            localStorage.removeItem(REMEMBER_ACCOUNT_KEY)
            localStorage.removeItem(REMEMBER_ME_KEY)
          }
        }
        login(res.token, res.user, rememberMe)
        redirectByRole(res.user.role)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid account number, username, or password')
    } finally {
      setLoading(false)
    }
  }

  const handleTotpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.verifyTotpLogin(tempToken, totpCode, rememberMe)
      // Persist / clear the remembered username (same as credentials path)
      if (rememberMe) {
        localStorage.setItem(REMEMBER_ME_KEY, username)
      } else {
        localStorage.removeItem(REMEMBER_ME_KEY)
      }
      login(res.token, res.user, rememberMe)
      redirectByRole(res.user.role)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Invalid code — check your authenticator app')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* ── Credentials Step ── */}
          {step === 'credentials' && (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🏘️</div>
                <h1 className="text-2xl font-bold text-gray-900">Society Portal</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {loginMode === 'admin-email' ? 'Admin sign in with registration details' : 'Sign in to your account'}
                </p>
              </div>

              <form onSubmit={handleCredentials} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {loginMode === 'standard' ? (
                  <>
                    <div>
                      <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        id="accountNumber"
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        required
                        autoFocus
                        placeholder="Enter Society Account Number"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="Enter your username"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      autoFocus
                      placeholder="Enter Registered Email Address"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <p className="text-xs text-gray-400 text-center">
                  {loginMode === 'standard'
                    ? 'Contact your society admin to get your account number and username'
                    : '⚠️ This login is for society administrators only'}
                </p>
                <div className="text-center">
                  {loginMode === 'standard' ? (
                    <button
                      type="button"
                      onClick={() => switchMode('admin-email')}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Login as Admin User →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode('standard')}
                      className="text-xs text-gray-500 hover:underline"
                    >
                      ← Use account number instead
                    </button>
                  )}
                </div>
                {loginMode === 'standard' && (
                  <div className="text-center">
                    <Link
                      to="/find-account"
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      🔍 Don't know your account number? Find it here →
                    </Link>
                  </div>
                )}
                <p className="text-sm text-center text-gray-500">
                  New society?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline font-medium">
                    Register your society →
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* ── TOTP Step ── */}
          {step === 'totp' && (
            <>
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🛡️</div>
                <h1 className="text-2xl font-bold text-gray-900">Two-Factor Auth</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <form onSubmit={handleTotpVerify} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9A-Fa-f-]/g, ''))}
                    autoFocus
                    placeholder="000000"
                    className="w-48 px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Or enter a backup code in the format <code className="bg-gray-100 px-1 rounded">XXXX-XXXX</code>
                </p>

                <button
                  type="submit"
                  disabled={loading || totpCode.length < 6}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <button
                  onClick={() => { setStep('credentials'); setError(''); setTotpCode('') }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Use different account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}