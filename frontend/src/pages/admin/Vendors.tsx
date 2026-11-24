
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { vendorsApi, Vendor, AmcContract, ServiceLog } from '../../api/vendors'

const vendorSchema = z.object({
  name: z.string().min(1, 'Name required'),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  serviceType: z.string().min(1, 'Service type required'),
  notes: z.string().optional(),
})
type VendorForm = z.infer<typeof vendorSchema>

const contractSchema = z.object({
  vendorId: z.string().min(1, 'Vendor required'),
  serviceType: z.string().min(1, 'Service type required'),
  contractNumber: z.string().optional(),
  annualCost: z.coerce.number().min(0, 'Cost required'),
  startDate: z.string().min(1, 'Start date required'),
  endDate: z.string().min(1, 'End date required'),
  serviceFrequencyDays: z.coerce.number().min(1).default(90),
  nextServiceDue: z.string().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'pending_renewal']).default('active'),
  notes: z.string().optional(),
})
type ContractForm = z.infer<typeof contractSchema>

const logSchema = z.object({
  serviceDate: z.string().min(1, 'Service date required'),
  technicianName: z.string().optional(),
  workDone: z.string().min(1, 'Work done is required'),
  serviceCost: z.coerce.number().min(0).optional(),
  nextServiceDue: z.string().optional(),
  remarks: z.string().optional(),
})
type LogForm = z.infer<typeof logSchema>

const DUE_STATUS_CONFIG = {
  overdue: { label: '🔴 Overdue', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  due_soon: { label: '🟡 Due Soon', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  ok: { label: '🟢 OK', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  unknown: { label: '⚪ Unknown', bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
}

const CONTRACT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-600',
  cancelled: 'bg-gray-100 text-gray-500',
  pending_renewal: 'bg-yellow-100 text-yellow-700',
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}` }

// ─── Service Log Modal ──────────────────────────────────────────────────────
function LogModal({ contract, onClose }: { contract: AmcContract; onClose: () => void }) {
  const qc = useQueryClient()
  const form = useForm<LogForm>({ resolver: zodResolver(logSchema) })

  const addMut = useMutation({
    mutationFn: (d: LogForm) => vendorsApi.addServiceLog(contract.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts'] })
      qc.invalidateQueries({ queryKey: ['contract-detail', contract.id] })
      toast.success('Service log added')
      onClose()
    },
    onError: () => toast.error('Failed to add log'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Log Service Visit</h3>
            <p className="text-xs text-gray-500 mt-0.5">{contract.serviceType} · {contract.vendorName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <form onSubmit={form.handleSubmit(d => addMut.mutate(d))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Date *</label>
              <input {...form.register('serviceDate')} type="date"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
              {form.formState.errors.serviceDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.serviceDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
              <input {...form.register('technicianName')} placeholder="Name"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Done *</label>
            <textarea {...form.register('workDone')} rows={2} placeholder="Describe work performed..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none" />
            {form.formState.errors.workDone && <p className="text-red-500 text-xs mt-1">{form.formState.errors.workDone.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Cost (₹)</label>
              <input {...form.register('serviceCost')} type="number" placeholder="0"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Due (override)</label>
              <input {...form.register('nextServiceDue')} type="date"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <input {...form.register('remarks')} placeholder="Any remarks..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={addMut.isPending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
              {addMut.isPending ? 'Saving...' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Contract Detail Drawer ─────────────────────────────────────────────────
function ContractDetail({ contract, onClose }: { contract: AmcContract; onClose: () => void }) {
  const qc = useQueryClient()
  const [showLogModal, setShowLogModal] = useState(false)

  const { data: detail } = useQuery({
    queryKey: ['contract-detail', contract.id],
    queryFn: () => vendorsApi.getContract(contract.id),
  })

  const c = detail ?? contract
  const due = DUE_STATUS_CONFIG[c.dueStatus] ?? DUE_STATUS_CONFIG.unknown

  const delLogMut = useMutation({
    mutationFn: (logId: string) => vendorsApi.deleteServiceLog(c.id, logId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contract-detail', c.id] })
      qc.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Log removed')
    },
    onError: () => toast.error('Failed to remove log'),
  })

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="flex-1 bg-black/40" onClick={onClose} />
        <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{c.serviceType}</h2>
              <p className="text-sm text-gray-500 mt-0.5">🏢 {c.vendorName}</p>
              {c.contractNumber && <p className="text-xs text-gray-400 mt-0.5">Contract #{c.contractNumber}</p>}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">×</button>
          </div>

          <div className="px-6 py-3 border-b grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Annual Cost</p>
              <p className="font-bold text-gray-800">{fmt(c.annualCost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Contract Period</p>
              <p className="text-sm text-gray-700">{fmtDate(c.startDate)} – {fmtDate(c.endDate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Next Service Due</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-block w-2 h-2 rounded-full ${due.dot}`} />
                <p className={`text-sm font-medium ${due.text}`}>
                  {c.nextServiceDue ? fmtDate(c.nextServiceDue) : 'Not set'}
                  {c.daysUntilDue !== null && c.daysUntilDue > 0 ? ` (${c.daysUntilDue}d)` : ''}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400">Service Frequency</p>
              <p className="text-sm text-gray-700">Every {c.serviceFrequencyDays} days</p>
            </div>
          </div>

          <div className="px-6 py-3 border-b flex items-center justify-between">
            <p className="font-semibold text-gray-700">Service History ({c.serviceLogs?.length ?? 0})</p>
            <button onClick={() => setShowLogModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
              + Log Service
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {(c.serviceLogs ?? []).length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-5xl mb-3">🔧</p>
                <p className="font-semibold text-gray-700">No service logs yet</p>
                <p className="text-sm text-gray-400 mt-1">Log the first service visit</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(c.serviceLogs ?? []).map((log: ServiceLog) => (
                  <div key={log.id} className="bg-white border rounded-xl p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                            {fmtDate(log.serviceDate)}
                          </span>
                          {log.technicianName && <span className="text-xs text-gray-500">👷 {log.technicianName}</span>}
                          {log.serviceCost != null && <span className="text-xs text-gray-500">{fmt(log.serviceCost)}</span>}
                        </div>
                        <p className="text-sm text-gray-700">{log.workDone}</p>
                        {log.remarks && <p className="text-xs text-gray-400 mt-1">{log.remarks}</p>}
                        {log.nextServiceDue && (
                          <p className="text-xs text-green-600 mt-1">Next due: {fmtDate(log.nextServiceDue)}</p>
                        )}
                      </div>
                      <button onClick={() => delLogMut.mutate(log.id)}
                        className="text-red-400 hover:text-red-600 text-xl leading-none ml-3">×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {showLogModal && <LogModal contract={c} onClose={() => setShowLogModal(false)} />}
    </>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Vendors() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'contracts' | 'vendors'>('contracts')

  const [showContractForm, setShowContractForm] = useState(false)
  const [editContract, setEditContract] = useState<AmcContract | null>(null)
  const [detailContract, setDetailContract] = useState<AmcContract | null>(null)

  const [showVendorForm, setShowVendorForm] = useState(false)
  const [editVendor, setEditVendor] = useState<Vendor | null>(null)

  const [filterStatus, setFilterStatus] = useState('')
  const [filterDue, setFilterDue] = useState('')

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts', filterStatus, filterDue],
    queryFn: () => vendorsApi.listContracts({
      ...(filterStatus ? { status: filterStatus } : {}),
      ...(filterDue ? { dueStatus: filterDue } : {}),
    }),
  })
  const contracts = contractsData?.data ?? []

  const { data: vendorsData, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorsApi.listVendors(),
  })
  const vendors = vendorsData?.data ?? []

  // Contract form
  const contractForm = useForm<ContractForm>({
    resolver: zodResolver(contractSchema),
    defaultValues: { status: 'active', serviceFrequencyDays: 90 },
  })

  // Auto-populate nextServiceDue = startDate + serviceFrequencyDays
  const watchedStartDate = contractForm.watch('startDate')
  const watchedFrequency = contractForm.watch('serviceFrequencyDays')
  const [autoNextDue, setAutoNextDue] = useState<string>('')
  // Use a ref to track the last auto-computed value without stale closure issues
  const autoNextDueRef = { current: autoNextDue }
  autoNextDueRef.current = autoNextDue

  useEffect(() => {
    if (watchedStartDate && watchedFrequency && Number(watchedFrequency) > 0) {
      const d = new Date(watchedStartDate)
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + Number(watchedFrequency))
        const computed = d.toISOString().split('T')[0]
        setAutoNextDue(computed)
        // Only auto-fill if field is empty or still matches the previous auto value
        const current = contractForm.getValues('nextServiceDue')
        if (!current || current === autoNextDueRef.current) {
          contractForm.setValue('nextServiceDue', computed)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedStartDate, watchedFrequency])

  const resetContractForm = () => {
    contractForm.reset({ status: 'active', serviceFrequencyDays: 90 })
    setEditContract(null)
    setShowContractForm(false)
  }

  const createContractMut = useMutation({
    mutationFn: (d: ContractForm) => vendorsApi.createContract(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contracts'] }); toast.success('Contract added!'); resetContractForm() },
    onError: () => toast.error('Failed to create contract'),
  })
  const updateContractMut = useMutation({
    mutationFn: (d: ContractForm) => vendorsApi.updateContract(editContract!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contracts'] }); toast.success('Contract updated!'); resetContractForm() },
    onError: () => toast.error('Failed to update contract'),
  })
  const deleteContractMut = useMutation({
    mutationFn: (id: string) => vendorsApi.deleteContract(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['contracts'] }); toast.success('Contract deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const openEditContract = (c: AmcContract) => {
    setEditContract(c)
    contractForm.reset({
      vendorId: c.vendorId,
      serviceType: c.serviceType,
      contractNumber: c.contractNumber ?? '',
      annualCost: c.annualCost,
      startDate: c.startDate.split('T')[0],
      endDate: c.endDate.split('T')[0],
      serviceFrequencyDays: c.serviceFrequencyDays,
      nextServiceDue: c.nextServiceDue ? c.nextServiceDue.split('T')[0] : '',
      status: c.status,
      notes: c.notes ?? '',
    })
    setShowContractForm(true)
  }

  // Vendor form
  const vendorForm = useForm<VendorForm>({ resolver: zodResolver(vendorSchema) })

  const resetVendorForm = () => {
    vendorForm.reset()
    setEditVendor(null)
    setShowVendorForm(false)
  }

  const createVendorMut = useMutation({
    mutationFn: (d: VendorForm) => vendorsApi.createVendor(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor added!'); resetVendorForm() },
    onError: () => toast.error('Failed to create vendor'),
  })
  const updateVendorMut = useMutation({
    mutationFn: (d: VendorForm) => vendorsApi.updateVendor(editVendor!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor updated!'); resetVendorForm() },
    onError: () => toast.error('Failed to update vendor'),
  })
  const deleteVendorMut = useMutation({
    mutationFn: (id: string) => vendorsApi.deleteVendor(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor deleted') },
    onError: () => toast.error('Failed to delete'),
  })

  const openEditVendor = (v: Vendor) => {
    setEditVendor(v)
    vendorForm.reset({
      name: v.name,
      contactPerson: v.contactPerson ?? '',
      phone: v.phone ?? '',
      email: v.email ?? '',
      serviceType: v.serviceType,
      notes: v.notes ?? '',
    })
    setShowVendorForm(true)
  }

  const contractPending = createContractMut.isPending || updateContractMut.isPending
  const vendorPending = createVendorMut.isPending || updateVendorMut.isPending

  // Summary counts
  const overdueCount = contracts.filter(c => c.dueStatus === 'overdue').length
  const dueSoonCount = contracts.filter(c => c.dueStatus === 'due_soon').length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🔧 Vendor Services & AMC</h1>
          <p className="text-sm text-gray-500 mt-1">Manage AMC contracts, service logs and vendors</p>
        </div>
        <button
          onClick={() => tab === 'contracts' ? (resetContractForm(), setShowContractForm(true)) : (resetVendorForm(), setShowVendorForm(true))}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
          + {tab === 'contracts' ? 'New Contract' : 'New Vendor'}
        </button>
      </div>

      {/* Alert banners */}
      {overdueCount > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-red-500 text-lg">🔴</span>
          <p className="text-red-700 text-sm font-medium">{overdueCount} contract{overdueCount > 1 ? 's' : ''} overdue for service</p>
        </div>
      )}
      {dueSoonCount > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2">
          <span className="text-yellow-500 text-lg">🟡</span>
          <p className="text-yellow-700 text-sm font-medium">{dueSoonCount} contract{dueSoonCount > 1 ? 's' : ''} due soon</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setTab('contracts')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'contracts' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          📋 Contracts ({contractsData?.total ?? 0})
        </button>
        <button onClick={() => setTab('vendors')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'vendors' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          🏢 Vendors ({vendorsData?.total ?? 0})
        </button>
      </div>

      {/* ── Contracts Tab ── */}
      {tab === 'contracts' && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {['', 'overdue', 'due_soon', 'ok'].map(s => (
              <button key={s} onClick={() => setFilterDue(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterDue === s ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {s === '' ? 'All' : s === 'overdue' ? '🔴 Overdue' : s === 'due_soon' ? '🟡 Due Soon' : '🟢 OK'}
              </button>
            ))}
            <span className="mx-2 text-gray-300">|</span>
            {['', 'active', 'expired', 'pending_renewal'].map(s => (
              <button key={`st-${s}`} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {s === '' ? 'All Status' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {contractsLoading ? (
            <div className="text-center py-16 text-gray-400">Loading contracts...</div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-5xl mb-3">📋</p>
              <p className="font-semibold text-gray-700">No contracts found</p>
              <p className="text-sm text-gray-400 mt-1">Add your first AMC contract</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contracts.map(c => {
                const due = DUE_STATUS_CONFIG[c.dueStatus] ?? DUE_STATUS_CONFIG.unknown
                return (
                  <div key={c.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setDetailContract(c)}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-2 h-full min-h-12 rounded-full ${due.dot} self-stretch`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-800">{c.serviceType}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONTRACT_STATUS_COLORS[c.status]}`}>
                              {c.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${due.bg} ${due.text}`}>
                              {due.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">🏢 {c.vendorName}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-gray-400">Annual Cost</p>
                              <p className="text-sm font-semibold text-gray-700">{fmt(c.annualCost)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Next Due</p>
                              <p className={`text-sm font-semibold ${due.text}`}>
                                {c.nextServiceDue ? fmtDate(c.nextServiceDue) : '—'}
                                {c.daysUntilDue !== null && ` (${c.daysUntilDue}d)`}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Last Service</p>
                              <p className="text-sm text-gray-600">{c.lastServiceDate ? fmtDate(c.lastServiceDate) : '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Expires</p>
                              <p className="text-sm text-gray-600">{fmtDate(c.endDate)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEditContract(c)}
                            className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                            ✏️ Edit
                          </button>
                          <button onClick={() => { if (window.confirm('Delete this contract?')) deleteContractMut.mutate(c.id) }}
                            className="text-xs border border-red-100 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 font-medium">
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ── Vendors Tab ── */}
      {tab === 'vendors' && (
        <>
          {vendorsLoading ? (
            <div className="text-center py-16 text-gray-400">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-5xl mb-3">🏢</p>
              <p className="font-semibold text-gray-700">No vendors yet</p>
              <p className="text-sm text-gray-400 mt-1">Add vendors to assign to contracts</p>
            </div>
          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {vendors.map(v => (
                <div key={v.id} className="bg-white rounded-2xl border shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 truncate">{v.name}</h3>
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">{v.serviceType}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {v.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {v.contactPerson && <p className="text-sm text-gray-600 mt-2">👤 {v.contactPerson}</p>}
                  {v.phone && <p className="text-sm text-gray-600">📞 {v.phone}</p>}
                  {v.email && <p className="text-sm text-gray-600">✉️ {v.email}</p>}
                  {v.notes && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{v.notes}</p>}
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEditVendor(v)}
                      className="flex-1 text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                      ✏️ Edit
                    </button>
                    <button onClick={() => { if (window.confirm('Delete this vendor?')) deleteVendorMut.mutate(v.id) }}
                      className="flex-1 text-xs border border-red-100 text-red-500 py-1.5 rounded-lg hover:bg-red-50 font-medium">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Contract Form Modal ── */}
      {showContractForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-800">{editContract ? 'Edit Contract' : 'New AMC Contract'}</h3>
              <button onClick={resetContractForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={contractForm.handleSubmit(d => editContract ? updateContractMut.mutate(d) : createContractMut.mutate(d))}
              className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                  <select {...contractForm.register('vendorId')}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                    <option value="">Select vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  {contractForm.formState.errors.vendorId && <p className="text-red-500 text-xs mt-1">{contractForm.formState.errors.vendorId.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                  <input {...contractForm.register('serviceType')} placeholder="e.g. Lift AMC"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {contractForm.formState.errors.serviceType && <p className="text-red-500 text-xs mt-1">{contractForm.formState.errors.serviceType.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Number</label>
                  <input {...contractForm.register('contractNumber')} placeholder="Optional"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Cost (₹) *</label>
                  <input {...contractForm.register('annualCost')} type="number" placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {contractForm.formState.errors.annualCost && <p className="text-red-500 text-xs mt-1">{contractForm.formState.errors.annualCost.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input {...contractForm.register('startDate')} type="date"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {contractForm.formState.errors.startDate && <p className="text-red-500 text-xs mt-1">{contractForm.formState.errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input {...contractForm.register('endDate')} type="date"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {contractForm.formState.errors.endDate && <p className="text-red-500 text-xs mt-1">{contractForm.formState.errors.endDate.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Frequency (days)</label>
                  <input {...contractForm.register('serviceFrequencyDays')} type="number" placeholder="90"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">Next Service Due</label>
                    {autoNextDue && contractForm.watch('nextServiceDue') !== autoNextDue && (
                      <button type="button"
                        onClick={() => contractForm.setValue('nextServiceDue', autoNextDue)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                        ↺ Reset to auto ({autoNextDue})
                      </button>
                    )}
                    {autoNextDue && contractForm.watch('nextServiceDue') === autoNextDue && (
                      <span className="text-xs text-green-500 font-medium">✓ Auto-calculated</span>
                    )}
                  </div>
                  <input {...contractForm.register('nextServiceDue')} type="date"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select {...contractForm.register('status')}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                  <option value="active">Active</option>
                  <option value="pending_renewal">Pending Renewal</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...contractForm.register('notes')} rows={2}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetContractForm}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={contractPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {contractPending ? 'Saving...' : editContract ? 'Update Contract' : 'Add Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Vendor Form Modal ── */}
      {showVendorForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editVendor ? 'Edit Vendor' : 'New Vendor'}</h3>
              <button onClick={resetVendorForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={vendorForm.handleSubmit(d => editVendor ? updateVendorMut.mutate(d) : createVendorMut.mutate(d))}
              className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input {...vendorForm.register('name')} placeholder="e.g. Otis Elevators"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {vendorForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{vendorForm.formState.errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
                  <input {...vendorForm.register('serviceType')} placeholder="e.g. Lift Maintenance"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                  {vendorForm.formState.errors.serviceType && <p className="text-red-500 text-xs mt-1">{vendorForm.formState.errors.serviceType.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input {...vendorForm.register('contactPerson')} placeholder="Name"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input {...vendorForm.register('phone')} placeholder="Phone number"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...vendorForm.register('email')} type="email" placeholder="email@example.com"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...vendorForm.register('notes')} rows={2}
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetVendorForm}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={vendorPending}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {vendorPending ? 'Saving...' : editVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailContract && <ContractDetail contract={detailContract} onClose={() => setDetailContract(null)} />}
    </div>
  )
}
