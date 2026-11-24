import React, { useState } from 'react'
import { onboardingApi, OnboardingProgress } from '../../api/onboarding'
import { SocietyCardModal } from '../admin/SocietyCard'

interface Props {
  progress: OnboardingProgress
  onActivated: () => void
}

export default function Step7ReviewActivate({ progress, onActivated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activated, setActivated] = useState(false)
  const [showCard, setShowCard] = useState(false)

  const society = progress.society
  const session = progress.session

  const summaryItems = [
    {
      label: 'Society Name',
      value: society?.name || '—',
      icon: '🏛️',
      done: !!society?.name,
    },
    {
      label: 'City / State',
      value: society ? `${society.city ?? '?'}, ${society.state ?? '?'}` : '—',
      icon: '📍',
      done: !!(society?.city && society?.state),
    },
    {
      label: 'Admin Account',
      value: session?.step2Data?.username ? `@${session.step2Data.username}` : '—',
      icon: '👤',
      done: !!(session?.step2Data?.username),
    },
    {
      label: 'Billing Config',
      value: session?.step3Data
        ? `₹${session.step3Data.ratePerSqft}/sqft + ₹${session.step3Data.fixedCharge} fixed`
        : 'Default rates applied',
      icon: '💰',
      done: true,
    },
    {
      label: 'Block Structure',
      value: session?.step4Data?.blockIds?.length
        ? `${session.step4Data.blockIds.length} block(s) configured`
        : 'No blocks configured yet',
      icon: '🏗️',
      done: !!(session?.step4Data?.blockIds?.length),
    },
  ]

  async function handleActivate() {
    setLoading(true)
    setError('')
    try {
      await onboardingApi.activate()
      setActivated(true)
      setTimeout(() => {
        onActivated()
      }, 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Activation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (activated) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Society Activated!</h2>
        <p className="text-gray-600 mb-6">
          <strong>{society?.name}</strong> is now live. Redirecting to your dashboard...
        </p>
        <div className="flex justify-center gap-2 mb-8">
          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm animate-bounce"
              style={{ backgroundColor: color, animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🎯 Step 7 — Review & Activate</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review your setup summary below. Once activated, your society portal will go live and
          residents can start using it.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-3 mb-8">
        {summaryItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white"
          >
            <div className="text-2xl w-10 text-center">{item.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {item.label}
              </div>
              <div className="text-sm font-medium text-gray-800 mt-0.5">{item.value}</div>
            </div>
            <div className="flex-shrink-0">
              {item.done ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-bold">
                  ✓
                </span>
              ) : (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                  !
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Identity card CTA — shown when account number or societyUrl is available */}
      {(society?.accountNumber || society?.societyUrl) && (
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 mb-6">
          <div>
            <p className="text-sm font-semibold text-indigo-900">🪪 Society Identity Card</p>
            <p className="text-xs text-indigo-600 mt-0.5">
              View, copy & print your login credentials to share with members
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCard(true)}
            className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            View Card
          </button>
        </div>
      )}

      {/* Identity Card Modal */}
      {showCard && (
        <SocietyCardModal
          settings={{
            societyName: society?.name ?? undefined,
            accountNumber: society?.accountNumber ?? undefined,
            societyUrl: society?.societyUrl ?? undefined,
            address: society?.address ?? undefined,
            phone: society?.contactPhone ?? undefined,
            email: society?.contactEmail ?? undefined,
          }}
          onClose={() => setShowCard(false)}
        />
      )}

      {/* Notice about pending items */}
      {summaryItems.some((item) => !item.done) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="text-sm font-medium text-amber-900">Some items are incomplete</p>
            <p className="text-sm text-amber-700">
              You can still activate now and complete these later from the admin panel.
            </p>
          </div>
        </div>
      )}

      {/* What happens after activation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">🚀 What happens after activation</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li className="flex items-start gap-1.5">
            <span>•</span>
            <span>Your society portal goes live immediately</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span>
            <span>You will be logged in as the society admin</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span>
            <span>Generate maintenance bills, manage residents, and more</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span>•</span>
            <span>You can complete any skipped steps from the admin panel</span>
          </li>
        </ul>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Activate button */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">Ready when you are!</p>
        <button
          type="button"
          onClick={handleActivate}
          disabled={loading}
          className="py-3 px-10 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Activating...
            </>
          ) : (
            <span>🚀 Activate Society</span>
          )}
        </button>
      </div>
    </div>
  )
}