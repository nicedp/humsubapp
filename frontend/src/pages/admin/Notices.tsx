import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { noticesApi } from '../../api/notices'
import { Notice } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'

const emptyForm = { title: '', body: '', priority: 'normal' as Notice['priority'], expiresOn: '' }

const priorityColor = (p: string) => {
  if (p === 'urgent') return 'bg-red-100 text-red-700'
  if (p === 'high') return 'bg-orange-100 text-orange-700'
  if (p === 'normal') return 'bg-blue-100 text-blue-700'
  return 'bg-gray-100 text-gray-500'
}

const PAGE_SIZE = 15

export default function AdminNotices() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editNotice, setEditNotice] = useState<Notice | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [skip, setSkip] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['notices', skip],
    queryFn: () => noticesApi.list({ skip, limit: PAGE_SIZE }),
  })

  const createMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => noticesApi.create(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); closeModal(); toast.success('Notice posted') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const updateMutation = useMutation({
    mutationFn: (p: Partial<typeof emptyForm>) => noticesApi.update(editNotice!.id, p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); closeModal(); toast.success('Notice updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noticesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notices'] }); toast.success('Notice deleted') },
    onError: () => toast.error('Failed to delete notice'),
  })

  const openCreate = () => { setEditNotice(null); setForm(emptyForm); setError(''); setShowModal(true) }
  const openEdit = (n: Notice) => {
    setEditNotice(n)
    setForm({ title: n.title, body: n.body, priority: n.priority, expiresOn: n.expiresOn ? n.expiresOn.slice(0, 10) : '' })
    setError(''); setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setEditNotice(null); setForm(emptyForm); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (editNotice) updateMutation.mutate(form)
    else createMutation.mutate(form)
  }

  const notices = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} notices</p>
        </div>
        <button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">+ Post Notice</button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-4/5 mt-1" />
              </div>
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="text-4xl mb-2">📢</div>
            <p className="text-gray-500 font-medium">No notices posted yet</p>
            <p className="text-gray-400 text-xs mt-1">Post a notice to inform all residents</p>
          </div>
        ) : notices.map((n) => (
            <div key={n.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor(n.priority)}`}>{n.priority}</span>
                    <span className="text-xs text-gray-400">{format(new Date(n.postedOn), 'dd MMM yyyy')}</span>
                    {n.expiresOn && <span className="text-xs text-gray-400">· Expires {format(new Date(n.expiresOn), 'dd MMM')}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900">{n.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{n.body}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(n)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => { if (confirm('Delete this notice?')) deleteMutation.mutate(n.id) }} className="text-red-500 hover:underline text-xs">Delete</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
      <Pagination skip={skip} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setSkip} />

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editNotice ? 'Edit Notice' : 'Post Notice'}</h2>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Notice['priority'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires On (optional)</label>
                  <input type="date" value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editNotice ? 'Update' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}