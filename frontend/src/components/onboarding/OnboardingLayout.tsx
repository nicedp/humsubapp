import React from 'react'

interface Props {
  children: React.ReactNode
  /** If provided, renders the step indicator at the top */
  stepIndicator?: React.ReactNode
}

/**
 * Full-screen onboarding layout — no sidebar/navbar.
 * Branded header + centered white card container.
 */
export default function OnboardingLayout({ children, stepIndicator }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Branded Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-3xl">🏘️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Society Portal</h1>
            <p className="text-xs text-gray-500">Society Setup Wizard</p>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      {stepIndicator && (
        <div className="max-w-4xl mx-auto px-6 pt-6">
          {stepIndicator}
        </div>
      )}

      {/* Content Area */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}