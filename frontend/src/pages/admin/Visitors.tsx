import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { visitorsApi } from '../../api/visitors'
import { format, differenceInMinutes } from 'date-fns'
import Pagination from '../../components/Pagination'
import {
  VISITOR_TYPE_LABELS,
  VISITOR_TYPE_ICONS,
  VISITOR_TYPE_COLORS,
  VISITOR_TYPES,
} from '../../constants/labels'
import { Visitor } from '../../types'

const PAGE_SIZE = 20

function durationStr(entry: string, exit?: string | null): string {
  const mins = differenceInMinutes(exit ? new Date(exit) : new Date(), new Date(entry))
  if (mins < 60) return `${mins}m`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

export default function AdminVisitors() {
  const qc = useQueryClient()
  const [search,      setSearch]      = useState('')
  const [typeFilter,  setTypeFilter]  = useState('')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')
  const [hasExit,     setHasExit]     = useState<'true' | 'false' | ''>('')
  const [skip,        setSkip]        = useState(0)
  const [selected,    setSelected]    = useState<Set<string>>(new Set())

  const queryParams = {
    skip,
    limit:       PAGE_SIZE,
    ...(search     && { search }),
    ...(typeFilter && { visitorType: typeFilter }),
    ...(dateFrom   && { dateFrom }),
    ...(dateTo     && { dateTo }),
    ...(hasExit    && { hasExit: hasExit as 'true' | 'false' }),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['visitors', 'all', queryParams],
    queryFn:  () => visitorsApi.list(queryParams),
  })

  const { data: statsData } = useQuery({
    queryKey: ['visitor-stats', dateFrom, dateTo],
    queryFn:  () => visitorsApi.getStats({
      ...(dateFrom && { dateFrom }),
      ...(dateTo   && { dateTo }),
    }),
  })

  const exitMutation = useMutation({
    mutationFn: (id: string) => visitorsApi.logExit(id),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['visitors'] }); toast.success('Exit logged') },
    onError:    () => toast.error('Failed to log exit'),
  })

  const bulkExitMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) await visitorsApi.logExit(id)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['visitors'] })
      setSelected(new Set())
      toast.success('Exit logged for selected visitors')
    },
    onError: () => toast.error('Some exits failed'),
  })

  const visitors   = data?.data ?? []
  const total      = data?.total ?? 0
  const byType     = statsData?.byType ?? {}
  const inside     = statsData?.totalInside ?? 0
  const hasFilters = !!search || !!typeFilter || !!dateFrom || !!dateTo || !!hasExit

  const resetFilters = () => {
    setSearch(''); setTypeFilter(''); setDateFrom('')
    setDateTo(''); setHasExit(''); setSkip(0); setSelected(new Set())
  }

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedInside = [...selected].filter((id) => {
    const v = visitors.find((x) => x.id === id)
    return v && !v.exitTime
  })

  const handleExport = async () => {
    try {
      await visitorsApi.exportCSV({
        ...(search     && { search }),
        ...(typeFilter && { visitorType: typeFilter }),
        ...(dateFrom   && { dateFrom }),
        ...(dateTo     && { dateTo }),
        ...(hasExit    && { hasExit: hasExit as 'true' | 'false' }),
      })
      toast.success('CSV downloaded')
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visitors</h1>
          <p className="text-sm text-gray-500 mt-1">{total} visitor logs</p>
        </div>
        <div className="flex gap-2">
          {selectedInside.length > 0 && (
            <button
              onClick={() => bulkExitMutation.mutate(selectedInside)}
              disabled={bulkExitMutation.isPending}
              className="px-4 py-2 text-sm font-medium bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 disabled:opacity-50"
            >
              Log Exit ({selectedInside.length})
            </button>
          )}
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100"
          >
            ⬇ Export CSV
          </button>
        </div>
      </div>

      {/* Stats KPI Strip */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        <div
          onClick={() => { setHasExit('false'); setSkip(0) }}
          className="flex-shrink-0 bg-green-50 border border-green-200 rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm"
        >
          <p className="text-xs text-green-600 font-medium">Inside Now</p>
          <p className="text-xl font-bold text-green-700">{inside}</p>
        </div>
        {VISITOR_TYPES.filter((t) => byType[t]).map((type) => (
          <div
            key={type}
            onClick={() => { setTypeFilter(typeFilter === type ? '' : type); setSkip(0) }}
            className={`flex-shrink-0 bg-white border rounded-xl px-4 py-3 cursor-pointer hover:shadow-sm transition-all ${
              typeFilter === type ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-100'
            }`}
          >
            <p className="text-xs text-gray-500 font-medium">
              {VISITOR_TYPE_ICONS[type]} {VISITOR_TYPE_LABELS[type]}
            </p>
            <p className="text-xl font-bold text-gray-800">{byType[type] ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search name, flat..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSkip(0) }}
          className="flex-1 min-w-[180px] max-w-xs px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Types</option>
          {VISITOR_TYPES.map((t) => (
            <option key={t} value={t}>{VISITOR_TYPE_ICONS[t]} {VISITOR_TYPE_LABELS[t]}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          title="To date"
        />
        <select
          value={hasExit}
          onChange={(e) => { setHasExit(e.target.value as 'true' | 'false' | ''); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="false">Inside Now</option>
          <option value="true">Left</option>
        </select>
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['', 'Visitor', 'Type', 'Flat', 'Notes', 'Vehicle', 'Entry', 'Duration', 'Status', ''].map((h) => (
                <th key={h} className="px-3 py-3 text-left font-medium text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(10)].map((__, j) => (
                  <td key={j} className="px-3 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['', 'Visitor', 'Type', 'Flat', 'Notes', 'Vehicle', 'Entry', 'Duration', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-3 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visitors.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">🚶</div>
                  <p className="text-gray-500 font-medium">
                    {hasFilters ? 'No visitors match your filters' : 'No visitor logs yet'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {hasFilters ? 'Try adjusting your filters' : 'Visitor logs appear here when guards log entries'}
                  </p>
                </td></tr>
              ) : visitors.map((v: Visitor) => (
                <tr key={v.id} className={`hover:bg-gray-50 transition-colors ${selected.has(v.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-3">
                    {!v.exitTime && (
                      <input
                        type="checkbox"
                        checked={selected.has(v.id)}
                        onChange={() => toggleSelect(v.id)}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
                  <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">{v.visitorName}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VISITOR_TYPE_COLORS[v.visitorType] ?? 'bg-gray-100 text-gray-600'}`}>
                      {VISITOR_TYPE_ICONS[v.visitorType]}{' '}
                      {VISITOR_TYPE_LABELS[v.visitorType] ?? v.visitorType}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-600">{v.flatNumber}</td>
                  <td className="px-3 py-3 text-gray-500 max-w-[120px] truncate">{v.purpose ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-500">{v.vehicleNumber ?? '—'}</td>
                  <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{format(new Date(v.entryTime), 'dd MMM, HH:mm')}</td>
                  <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{durationStr(v.entryTime, v.exitTime)}</td>
                  <td className="px-3 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.exitTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                      {v.exitTime ? 'Left' : 'Inside'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    {!v.exitTime && (
                      <button
                        onClick={() => exitMutation.mutate(v.id)}
                        disabled={exitMutation.isPending}
                        className="text-orange-600 hover:underline text-xs font-medium disabled:opacity-50"
                      >
                        Log Exit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />
    </div>
  )
}