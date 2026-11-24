import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { visitorsApi } from '../../api/visitors'
import { flatsApi } from '../../api/flats'
import { Visitor } from '../../types'
import { format, differenceInMinutes, isToday } from 'date-fns'

const emptyForm = { visitorName: '', phone: '', flatId: '', purpose: '', vehicleNumber: '' }

function durationSince(entryTime: string): string {
  const mins = differenceInMinutes(new Date(), new Date(entryTime))
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function purposeIcon(purpose: string): string {
  const p = purpose.toLowerCase()
  if (p.includes('deliver')) return '📦'
  if (p.includes('guest') || p.includes('visit')) return '👋'
  if (p.includes('maint') || p.includes('repair') || p.includes('plumb') || p.includes('electric')) return '🔧'
  if (p.includes('cab') || p.includes('taxi') || p.includes('uber') || p.includes('ola')) return '🚕'
  if (p.includes('doctor') || p.includes('maid') || p.includes('helper')) return '🧹'
  if (p.includes('food') || p.includes('zomato') || p.includes('swiggy')) return '🍔'
  return '🚶'
}

function StatCard({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div className={`rounded-xl p-4 text-white ${color}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-90">{label}</p>
    </div>
  )
}

export default function GuardDashboard() {
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState('')
  const [flatSearch, setFlatSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const { data: allVisitorsData, isLoading: insideLoading } = useQuery({
    queryKey: ['visitors-all'],
    queryFn: () => visitorsApi.list({ limit: 200 }),
    refetchInterval: 30_000,
  })

  const { data: flatsData } = useQuery({
    queryKey: ['flats'],
    queryFn: () => flatsApi.list({ limit: 100 }),
  })

  const logEntryMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => visitorsApi.logEntry(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors-all'] })
      setForm(emptyForm)
      setFlatSearch('')
      setFormError('')
      toast.success('Visitor entry logged ✓')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error logging entry'
      setFormError(msg)
      toast.error(msg)
    },
  })

  const logExitMutation = useMutation({
    mutationFn: (id: string) => visitorsApi.logExit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors-all'] })
      toast.success('Exit logged')
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error logging exit'
      toast.error(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.visitorName.trim()) { setFormError('Visitor name is required'); return }
    if (!form.flatId) { setFormError('Please select a flat from the dropdown'); return }
    if (!form.purpose.trim()) { setFormError('Purpose is required'); return }
    setFormError('')
    logEntryMutation.mutate(form)
  }

  const allVisitors = allVisitorsData?.data ?? []
  const todayAll = allVisitors.filter((v: Visitor) => isToday(new Date(v.entryTime)))
  const inside = todayAll.filter((v: Visitor) => !v.exitTime)
  const todayExited = todayAll.filter((v: Visitor) => !!v.exitTime)

  const flats = flatsData?.data ?? []
  const filteredFlats = flatSearch
    ? flats.filter((f) => f.flatNumber.toLowerCase().includes(flatSearch.toLowerCase()))
    : flats

  const selectFlat = (id: string, number: string) => {
    setForm({ ...form, flatId: id })
    setFlatSearch(number)
    setShowDropdown(false)
  }

  const recentTimeline = [...todayAll]
    .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime())
    .slice(0, 20)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Guard Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, dd MMMM yyyy')} · Auto-refreshes every 30s</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard value={inside.length} label="Currently Inside" color="bg-green-600" />
        <StatCard value={todayAll.length} label="Total Today" color="bg-blue-600" />
        <StatCard value={todayExited.length} label="Exited Today" color="bg-gray-500" />
        <StatCard
          value={todayAll.length > 0 ? `${Math.round((todayExited.length / todayAll.length) * 100)}%` : '—'}
          label="Exit Rate"
          color="bg-purple-600"
        />
      </div>

      {/* Quick Entry Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">➕</span>
          <h2 className="font-semibold text-gray-900">Log New Entry</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-lg">{formError}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name *</label>
              <input
                required
                value={form.visitorName}
                onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Mobile number (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Flat search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Flat *</label>
              <input
                value={flatSearch}
                onChange={(e) => {
                  setFlatSearch(e.target.value)
                  setShowDropdown(true)
                  setForm({ ...form, flatId: '' })
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="Search flat number..."
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && filteredFlats.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredFlats.slice(0, 20).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onMouseDown={() => selectFlat(f.id, f.flatNumber)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between"
                    >
                      <span className="font-medium">{f.flatNumber}</span>
                      <span className="text-gray-400 text-xs">Floor {f.floor}</span>
                    </button>
                  ))}
                </div>
              )}
              {!form.flatId && flatSearch && (
                <p className="text-xs text-amber-600 mt-1">Select a flat from the list above</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
              <input
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                placeholder="e.g. Delivery, Guest, Maintenance"
                list="purpose-suggestions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="purpose-suggestions">
                <option value="Guest Visit" />
                <option value="Delivery" />
                <option value="Maintenance" />
                <option value="Cab / Taxi" />
                <option value="Food Delivery" />
                <option value="Domestic Help" />
                <option value="Plumber" />
                <option value="Electrician" />
              </datalist>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
              <input
                value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                placeholder="e.g. MH12AB1234 (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={logEntryMutation.isPending || !form.flatId}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {logEntryMutation.isPending ? '⏳ Logging...' : '✓ Log Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Two-column: currently inside + today's timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Currently Inside */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-gray-900">Currently Inside</h2>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${inside.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {inside.length} {inside.length === 1 ? 'visitor' : 'visitors'}
            </span>
          </div>

          {insideLoading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          ) : inside.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
              <span className="text-4xl mb-3">🚪</span>
              <p className="font-medium text-gray-700">No visitors currently inside</p>
              <p className="text-sm text-gray-400 mt-1">The premises are clear right now</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-80 divide-y divide-gray-50">
              {inside.map((v: Visitor) => (
                <div key={v.id} className="px-5 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-base flex-shrink-0">
                    {purposeIcon(v.purpose)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{v.visitorName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      Flat {v.flatNumber ?? v.flatId} · {v.purpose}
                    </p>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      Inside {durationSince(v.entryTime)}
                    </p>
                  </div>
                  <button
                    onClick={() => logExitMutation.mutate(v.id)}
                    disabled={logExitMutation.isPending}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 rounded-lg disabled:opacity-50 transition-colors whitespace-nowrap"
                  >
                    Log Exit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <h2 className="font-semibold text-gray-900">Today's Activity</h2>
            <span className="text-xs font-medium text-gray-500">{todayAll.length} entries</span>
          </div>

          {todayAll.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
              <span className="text-4xl mb-3">📋</span>
              <p className="font-medium text-gray-700">No entries today</p>
              <p className="text-sm text-gray-400 mt-1">Log a visitor to see the activity timeline</p>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-80 px-5 py-4">
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
                <div className="space-y-4 pl-6">
                  {recentTimeline.map((v: Visitor) => (
                    <div key={v.id} className="relative">
                      {/* Timeline dot */}
                      <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 ${v.exitTime ? 'bg-gray-300 border-gray-300' : 'bg-green-400 border-green-400'}`} />
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{v.visitorName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {purposeIcon(v.purpose)} {v.purpose} · Flat {v.flatNumber ?? v.flatId}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            In: {format(new Date(v.entryTime), 'h:mm a')}
                            {v.exitTime && ` · Out: ${format(new Date(v.exitTime), 'h:mm a')}`}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${v.exitTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                          {v.exitTime ? 'Left' : 'Inside'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}