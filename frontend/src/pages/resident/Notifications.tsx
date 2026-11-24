import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '../../api/notifications'
import { format, isToday, isYesterday } from 'date-fns'
import toast from 'react-hot-toast'
import { Notification } from '../../types'

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups: Record<string, Notification[]> = {}
  for (const n of notifications) {
    const d = new Date(n.createdAt)
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'dd MMM yyyy')
    if (!groups[key]) groups[key] = []
    groups[key].push(n)
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }))
}

export default function ResidentNotifications() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['my-notifications'],
    queryFn: () => notificationsApi.getMyNotifications({ limit: 100 }),
    refetchInterval: 30_000, // poll every 30s
  })

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
      toast.success(`${r.count} notification${r.count !== 1 ? 's' : ''} marked as read`)
    },
    onError: () => toast.error('Failed to mark all as read'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
    onError: () => toast.error('Failed to delete notification'),
  })

  const notifications = data?.data ?? []
  const unreadCount = unreadData?.count ?? 0
  const groups = groupByDate(notifications)

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            {markAllReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-3">🔔</div>
          <p className="text-gray-600 font-semibold text-lg">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll see alerts here when visitors arrive at your flat
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(({ label, items }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
              <div className="space-y-2">
                {items.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                      n.isRead
                        ? 'bg-white border-gray-100'
                        : 'bg-blue-50 border-blue-100'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`mt-0.5 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm ${
                      n.isRead ? 'bg-gray-100' : 'bg-blue-100'
                    }`}>
                      🚶
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(n.createdAt), 'h:mm a')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.isRead && (
                        <button
                          onClick={() => markReadMutation.mutate(n.id)}
                          disabled={markReadMutation.isPending}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                          title="Mark as read"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(n.id)}
                        disabled={deleteMutation.isPending}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}