import React, { useState } from 'react'
import { Step1Payload } from '../../api/onboarding'
import { COUNTRIES, STATES_BY_COUNTRY } from '../../constants/geo'

interface Props {
  initialData: Partial<Step1Payload>
  onNext: (data: Step1Payload) => Promise<void>
  loading: boolean
  error: string
}

interface Step1Form extends Step1Payload {
  country: string
}

export default function Step1SocietyProfile({ initialData, onNext, loading, error }: Props) {
  const [form, setForm] = useState<Step1Form>({
    name: initialData.name ?? '',
    address: initialData.address ?? '',
    city: initialData.city ?? '',
    state: initialData.state ?? '',
    pincode: initialData.pincode ?? '',
    registrationNumber: initialData.registrationNumber ?? '',
    contactEmail: initialData.contactEmail ?? '',
    contactPhone: initialData.contactPhone ?? '',
    country: 'IN',
  })

  const stateOptions = STATES_BY_COUNTRY[form.country] ?? []

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === 'country') {
      setForm((prev: Step1Form) => ({ ...prev, country: value, state: '' }))
    } else {
      setForm((prev: Step1Form) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onNext({
      ...form,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      pincode: form.pincode || undefined,
      registrationNumber: form.registrationNumber || undefined,
      contactEmail: form.contactEmail || undefined,
      contactPhone: form.contactPhone || undefined,
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">🏢 Step 1 — Society Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Tell us about your residential society</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Address
          </label>
          <input
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            placeholder="123 Society Road, Area Name"
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
        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              name="pincode"
              type="text"
              value={form.pincode}
              onChange={handleChange}
              placeholder="400001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              name="registrationNumber"
              type="text"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="MH/SOC/2024/001"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              placeholder="admin@society.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
            <input
              name="contactPhone"
              type="tel"
              value={form.contactPhone}
              onChange={handleChange}
              placeholder="+91-9000000000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || !form.name.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-8 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Saving...' : 'Save & Continue →'}
          </button>
        </div>
      </form>
    </div>
  )
}