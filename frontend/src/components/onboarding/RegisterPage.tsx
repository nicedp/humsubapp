import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { onboardingApi } from '../../api/onboarding'
import { COUNTRIES, STATES_BY_COUNTRY } from '../../constants/geo'

/** Mirror of backend generateSocietyUrl — slugify without uniqueness suffix */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 75)
}

const PORTAL_DOMAIN = 'societyportal.app'

interface RegisterForm {
  name: string
  contactEmail: string
  contactPhone: string
  city: string
  state: string
  country: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    country: 'IN',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [setupUrl, setSetupUrl] = useState('')

  // Editable society URL slug — auto-synced from name until user manually edits it
  const [slugValue, setSlugValue] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  // Availability check state
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [copied, setCopied] = useState(false)
  const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const autoSlug = useMemo(() => toSlug(form.name), [form.name])

  // Keep slug in sync with name if user hasn't manually edited it
  useEffect(() => {
    if (!slugEdited) {
      setSlugValue(autoSlug)
    }
  }, [autoSlug, slugEdited])

  // Debounced availability check — fires 600ms after slug stops changing
  useEffect(() => {
    if (checkTimerRef.current) clearTimeout(checkTimerRef.current)
    if (!slugValue || slugValue.length < 2) {
      setSlugAvailable(null)
      setSlugChecking(false)
      return
    }
    setSlugChecking(true)
    setSlugAvailable(null)
    checkTimerRef.current = setTimeout(async () => {
      try {
        const res = await onboardingApi.checkUrl(slugValue)
        setSlugAvailable(res.available)
      } catch {
        setSlugAvailable(null)
      } finally {
        setSlugChecking(false)
      }
    }, 600)
    return () => { if (checkTimerRef.current) clearTimeout(checkTimerRef.current) }
  }, [slugValue])

  const previewUrl = slugValue ? `https://${slugValue}.${PORTAL_DOMAIN}` : null

  const handleCopyUrl = () => {
    if (!previewUrl) return
    navigator.clipboard.writeText(previewUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const stateOptions = STATES_BY_COUNTRY[form.country] ?? []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'country') {
      // Reset state when country changes
      setForm((prev) => ({ ...prev, country: value, state: '' }))
    } else {
      setForm((prev) => ({ ...prev, [name]: value }))
    }
  }

  /** Handle slug input — spaces become hyphens, strip invalid chars, lowercase */
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')        // spaces → hyphens
      .replace(/[^a-z0-9-]/g, '')  // strip anything else
      .replace(/-{2,}/g, '-')      // collapse multiple hyphens
      .slice(0, 75)
    setSlugValue(raw)
    setSlugEdited(true)
  }

  /** If user clears the slug field, reset to auto-sync mode */
  const handleSlugBlur = () => {
    if (!slugValue) {
      setSlugEdited(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await onboardingApi.register({
        name: form.name.trim(),
        contactEmail: form.contactEmail.trim(),
        contactPhone: form.contactPhone.trim(),
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        societyUrl: slugValue || undefined,
      })
      if (result.setupUrl) {
        // Dev mode: backend returned setup URL directly — navigate straight into the wizard
        const path = new URL(result.setupUrl).pathname
        navigate(path)
        return
      }
      setSetupUrl('')
      setDone(true)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📬</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            We've sent a setup link to <strong>{form.contactEmail}</strong>.<br />
            Click the link in the email to complete your society setup.<br />
            <span className="text-gray-400">The link expires in 48 hours.</span>
          </p>
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏘️</div>
            <h1 className="text-2xl font-bold text-gray-900">Register Your Society</h1>
            <p className="text-sm text-gray-500 mt-1">
              Start the onboarding wizard — takes only 5 minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Society Name <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Green Valley Residential Society"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Editable Portal URL slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Portal URL <span className="text-xs font-normal text-gray-400">(auto-generated, editable)</span>
              </label>
              <div className={`flex items-center rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden ${
                slugAvailable === true ? 'border-green-400' : slugAvailable === false ? 'border-red-400' : 'border-gray-300'
              }`}>
                <span className="px-3 py-2.5 bg-gray-50 border-r border-gray-200 text-xs text-gray-500 font-mono whitespace-nowrap flex-shrink-0">
                  https://
                </span>
                <input
                  type="text"
                  value={slugValue}
                  onChange={handleSlugChange}
                  onBlur={handleSlugBlur}
                  placeholder="your-society-slug"
                  className="flex-1 px-3 py-2.5 text-sm font-mono focus:outline-none min-w-0"
                />
                {/* Availability indicator */}
                {slugValue.length >= 2 && (
                  <span className="px-2 flex-shrink-0">
                    {slugChecking
                      ? <span className="text-gray-400 text-xs">⋯</span>
                      : slugAvailable === true
                        ? <span className="text-green-500 text-sm font-bold" title="Available">✓</span>
                        : slugAvailable === false
                          ? <span className="text-red-500 text-sm font-bold" title="Already taken">✕</span>
                          : null}
                  </span>
                )}
                <span className="px-3 py-2.5 bg-gray-50 border-l border-gray-200 text-xs text-gray-500 font-mono whitespace-nowrap flex-shrink-0">
                  .{PORTAL_DOMAIN}
                </span>
                {/* Copy full URL button */}
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    title="Copy full URL"
                    className="px-2.5 py-2.5 bg-gray-50 border-l border-gray-200 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition flex-shrink-0"
                  >
                    {copied ? <span className="text-green-500 text-xs font-medium">✓</span> : <span className="text-sm">📋</span>}
                  </button>
                )}
              </div>
              {/* Full URL preview */}
              {previewUrl && (
                <p className="mt-1 text-xs text-gray-500 font-mono break-all">
                  🔗 {previewUrl}
                </p>
              )}
              {/* Availability / hint text */}
              <p className={`mt-0.5 text-xs ${
                slugAvailable === true ? 'text-green-600' : slugAvailable === false ? 'text-red-500' : 'text-gray-400'
              }`}>
                {slugAvailable === true
                  ? '✓ This URL is available'
                  : slugAvailable === false
                    ? '✕ This URL is already taken — try a different name'
                    : 'Spaces automatically become hyphens. Only lowercase letters, numbers and hyphens allowed.'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                name="contactEmail"
                type="email"
                required
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="admin@yoursociety.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                name="contactPhone"
                type="tel"
                required
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="+91-9000000000"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City + State */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                {stateOptions.length > 0 ? (
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select state</option>
                    {stateOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="state"
                    type="text"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="State / Province"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Enter City Name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Registering...' : 'Register & Get Setup Link →'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}