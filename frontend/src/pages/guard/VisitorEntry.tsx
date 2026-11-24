import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { visitorsApi } from '../../api/visitors'
import { flatsApi } from '../../api/flats'
import { Visitor } from '../../types'
import { VISITOR_TYPE_ICONS, VISITOR_TYPE_LABELS, VISITOR_TYPES } from '../../constants/labels'
import { format } from 'date-fns'

type FormState = {
  visitorName:   string
  phone:         string
  flatId:        string
  visitorType:   string
  purpose:       string
  vehicleNumber: string
}

const emptyForm: FormState = {
  visitorName:   '',
  phone:         '',
  flatId:        '',
  visitorType:   '',
  purpose:       '',
  vehicleNumber: '',
}

export default function GuardVisitorEntry() {
  const qc = useQueryClient()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [error, setError] = useState('')

  const { data: flatsData } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsApi.list({ limit: 200 }),
  })

  const { data: insideData, isLoading: insideLoading } = useQuery({
    queryKey: ['visitors-inside'],
    queryFn: () => visitorsApi.list({ hasExit: 'false', limit: 100 }),
    refetchInterval: 30000,
  })

  const logEntryMutation = useMutation({
    mutationFn: (p: FormState) => visitorsApi.logEntry({
      flatId:        p.flatId,
      visitorName:   p.visitorName,
      visitorType:   p.visitorType,
      phone:         p.phone || undefined,
      vehicleNumber: p.vehicleNumber || undefined,
      purpose:       p.purpose || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors-inside'] })
      setForm(emptyForm)
      setError('')
      toast.success('Visitor entry logged')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error logging entry'
      setError(msg)
      toast.error(msg)
    },
  })

  const logExitMutation = useMutation({
    mutationFn: (id: string) => visitorsApi.logExit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors-inside'] })
      toast.success('Exit logged')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error logging exit'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.visitorName.trim()) { setError('Visitor name is required'); return }
    if (!form.flatId)             { setError('Flat number is required');   return }
    if (!form.visitorType)        { setError('Please select visitor type'); return }
    setError('')
    logEntryMutation.mutate(form)
  }

  const flats  = flatsData?.data ?? []
  const inside = insideData?.data ?? []

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visitor Entry</h1>
        <p className="text-sm text-gray-500 mt-1">Log visitor entry and exit</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* Entry Form */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Log Entry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
              <input
                required
                value={form.visitorName}
                onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Mobile number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Flat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Flat *</label>
            <select
              required
              value={form.flatId}
              onChange={(e) => setForm({ ...form, flatId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Select flat...</option>
              {flats.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flatNumber}{f.floor != null ? ` — Floor ${f.floor}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Visitor Type Chip Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Type *</label>
            <div className="flex flex-wrap gap-2">
              {VISITOR_TYPES.map((type) => {
                const isSelected = form.visitorType === type
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, visitorType: type })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <span>{VISITOR_TYPE_ICONS[type]}</span>
                    <span>{VISITOR_TYPE_LABELS[type]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notes + Vehicle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="Additional info..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number (optional)</label>
              <input
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                placeholder="e.g. MH12AB1234"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={logEntryMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:bg-blue-400"
            >
              {logEntryMutation.isPending ? 'Logging...' : 'Log Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Currently Inside */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Currently Inside</h2>
          <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {inside.length} visitors
          </span>
        </div>
        {insideLoading ? (
          <div className="divide-y divide-gray-50 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : inside.length === 0 ? (
          <div className="p-6 text-center text-gray-400 text-sm">No visitors currently inside</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {inside.map((v: Visitor) => (
              <div key={v.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {VISITOR_TYPE_ICONS[v.visitorType] ?? '🚶'} {v.visitorName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Flat {v.flatNumber ?? v.flatId}
                    {' · '}{VISITOR_TYPE_LABELS[v.visitorType] ?? v.visitorType}
                    {v.purpose ? ` · ${v.purpose}` : ''}
                    {' · '}Entered {format(new Date(v.entryTime), 'h:mm a')}
                  </p>
                  {v.vehicleNumber && (
                    <p className="text-xs text-gray-400">{v.vehicleNumber}</p>
                  )}
                </div>
                <button
                  onClick={() => logExitMutation.mutate(v.id)}
                  disabled={logExitMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-lg whitespace-nowrap disabled:opacity-50"
                >
                  Log Exit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}