import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { complaintsApi } from '../../api/complaints'
import { format } from 'date-fns'
import {
  COMPLAINT_STATUS_COLORS as STATUS_COLORS,
  COMPLAINT_CATEGORIES as CATEGORIES,
} from '../../constants/labels'

const emptyForm = { category: 'maintenance', description: '' }

export default function ResidentComplaints() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-complaints'],
    queryFn: () => complaintsApi.getMyComplaints({ limit: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: (p: typeof emptyForm) => complaintsApi.create(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-complaints'] })
      setForm(emptyForm)
      setShowForm(false)
      setError('')
      toast.success('Complaint submitted successfully')
    },
    onError: (e: unknown) => { const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error submitting complaint'; setError(msg); toast.error(msg) },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) { setError('Description is required'); return }
    setError('')
    createMutation.mutate(form)
  }

  const complaints = data?.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-sm text-gray-500 mt-1">{data?.total ?? 0} complaints raised</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError('') }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
          {showForm ? 'Cancel' : '+ Raise Complaint'}
        </button>
      </div>

      {/* Raise Complaint Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">New Complaint</h2>
          {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4} placeholder="Describe the issue in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowForm(false); setError(''); setForm(emptyForm) }}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
              <button type="submit" disabled={createMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg disabled:bg-blue-400">
                {createMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Complaints List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mt-1" />
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-3">📝</div>
              <p className="font-semibold text-gray-700">No complaints raised yet</p>
              <p className="text-sm text-gray-400 mt-1">Have an issue? Use the "+ Raise Complaint" button above to let the society office know.</p>
            </div>
          ) : complaints.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{c.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{format(new Date(c.raisedOn), 'dd MMM yyyy')}</span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1">{c.description}</p>
                  {c.adminRemark && (
                    <div className="mt-2 bg-blue-50 border-l-2 border-blue-300 pl-3 py-1">
                      <p className="text-xs text-blue-600 font-medium">Admin Remark</p>
                      <p className="text-sm text-blue-800">{c.adminRemark}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}