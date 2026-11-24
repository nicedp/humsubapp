import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { visitorsApi } from '../../api/visitors'
import { format } from 'date-fns'

export default function ResidentVisitors() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-visitors'],
    queryFn: () => visitorsApi.getMyVisitors({ limit: 50 }),
  })

  const visitors = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visitor Log</h1>
        <p className="text-sm text-gray-500 mt-1">Visitors to your flat</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Visitor Name', 'Phone', 'Purpose', 'Entry Time', 'Exit Time', 'Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <tr key={i}>{[...Array(6)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Visitor Name', 'Phone', 'Purpose', 'Entry Time', 'Exit Time', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visitors.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-14 text-center">
                  <div className="text-5xl mb-3">🚪</div>
                  <p className="text-gray-700 font-semibold">No visitors recorded</p>
                  <p className="text-gray-400 text-sm mt-1">When the security guard logs a visitor for your flat, it will appear here</p>
                </td></tr>
              ) : visitors.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{v.visitorName}</td>
                  <td className="px-4 py-3 text-gray-600">{v.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{v.purpose}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {format(new Date(v.entryTime), 'dd MMM, h:mm a')}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {v.exitTime ? format(new Date(v.exitTime), 'dd MMM, h:mm a') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.exitTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                    }`}>
                      {v.exitTime ? 'Left' : 'Inside'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}