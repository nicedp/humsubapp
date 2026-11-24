import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { incomeApi, IncomeRecord, CreateIncomePayload } from '../../api/income'

const SOURCES = [
  { value: 'sponsorship', label: 'Sponsorship', icon: '🤝' },
  { value: 'advertisement', label: 'Advertisement', icon: '📣' },
  { value: 'event', label: 'Event', icon: '🎉' },
  { value: 'rental', label: 'Rental', icon: '🏠' },
  { value: 'donation', label: 'Donation', icon: '💝' },
  { value: 'other', label: 'Other', icon: '💵' },
]

function sourceLabel(source: string) {
  return SOURCES.find(s => s.value === source)?.label ?? source
}
function sourceIcon(source: string) {
  return SOURCES.find(s => s.value === source)?.icon ?? '💵'
}
function sourceColor(source: string) {
  const map: Record<string, string> = {
    sponsorship: 'bg-blue-100 text-blue-700',
    advertisement: 'bg-purple-100 text-purple-700',
    event: 'bg-yellow-100 text-yellow-700',
    rental: 'bg-green-100 text-green-700',
    donation: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-600',
  }
  return map[source] ?? 'bg-gray-100 text-gray-600'
}

const emptyForm: CreateIncomePayload = {
  title: '',
  source: 'other',
  amount: 0,
  receivedOn: format(new Date(), 'yyyy-MM-dd'),
  payer: '',
  notes: '',
}

export default function AdminIncome() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editRecord, setEditRecord] = useState<IncomeRecord | null>(null)
  const [form, setForm] = useState<CreateIncomePayload>(emptyForm)
  const [filterSource, setFilterSource] = useState('')
  const [filterYear, setFilterYear] = useState(new Date().getFullYear())

  const { data, isLoading } = useQuery({
    queryKey: ['income', filterSource, filterYear],
    queryFn: () => incomeApi.list({
      source: filterSource || undefined,
      year: filterYear,
      limit: 100,
    }),
  })

  const records = data?.data ?? []
  const totalAmount = records.reduce((s, r) => s + r.amount, 0)

  const createMutation = useMutation({
    mutationFn: () => incomeApi.create(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] })
      toast.success('Income record added')
      setShowModal(false)
      setForm(emptyForm)
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save'),
  })

  const updateMutation = useMutation({
    mutationFn: () => incomeApi.update(editRecord!.id, form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] })
      toast.success('Income record updated')
      setShowModal(false)
      setEditRecord(null)
      setForm(emptyForm)
    },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to update'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => incomeApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['income'] })
      toast.success('Record deleted')
    },
  })

  const openCreate = () => {
    setEditRecord(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (r: IncomeRecord) => {
    setEditRecord(r)
    setForm({
      title: r.title,
      source: r.source,
      amount: r.amount,
      receivedOn: format(new Date(r.receivedOn), 'yyyy-MM-dd'),
      payer: r.payer ?? '',
      notes: r.notes ?? '',
    })
    setShowModal(true)
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  // Source breakdown
  const breakdown = SOURCES.map(s => ({
    ...s,
    total: records.filter(r => r.source === s.value).reduce((sum, r) => sum + r.amount, 0),
    count: records.filter(r => r.source === s.value).length,
  })).filter(s => s.count > 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Other Income</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sponsorships, advertisements & other society earnings</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
        >
          + Add Income
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={filterYear}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Sources</option>
          {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {/* KPI + breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 col-span-1 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Income ({filterYear})</p>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{totalAmount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-400 mt-1">{records.length} record{records.length !== 1 ? 's' : ''}</p>
        </div>
        {breakdown.map(s => (
          <div key={s.value} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-xs font-medium text-gray-600">{s.label}</span>
              <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium ${sourceColor(s.value)}`}>{s.count}</span>
            </div>
            <p className="text-xl font-bold text-gray-800">₹{s.total.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading...</div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-3">💵</div>
            <p className="font-semibold text-gray-700">No income records yet</p>
            <p className="text-sm text-gray-400 mt-1">Add sponsorships, ads or other earnings</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Date', 'Title', 'Source', 'Payer', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{format(new Date(r.receivedOn), 'dd MMM yyyy')}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{r.title}</p>
                    {r.notes && <p className="text-xs text-gray-400 truncate max-w-[200px]">{r.notes}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sourceColor(r.source)}`}>
                      {sourceIcon(r.source)} {sourceLabel(r.source)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.payer ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">₹{r.amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(r)} className="text-blue-500 hover:underline text-xs">Edit</button>
                      <button
                        onClick={() => { if (confirm('Delete this record?')) deleteMutation.mutate(r.id) }}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {editRecord ? 'Edit Income Record' : 'Add Income Record'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Banner ad — Reliance Fresh"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
                  <select
                    value={form.source}
                    onChange={e => setForm({ ...form, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {SOURCES.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received On *</label>
                  <input
                    type="date"
                    value={form.receivedOn}
                    onChange={e => setForm({ ...form, receivedOn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payer / Sponsor</label>
                  <input
                    type="text"
                    value={form.payer ?? ''}
                    onChange={e => setForm({ ...form, payer: e.target.value })}
                    placeholder="Company or person"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes ?? ''}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => { setShowModal(false); setEditRecord(null); setForm(emptyForm) }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editRecord ? updateMutation.mutate() : createMutation.mutate()}
                  disabled={!form.title || !form.amount || !form.receivedOn || createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editRecord ? 'Update' : 'Add Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}