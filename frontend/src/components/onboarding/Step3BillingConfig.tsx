import React, { useState } from 'react'
import { Step3Payload } from '../../api/onboarding'

interface Props {
  initialData?: Partial<Step3Payload>
  onNext: (data: Step3Payload) => Promise<void>
  loading: boolean
  error: string
}

const DEFAULTS: Step3Payload = {
  ratePerSqft: 1.0,
  fixedCharge: 700,
  lateFeeGraceDays: 10,
  lateFeePerDay: 10,
  billVacantFlats: false,
}

export default function Step3BillingConfig({ initialData, onNext, loading, error }: Props) {
  const [form, setForm] = useState<Step3Payload>({ ...DEFAULTS, ...initialData })

  // Live preview calculation (example: 1000 sqft flat)
  const EXAMPLE_SQFT = 1000
  const previewAmount = form.ratePerSqft * EXAMPLE_SQFT + form.fixedCharge
  const lateFeeExample = form.lateFeePerDay * 30 // 30 days late

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev: Step3Payload) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onNext(form)
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">💰 Step 3 — Billing Configuration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Configure how maintenance bills are calculated. You can change these anytime from Settings.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Rate per Sq.Ft. (₹)</label>
            <input name="ratePerSqft" type="number" step="0.01" min="0" max="1000"
              value={form.ratePerSqft} onChange={handleChange} className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">Multiplied by flat area in sq.ft.</p>
          </div>

          <div>
            <label className={labelCls}>Fixed Charge (₹)</label>
            <input name="fixedCharge" type="number" step="0.01" min="0"
              value={form.fixedCharge} onChange={handleChange} className={inputCls} />
            <p className="text-xs text-gray-400 mt-1">Added to every bill regardless of area</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Late Fee Grace (days)</label>
              <input name="lateFeeGraceDays" type="number" step="1" min="0" max="90"
                value={form.lateFeeGraceDays} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Late Fee per Day (₹)</label>
              <input name="lateFeePerDay" type="number" step="0.01" min="0"
                value={form.lateFeePerDay} onChange={handleChange} className={inputCls} />
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input type="checkbox" name="billVacantFlats" checked={form.billVacantFlats}
              onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
            <div>
              <span className="text-sm font-medium text-gray-700">Bill Vacant Flats</span>
              <p className="text-xs text-gray-400">Generate maintenance bills even for unoccupied flats</p>
            </div>
          </label>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </form>

        {/* Live Preview */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <h3 className="font-semibold text-blue-800 mb-4">📊 Live Preview</h3>
          <p className="text-xs text-gray-500 mb-3">Example: {EXAMPLE_SQFT.toLocaleString()} sq.ft. flat</p>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>{EXAMPLE_SQFT} sqft × ₹{form.ratePerSqft}/sqft</span>
              <span className="font-medium">₹{(form.ratePerSqft * EXAMPLE_SQFT).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Fixed charge</span>
              <span className="font-medium">₹{form.fixedCharge.toFixed(2)}</span>
            </div>
            <div className="border-t border-blue-200 pt-2 flex justify-between text-blue-800 font-bold">
              <span>Monthly Bill</span>
              <span>₹{previewAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-blue-200 space-y-1 text-sm text-gray-600">
            <p>Grace period: <strong>{form.lateFeeGraceDays} days</strong></p>
            <p>After grace, late fee: <strong>₹{form.lateFeePerDay}/day</strong></p>
            <p className="text-xs text-gray-400 mt-2">
              Example: 30 days late = ₹{((30 - form.lateFeeGraceDays) > 0
                ? (30 - form.lateFeeGraceDays) * form.lateFeePerDay
                : 0).toFixed(2)} in late fees
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}