import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { onboardingApi, SocietyLookupResult } from '../api/onboarding'

export default function FindAccountPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SocietyLookupResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q.length < 2) {
      setError('Please enter at least 2 characters to search')
      return
    }
    setError('')
    setLoading(true)
    setSearched(false)
    try {
      const { results: res } = await onboardingApi.findAccount(q)
      setResults(res)
      setSearched(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Search failed — please try again')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-lg p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🔍</div>
            <h1 className="text-2xl font-bold text-gray-900">Find Your Society</h1>
            <p className="text-sm text-gray-500 mt-1">
              Search by society name, registered email, or phone number
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                placeholder="Society name, email or phone…"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={loading || query.trim().length < 2}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? '…' : 'Search'}
              </button>
            </div>

            <p className="text-xs text-gray-400">
              💡 Tip: Enter the exact registered email to get the most accurate result
            </p>
          </form>

          {/* Results */}
          {searched && results !== null && (
            <div className="mt-6">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🏚️</div>
                  <p className="text-gray-600 font-medium">No societies found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try a different name, email, or phone number
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {results.length} {results.length === 1 ? 'society' : 'societies'} found
                  </p>
                  {results.map((society) => (
                    <div
                      key={society.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{society.name}</h3>
                          {(society.city || society.state) && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              📍 {[society.city, society.state].filter(Boolean).join(', ')}
                            </p>
                          )}
                          {society.societyUrl && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              🔗 {society.societyUrl}
                            </p>
                          )}
                        </div>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          society.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {society.status === 'active' ? '✓ Active' : '⚙ Setup'}
                        </span>
                      </div>

                      {/* Account Number */}
                      <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500 font-medium">Account No.</span>
                        <code className="flex-1 text-sm font-mono font-semibold text-gray-800 tracking-wider">
                          {society.accountNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopy(society.accountNumber)}
                          title="Copy account number"
                          className="text-gray-400 hover:text-blue-600 transition-colors text-base"
                        >
                          📋
                        </button>
                      </div>

                      <p className="text-xs text-amber-600 mt-2">
                        ⚠️ Account number is partially hidden. Contact your society admin for the full number.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer links */}
          <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-blue-600 hover:underline font-medium"
            >
              ← Back to Sign In
            </Link>
            <p className="text-xs text-gray-400 text-center">
              Don't see your society?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Register a new society →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}