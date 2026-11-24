import React, { useState } from 'react'
import { Step2Payload } from '../../api/onboarding'

interface Props {
  onNext: (data: Step2Payload) => Promise<void>
  loading: boolean
  error: string
}

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const levels: Array<{ label: string; color: string }> = [
    { label: 'Too short', color: 'bg-gray-300' },
    { label: 'Weak', color: 'bg-red-400' },
    { label: 'Fair', color: 'bg-orange-400' },
    { label: 'Good', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-green-500' },
  ]
  return { level: score, ...levels[score] }
}

export default function Step2AdminAccount({ onNext, loading, error }: Props) {
  const [form, setForm] = useState<Step2Payload>({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
  })

  const strength = getPasswordStrength(form.password)
  const passwordsMatch = form.password === form.confirmPassword && form.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: Step2Payload) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordsMatch) return
    await onNext(form)
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">👤 Step 2 — Admin Account</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create the first admin account. You'll use these credentials to log in.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
          <input name="fullName" type="text" required value={form.fullName}
            onChange={handleChange} placeholder="Society Admin Name" className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>
            Username <span className="text-red-500">*</span>
            <span className="text-gray-400 font-normal ml-1">(letters, numbers, underscores only)</span>
          </label>
          <input name="username" type="text" required value={form.username}
            onChange={handleChange} placeholder="admin" className={inputCls}
            pattern="[a-zA-Z0-9_]+" title="Only letters, numbers, and underscores" />
        </div>

        <div>
          <label className={labelCls}>Password <span className="text-red-500">*</span></label>
          <input name="password" type="password" required value={form.password}
            onChange={handleChange} placeholder="Min 8 chars, 1 uppercase, 1 number" className={inputCls} />
          {form.password && (
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n}
                    className={`h-1.5 flex-1 rounded-full transition-all ${strength.level >= n ? strength.color : 'bg-gray-200'}`}
                  />
                ))}
              </div>
              <p className={`text-xs mt-1 ${strength.level >= 3 ? 'text-green-600' : strength.level >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                {strength.label}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Confirm Password <span className="text-red-500">*</span></label>
          <input name="confirmPassword" type="password" required value={form.confirmPassword}
            onChange={handleChange} placeholder="Re-enter password" className={inputCls} />
          {form.confirmPassword && (
            <p className={`text-xs mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">🔐 This is a one-time setup</p>
          <p>Save your credentials securely. You can change the password from your profile settings later.</p>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !form.username || !form.fullName || !passwordsMatch || form.password.length < 8}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue →'}
          </button>
        </div>
      </form>
    </div>
  )
}