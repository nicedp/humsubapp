import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { invoicesApi, Invoice } from '../../api/invoices'
import { settingsApi } from '../../api/settings'
import { defaultForm, printInvoice } from '../../components/admin/invoices/invoiceHelpers'
import InvoiceTable from '../../components/admin/invoices/InvoiceTable'
import ViewInvoiceModal from '../../components/admin/invoices/ViewInvoiceModal'
import InvoiceFormModal from '../../components/admin/invoices/InvoiceFormModal'
import type { InvoiceForm } from '../../components/admin/invoices/InvoiceFormModal'

export default function AdminInvoices() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [form, setForm] = useState<InvoiceForm>(() => defaultForm('', ''))

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: settingsApi.get })
  const societyName = settingsQuery.data?.societyName ?? 'Society Management Portal'
  const societyAddress = settingsQuery.data?.address ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', filterStatus],
    queryFn: () => invoicesApi.list({ status: filterStatus || undefined, limit: 100 }),
  })
  const invoices = data?.data ?? []

  const createMutation = useMutation({
    mutationFn: () => invoicesApi.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); closeForm() },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

  const updateMutation = useMutation({
    mutationFn: () => invoicesApi.update(editId!, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice updated'); closeForm() },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice deleted') },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => invoicesApi.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })

  const closeForm = () => { setShowForm(false); setEditId(null) }

  const openCreate = () => {
    setEditId(null)
    setForm(defaultForm(societyName, societyAddress))
    setShowForm(true)
  }

  const openEdit = (inv: Invoice) => {
    setEditId(inv.id)
    setForm({
      fromName: inv.fromName,
      fromAddress: inv.fromAddress ?? '',
      fromPhone: inv.fromPhone ?? '',
      fromEmail: inv.fromEmail ?? '',
      toName: inv.toName,
      toAddress: inv.toAddress ?? '',
      toPhone: inv.toPhone ?? '',
      toEmail: inv.toEmail ?? '',
      invoiceDate: format(new Date(inv.invoiceDate), 'yyyy-MM-dd'),
      dueDate: inv.dueDate ? format(new Date(inv.dueDate), 'yyyy-MM-dd') : '',
      items: inv.items.map(i => ({ id: i.id, description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
      taxRate: inv.taxRate,
      notes: inv.notes ?? '',
      status: inv.status,
    })
    setShowForm(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage society invoices</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
          + New Invoice
        </button>
      </div>

      <InvoiceTable
        invoices={invoices}
        isLoading={isLoading}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onView={setViewInvoice}
        onEdit={openEdit}
        onPrint={printInvoice}
        onDelete={(id) => deleteMutation.mutate(id)}
        onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
      />

      {viewInvoice && (
        <ViewInvoiceModal
          inv={viewInvoice}
          onClose={() => setViewInvoice(null)}
          onPrint={printInvoice}
          onEdit={(inv) => { setViewInvoice(null); openEdit(inv) }}
        />
      )}

      <InvoiceFormModal
        open={showForm}
        editId={editId}
        form={form}
        onChange={setForm}
        onSubmit={() => editId ? updateMutation.mutate() : createMutation.mutate()}
        onClose={closeForm}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  )
}