import React from 'react'

interface Step {
  label: string
  icon: string
}

interface Props {
  steps: Step[]
  currentStep: number // 1-indexed
}

const STEPS: Step[] = [
  { label: 'Society Profile', icon: '🏢' },
  { label: 'Admin Account', icon: '👤' },
  { label: 'Billing Config', icon: '💰' },
  { label: 'Block Structure', icon: '🏗️' },
  { label: 'Properties', icon: '🏠' },
  { label: 'Residents', icon: '👥' },
  { label: 'Review & Activate', icon: '🚀' },
]

export { STEPS }

/**
 * 7-step progress pill bar.
 * completed = green check, active = blue ring, pending = gray
 */
export default function StepIndicator({ steps, currentStep }: Props) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {steps.map((step, idx) => {
        const stepNum = idx + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isPending = stepNum > currentStep

        return (
          <React.Fragment key={stepNum}>
            {/* Step pill */}
            <div className="flex flex-col items-center min-w-0 flex-shrink-0">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100' : ''}
                  ${isPending ? 'bg-white border-gray-300 text-gray-400' : ''}
                `}
              >
                {isCompleted ? '✓' : stepNum}
              </div>
              <span
                className={`text-xs mt-1 text-center whitespace-nowrap hidden sm:block
                  ${isCompleted ? 'text-green-600 font-medium' : ''}
                  ${isActive ? 'text-blue-600 font-semibold' : ''}
                  ${isPending ? 'text-gray-400' : ''}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 min-w-3 transition-all
                  ${stepNum < currentStep ? 'bg-green-400' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}