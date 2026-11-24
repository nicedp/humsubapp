import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { directoryApi } from '../../api/directory'
import { DirectoryEntry } from '../../types'

export default function ResidentDirectory() {
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['directory'],
    queryFn: () => directoryApi.list({ limit: 200 }),
  })

  const entries = (data?.data ?? []) as DirectoryEntry[]

  // Filter by search
  const filtered = search
    ? entries.filter((e) =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.flatNumber.toLowerCase().includes(search.toLowerCase())
      )
    : entries

  // Group by floor
  const byFloor = filtered.reduce<Record<number, DirectoryEntry[]>>((acc, e) => {
    if (!acc[e.floor]) acc[e.floor] = []
    acc[e.floor].push(e)
    return acc
  }, {})

  const floors = Object.keys(byFloor).map(Number).sort((a, b) => a - b)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resident Directory</h1>
        <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} residents</p>
      </div>

      <input
        type="search" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or flat number..."
        className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg text-sm"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) :
        filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            No residents found
          </div>
        ) : (
          <div className="space-y-6">
            {floors.map((floor) => (
              <div key={floor}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {floor === 5 ? 'Floor 5 — Penthouses' : `Floor ${floor}`}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {byFloor[floor].map((e) => (
                    <div key={e.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
                        {e.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{e.name}</p>
                        <p className="text-xs text-gray-500">
                          Flat {e.flatNumber} · <span className="capitalize">{e.residentType}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}