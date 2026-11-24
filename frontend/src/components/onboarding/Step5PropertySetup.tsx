import React from 'react'

interface Props {
  onNext: () => void
  onSkip: () => void
}

export default function Step5PropertySetup({ onNext, onSkip }: Props) {
  function handleBulkSetup() {
    window.open('/admin/bulk-setup', '_blank')
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🏢 Step 5 — Property Setup</h2>
        <p className="text-sm text-gray-500 mt-1">
          Add your flats, row houses, and other units. You can do this now using the Bulk Setup
          wizard, or come back later from the Properties page.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Bulk Setup Option */}
        <div className="border-2 border-blue-200 rounded-xl p-6 bg-blue-50 hover:border-blue-400 transition-colors">
          <div className="text-3xl mb-3">🏗️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Set up properties now</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use our guided Bulk Setup wizard to add all your floors, blocks, and units in minutes.
            Opens in a new tab — come back here when done.
          </p>
          <button
            type="button"
            onClick={handleBulkSetup}
            className="w-full py-2 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Bulk Setup Wizard ↗
          </button>
          <p className="text-xs text-blue-600 mt-3 text-center">
            After completing bulk setup, click "Continue" below
          </p>
        </div>

        {/* Skip Option */}
        <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50 hover:border-gray-300 transition-colors">
          <div className="text-3xl mb-3">⏭️</div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">Skip for now</h3>
          <p className="text-sm text-gray-600 mb-4">
            You can add properties later from the admin panel under{' '}
            <span className="font-medium text-gray-800">Properties → Bulk Setup</span>.
            Residents can only be added after properties are created.
          </p>
          <button
            type="button"
            onClick={onSkip}
            className="w-full py-2 px-4 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Skip this step
          </button>
        </div>
      </div>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-lg">💡</span>
        <div>
          <p className="text-sm font-medium text-amber-900">Pro tip</p>
          <p className="text-sm text-amber-700">
            You added blocks in the previous step. Use the Bulk Setup wizard to populate those
            blocks with flats, specifying floor counts and unit types for each block.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <div />
        <button
          type="button"
          onClick={onNext}
          className="py-2.5 px-8 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}