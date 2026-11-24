
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { expensesApi, Expense, ExpenseCategoryItem } from '../../api/expenses'
import Pagination from '../../components/Pagination'
import ExpenseImportModal from '../../components/admin/expenses/ExpenseImportModal'

const PAGE_SIZE = 20

// Tailwind badge color palette — cycles by category index
const BADGE_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-yellow-100 text-yellow-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-gray-100 text-gray-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
  'bg-red-100 text-red-700',
  'bg-teal-100 text-teal-700',
]

function getCategoryBadge(slug: string, cats: ExpenseCategoryItem[]): string {
  const idx = cats.findIndex(c => c.slug === slug)
  return BADGE_COLORS[(idx >= 0 ? idx : cats.length) % BADGE_COLORS.length]
}

function getCategoryName(slug: string, cats: ExpenseCategoryItem[]): string {
  return cats.find(c => c.slug === slug)?.name ?? slug
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '')
}

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
  paidOn: z.string().min(1, 'Date is required'),
  vendor: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
})
type ExpenseFormData = z.infer<typeof expenseSchema>

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().optional(),
})
type CategoryFormData = z.infer<typeof categorySchema>

// Helpers to compute current-month start/end as yyyy-MM-dd strings
function currentMonthStart(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}
function currentMonthEnd(): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
}

// Quick-range presets
const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i)

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

export default function AdminExpenses() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [showImportModal, setShowImportModal] = useState(false)

  const [filterCategory, setFilterCategory] = useState('')
  // Default dateFrom/dateTo to current month; honour ?month=M&year=Y URL params (Finance Ledger links)
  const [filterDateFrom, setFilterDateFrom] = useState<string>(() => {
    const m = searchParams.get('month')
    const y = searchParams.get('year')
    if (m && y) {
      return `${y}-${String(parseInt(m)).padStart(2, '0')}-01`
    }
    return currentMonthStart()
  })
  const [filterDateTo, setFilterDateTo] = useState<string>(() => {
    const m = searchParams.get('month')
    const y = searchParams.get('year')
    if (m && y) {
      const lastDay = new Date(parseInt(y), parseInt(m), 0)
      return `${y}-${String(parseInt(m)).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`
    }
    return currentMonthEnd()
  })
  const [skip, setSkip] = useState(0)

  // Expense modal state
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  // Category manager state
  const [showCatManager, setShowCatManager] = useState(false)
  const [editingCat, setEditingCat] = useState<ExpenseCategoryItem | null>(null)
  const [deleteCatTarget, setDeleteCatTarget] = useState<ExpenseCategoryItem | null>(null)
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[0])

  // ── Fetch categories ──────────────────────────────────────────────────────
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.categories.list(),
    staleTime: 60_000,
  })
  const activeCategories = categories.filter(c => c.isActive)

  // ── Fetch expenses ────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['expenses', filterCategory, filterDateFrom, filterDateTo, skip],
    queryFn: () => expensesApi.list({
      skip,
      limit: PAGE_SIZE,
      category: filterCategory || undefined,
      dateFrom: filterDateFrom || undefined,
      dateTo: filterDateTo || undefined,
    }),
  })
  const expenses = data?.data ?? []
  const total = data?.total ?? 0

  // ── Expense form ──────────────────────────────────────────────────────────
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
  })

  const createMutation = useMutation({
    mutationFn: (d: ExpenseFormData) => expensesApi.create(d),
    onSuccess: () => {
      toast.success('Expense recorded')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      closeModal()
    },
    onError: () => toast.error('Failed to record expense'),
  })

  const updateMutation = useMutation({
    mutationFn: (d: ExpenseFormData) => expensesApi.update(editingExpense!.id, d),
    onSuccess: () => {
      toast.success('Expense updated')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      closeModal()
    },
    onError: () => toast.error('Failed to update expense'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      toast.success('Expense deleted')
      qc.invalidateQueries({ queryKey: ['expenses'] })
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete expense'),
  })

  function openCreate() {
    setEditingExpense(null)
    const first = activeCategories[0]?.slug ?? ''
    reset({ category: first, paidOn: format(new Date(), 'yyyy-MM-dd') })
    setShowModal(true)
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense)
    reset({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paidOn: format(new Date(expense.paidOn), 'yyyy-MM-dd'),
      vendor: expense.vendor ?? '',
      notes: expense.notes ?? '',
    })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingExpense(null)
    reset()
  }

  function onSubmit(d: ExpenseFormData) {
    if (editingExpense) updateMutation.mutate(d)
    else createMutation.mutate(d)
  }

  // ── Category manager mutations ────────────────────────────────────────────
  const catForm = useForm<CategoryFormData>({ resolver: zodResolver(categorySchema) })

  const createCatMutation = useMutation({
    mutationFn: (d: CategoryFormData) => expensesApi.categories.create({
      name: d.name,
      slug: slugify(d.name),
      color: d.color || newCatColor,
    }),
    onSuccess: () => {
      toast.success('Category created')
      qc.invalidateQueries({ queryKey: ['expense-categories'] })
      catForm.reset()
      setNewCatColor(COLOR_PALETTE[0])
    },
    onError: (err: any) => toast.error(err?.response?.data?.error ?? 'Failed to create category'),
  })

  const updateCatMutation = useMutation({
    mutationFn: (d: CategoryFormData) => expensesApi.categories.update(editingCat!.id, {
      name: d.name,
      color: d.color || undefined,
    }),
    onSuccess: () => {
      toast.success('Category updated')
      qc.invalidateQueries({ queryKey: ['expense-categories'] })
      catForm.reset()
      setEditingCat(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error ?? 'Failed to update category'),
  })

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      expensesApi.categories.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expense-categories'] }),
    onError: () => toast.error('Failed to update category'),
  })

  const deleteCatMutation = useMutation({
    mutationFn: (id: number) => expensesApi.categories.delete(id),
    onSuccess: () => {
      toast.success('Category deleted')
      qc.invalidateQueries({ queryKey: ['expense-categories'] })
      setDeleteCatTarget(null)
    },
    onError: (err: any) => toast.error(err?.response?.data?.error ?? 'Cannot delete — category may be in use'),
  })

  function startEditCat(cat: ExpenseCategoryItem) {
    setEditingCat(cat)
    catForm.reset({ name: cat.name, color: cat.color ?? '' })
  }

  function cancelEditCat() {
    setEditingCat(null)
    catForm.reset()
  }

  function onCatSubmit(d: CategoryFormData) {
    if (editingCat) updateCatMutation.mutate(d)
    else createCatMutation.mutate(d)
  }

  const pageTotal = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-sm text-gray-500 mt-1">Track society expenditure by category and month</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowCatManager(true)}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            🏷 Manage Categories
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            📤 Import CSV
          </button>
          <button
            onClick={() => navigate('/admin/expense-bulk-entry')}
            className="px-3 py-2 text-sm border border-indigo-300 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            📋 Bulk Entry
          </button>
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Category filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
            <select
              value={filterCategory}
              onChange={e => { setFilterCategory(e.target.value); setSkip(0) }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>
                  {c.name}{!c.isActive ? ' (inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">From</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={e => { setFilterDateFrom(e.target.value); setSkip(0) }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date To */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">To</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={e => { setFilterDateTo(e.target.value); setSkip(0) }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Select</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setFilterDateFrom(currentMonthStart()); setFilterDateTo(currentMonthEnd()); setSkip(0) }}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                This Month
              </button>
              {YEARS.slice(0, 3).map(y => (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setFilterDateFrom(`${y}-01-01`)
                    setFilterDateTo(`${y}-12-31`)
                    setSkip(0)
                  }}
                  className="px-3 py-2 text-xs border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {/* Clear */}
          {(filterCategory || filterDateFrom !== currentMonthStart() || filterDateTo !== currentMonthEnd()) && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-transparent uppercase tracking-wide select-none">Clear</label>
              <button
                onClick={() => { setFilterCategory(''); setFilterDateFrom(currentMonthStart()); setFilterDateTo(currentMonthEnd()); setSkip(0) }}
                className="px-3 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No expenses found. Add one to get started.</div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{expense.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryBadge(expense.category, categories)}`}>
                        {getCategoryName(expense.category, categories)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-red-600">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {format(new Date(expense.paidOn), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{expense.vendor || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs max-w-xs truncate">{expense.notes || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(expense)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                        <button onClick={() => setDeleteTarget(expense)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">
                    Page Total ({expenses.length} records)
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-red-600">
                    ₹{pageTotal.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
            <div className="px-4 py-3 border-t border-gray-100">
              <Pagination skip={skip} limit={PAGE_SIZE} total={total} onPageChange={setSkip} />
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Expense Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">{editingExpense ? 'Edit Expense' : 'Record Expense'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  {...register('title')}
                  placeholder="e.g. Elevator AMC payment"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    {...register('category')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {activeCategories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                    {activeCategories.length === 0 && (
                      <option value="" disabled>No active categories</option>
                    )}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount')}
                    placeholder="0.00"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Paid *</label>
                  <input
                    type="date"
                    {...register('paidOn')}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.paidOn && <p className="text-red-500 text-xs mt-1">{errors.paidOn.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <input
                    {...register('vendor')}
                    placeholder="Vendor / supplier name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  {...register('notes')}
                  rows={2}
                  placeholder="Optional details..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {editingExpense ? 'Save Changes' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Expense Confirmation ──────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-2">Delete Expense?</h2>
            <p className="text-sm text-gray-500 mb-1"><strong>{deleteTarget.title}</strong></p>
            <p className="text-sm text-gray-500 mb-4">
              ₹{deleteTarget.amount.toLocaleString('en-IN')} · {format(new Date(deleteTarget.paidOn), 'dd MMM yyyy')}
            </p>
            <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage Categories Modal ──────────────────────────────────────────── */}
      {showCatManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="font-semibold text-gray-800">Manage Expense Categories</h2>
                <p className="text-xs text-gray-400 mt-0.5">Add custom categories or edit existing ones for this society</p>
              </div>
              <button
                onClick={() => { setShowCatManager(false); cancelEditCat() }}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >×</button>
            </div>

            {/* Category list */}
            <div className="overflow-y-auto flex-1 px-6 py-3 space-y-2">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-opacity ${cat.isActive ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                >
                  {editingCat?.id === cat.id ? (
                    <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        {...catForm.register('name')}
                        placeholder="Category name"
                        className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      <input
                        type="color"
                        {...catForm.register('color')}
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5"
                        title="Pick chart color"
                      />
                      <button
                        type="submit"
                        disabled={updateCatMutation.isPending}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button type="button" onClick={cancelEditCat} className="text-xs text-gray-500 px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm"
                        style={{ background: cat.color ?? '#a4a4a4' }}
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-800">{cat.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{cat.slug}</span>
                        {cat.isDefault && (
                          <span className="ml-2 text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded">default</span>
                        )}
                      </div>
                    </div>
                  )}

                  {editingCat?.id !== cat.id && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => toggleActiveMutation.mutate({ id: cat.id, isActive: !cat.isActive })}
                        className={`text-xs px-2 py-1 rounded border ${cat.isActive
                          ? 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {cat.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => startEditCat(cat)} className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1">Edit</button>
                      {!cat.isDefault && (
                        <button onClick={() => setDeleteCatTarget(cat)} className="text-xs text-red-500 hover:text-red-700 px-2 py-1">Delete</button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {categories.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No categories yet.</p>
              )}
            </div>

            {/* Add new category form */}
            {!editingCat && (
              <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add New Category</p>
                <form onSubmit={catForm.handleSubmit(onCatSubmit)} className="flex items-center gap-2">
                  <input
                    {...catForm.register('name')}
                    placeholder="Category name (e.g. Gardening)"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={e => setNewCatColor(e.target.value)}
                    className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"
                    title="Pick a chart color"
                  />
                  <button
                    type="submit"
                    disabled={createCatMutation.isPending}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex-shrink-0"
                  >
                    Add
                  </button>
                </form>
                {catForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{catForm.formState.errors.name.message}</p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {COLOR_PALETTE.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewCatColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${newCatColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Delete Category Confirmation ─────────────────────────────────────── */}
      {deleteCatTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-2">Delete Category?</h2>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{deleteCatTarget.name}</strong>
              <span className="text-gray-400 ml-1">({deleteCatTarget.slug})</span>
            </p>
            <p className="text-sm text-red-500 mb-4">
              This will fail if any expenses are assigned to this category.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteCatTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCatMutation.mutate(deleteCatTarget.id)}
                disabled={deleteCatMutation.isPending}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import CSV Modal ──────────────────────────────────────────────────── */}
      {showImportModal && (
        <ExpenseImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            qc.invalidateQueries({ queryKey: ['expenses'] })
          }}
        />
      )}
    </div>
  )
}
