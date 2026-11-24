import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { noticesApi } from '../../api/notices'
import { format } from 'date-fns'

const priorityColor = (p: string) => {
  if (p === 'urgent') return 'bg-red-100 text-red-700'
  if (p === 'high') return 'bg-orange-100 text-orange-700'
  if (p === 'normal') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-500'
}

export default function ResidentNotices() {
  const { data, isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: () => noticesApi.list({ limit: 100 }),
  })

  const notices = data?.data ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Society Notices</h1>
        <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} notices</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5 mt-1" />
            </div>
          ))}
        </div>
      ) :
        notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-5xl mb-3">📢</div>
            <p className="font-semibold text-gray-700">No notices posted yet</p>
            <p className="text-sm text-gray-400 mt-1">Society announcements and important updates will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColor(n.priority)}`}>
                    {n.priority}
                  </span>
                  <span className="text-xs text-gray-400">{format(new Date(n.postedOn), 'dd MMM yyyy')}</span>
                  {n.expiresOn && (
                    <span className="text-xs text-gray-400">· Expires {format(new Date(n.expiresOn), 'dd MMM yyyy')}</span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{n.title}</h3>
                <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{n.body}</p>
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}