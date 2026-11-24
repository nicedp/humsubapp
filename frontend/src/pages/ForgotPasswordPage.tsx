import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api/auth'

type Step = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setStep('sent')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === 'form' ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">🔑</div>
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your registered email to receive a reset link
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:underline">
                  ← Back to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Success */}
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                <p className="text-sm text-gray-500 mb-1">
                  If <span className="font-medium text-gray-700">{email}</span> is registered,
                  we've sent a password reset link.
                </p>
                <p className="text-xs text-gray-400 mt-3">
                  The link expires in 1 hour. Check your spam folder if you don't see it.
                </p>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => { setStep('form'); setEmail('') }}
                    className="w-full text-sm text-blue-600 hover:underline"
                  >
                    Try a different email
                  </button>
                  <Link to="/login" className="block text-sm text-gray-500 hover:underline">
                    ← Back to Login
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}