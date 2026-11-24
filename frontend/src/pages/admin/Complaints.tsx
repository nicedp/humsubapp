import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { complaintsApi } from '../../api/complaints'
import { Complaint } from '../../types'
import { format } from 'date-fns'
import Pagination from '../../components/Pagination'
import {
  COMPLAINT_STATUS_COLORS as STATUS_COLORS,
  COMPLAINT_CATEGORIES as CATEGORIES,
  COMPLAINT_STATUSES as STATUSES,
} from '../../constants/labels'

const PAGE_SIZE = 20

export default function AdminComplaints() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [skip, setSkip] = useState(0)
  const [selected, setSelected] = useState<Complaint | null>(null)
  const [remark, setRemark] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['complaints', statusFilter, categoryFilter, skip],
    queryFn: () => complaintsApi.list({
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      skip,
      limit: PAGE_SIZE,
    }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, adminRemark }: { id: string; status: string; adminRemark: string }) =>
      complaintsApi.update(id, { status, adminRemark }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['complaints'] }); closeModal(); toast.success('Complaint updated') },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'; setError(msg); toast.error(msg) },
  })

  const openModal = (c: Complaint) => {
    setSelected(c)
    setRemark(c.adminRemark ?? '')
    setNewStatus(c.status)
    setError('')
  }
  const closeModal = () => { setSelected(null); setRemark(''); setNewStatus(''); setError('') }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    updateMutation.mutate({ id: selected.id, status: newStatus, adminRemark: remark })
  }

  const complaints = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} total complaints</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setSkip(0) }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>{['Flat', 'Category', 'Description', 'Status', 'Raised On', 'Admin Remark', 'Actions'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>{[...Array(7)].map((__, j) => (
                  <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4" /></td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Flat', 'Category', 'Description', 'Status', 'Raised On', 'Admin Remark', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {complaints.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-4xl mb-2">📝</div>
                  <p className="text-gray-500 font-medium">No complaints found</p>
                  <p className="text-gray-400 text-xs mt-1">Residents can raise complaints from their portal</p>
                </td></tr>
              ) : complaints.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{c.flatNumber ?? c.flatId}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap">{c.category}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={c.description}>{c.description}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(new Date(c.raisedOn), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate" title={c.adminRemark ?? ''}>{c.adminRemark ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => openModal(c)} className="text-blue-600 hover:underline text-xs font-medium">Update</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Pagination skip={skip} limit={PAGE_SIZE} total={data?.total ?? 0} onPageChange={setSkip} />

      {/* Update Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Update Complaint</h2>
            <p className="text-sm text-gray-500 mb-4 capitalize">
              Flat {selected.flatNumber ?? selected.flatId} · {selected.category} · raised {format(new Date(selected.raisedOn), 'dd MMM yyyy')}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 whitespace-pre-wrap">{selected.description}</div>
            {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Remark (optional)</label>
                <textarea value={remark} onChange={(e) => setRemark(e.target.value)} rows={3}
                  placeholder="Add a remark visible to the resident..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}