
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { eventsApi, SocietyEvent, EventContribution, EventExpense, EventTeamMember } from '../../api/events'
import { residentsApi } from '../../api/residents'
import BulkContributionModal from '../../components/admin/events/BulkContributionModal'
import ContributionImportModal from '../../components/admin/events/ContributionImportModal'

const eventSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  eventDate: z.string().min(1, 'Date is required'),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).default('planning'),
  budgetTarget: z.coerce.number().min(0).optional(),
})
type EventForm = z.infer<typeof eventSchema>

const contributionSchema = z.object({
  contributorName: z.string().min(1, 'Name is required'),
  flatId: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount required'),
  paymentMode: z.string().default('cash'),
  paidOn: z.string().optional(),
  notes: z.string().optional(),
})
type ContributionForm = z.infer<typeof contributionSchema>

const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().min(1, 'Amount required'),
  paidOn: z.string().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
})
type ExpenseForm = z.infer<typeof expenseSchema>

const teamSchema = z.object({
  residentId: z.string().min(1, 'Resident is required'),
  role: z.string().min(1, 'Role is required'),
  notes: z.string().optional(),
})
type TeamForm = z.infer<typeof teamSchema>

const STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}
const STATUS_LABELS: Record<string, string> = {
  planning: '📋 Planning',
  active: '🟢 Active',
  completed: '✅ Completed',
  cancelled: '❌ Cancelled',
}

const EXPENSE_CATEGORIES = ['food', 'decoration', 'sound', 'venue', 'gifts', 'logistics', 'printing', 'other']
const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque', 'other']

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}` }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Event Report Print ───────────────────────────────────────────────────────

function printEventReport(event: SocietyEvent, reportNote: string) {
  const contributions = event.contributions ?? []
  const expenses = event.expenses ?? []
  const teamMembers = event.teamMembers ?? []

  const contribRows = contributions.length
    ? contributions.map(c => `
      <tr>
        <td>${c.contributorName}</td>
        <td>${c.flatNumber ? `Flat ${c.flatNumber}` : '—'}</td>
        <td class="amt green">${fmt(c.amount)}</td>
        <td>${c.paymentMode}</td>
        <td>${c.paidOn ? fmtDate(c.paidOn) : '—'}</td>
        <td>${c.notes ?? '—'}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:12px">No contributions recorded</td></tr>`

  const expenseRows = expenses.length
    ? expenses.map(e => `
      <tr>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td class="amt red">${fmt(e.amount)}</td>
        <td>${e.vendor ?? '—'}</td>
        <td>${e.paidOn ? fmtDate(e.paidOn) : '—'}</td>
        <td>${e.notes ?? '—'}</td>
      </tr>`).join('')
    : `<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:12px">No expenses recorded</td></tr>`

  const teamSection = teamMembers.length
    ? `<section class="section">
        <h2>👥 Core Team (${teamMembers.length})</h2>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Notes</th></tr></thead>
          <tbody>${teamMembers.map(m => `
            <tr>
              <td>${m.residentName ?? '—'}</td>
              <td>${m.role}</td>
              <td>${m.notes ?? '—'}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </section>`
    : ''

  const budgetLine = event.budgetTarget
    ? `<p><strong>Budget Target:</strong> ${fmt(event.budgetTarget)}&nbsp;&nbsp;
       <strong>Budget Utilisation:</strong> ${Math.round((event.totalSpent / event.budgetTarget) * 100)}%</p>`
    : ''

  const noteLine = reportNote.trim()
    ? `<div class="note-box">
         <strong>📝 Report Notes / Summary</strong>
         <p style="margin-top:6px;white-space:pre-wrap">${reportNote.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
       </div>`
    : ''

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Event Report — ${event.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1f2937; padding: 32px 40px; }
    .header { border-bottom: 3px solid #f97316; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; font-weight: 700; color: #f97316; }
    .header .meta { color: #6b7280; font-size: 12px; margin-top: 4px; }
    .header .status-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #f3f4f6; color: #374151; margin-left: 8px; }
    .header .desc { color: #374151; font-size: 13px; margin-top: 8px; font-style: italic; }
    .kpi-row { display: flex; gap: 16px; margin-bottom: 24px; }
    .kpi { flex: 1; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; text-align: center; }
    .kpi .label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .kpi .value { font-size: 20px; font-weight: 700; }
    .kpi.green .value { color: #16a34a; }
    .kpi.red .value { color: #dc2626; }
    .kpi.blue .value { color: #2563eb; }
    .kpi.orange .value { color: #ea580c; }
    .section { margin-bottom: 28px; }
    .section h2 { font-size: 14px; font-weight: 700; color: #374151; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e5e7eb; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f9fafb; text-align: left; padding: 8px 10px; font-weight: 600; color: #6b7280; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
    td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) { background: #fafafa; }
    .amt { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
    .amt.green { color: #16a34a; }
    .amt.red { color: #dc2626; }
    .total-row { background: #f9fafb !important; font-weight: 700; }
    .total-row td { border-top: 2px solid #e5e7eb; }
    .note-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px; color: #9ca3af; font-size: 11px; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 ${event.name} <span class="status-badge">${STATUS_LABELS[event.status] ?? event.status}</span></h1>
    <div class="meta">
      📅 ${fmtDate(event.eventDate)}
      &nbsp;·&nbsp; 👥 ${teamMembers.length} core team member${teamMembers.length !== 1 ? 's' : ''}
      &nbsp;·&nbsp; 💰 ${contributions.length} contributor${contributions.length !== 1 ? 's' : ''}
    </div>
    ${event.description ? `<div class="desc">${event.description}</div>` : ''}
  </div>

  <div class="kpi-row">
    <div class="kpi green">
      <div class="label">Total Collected</div>
      <div class="value">${fmt(event.totalCollected)}</div>
    </div>
    <div class="kpi red">
      <div class="label">Total Spent</div>
      <div class="value">${fmt(event.totalSpent)}</div>
    </div>
    <div class="kpi ${event.netBalance >= 0 ? 'blue' : 'red'}">
      <div class="label">Net Balance</div>
      <div class="value">${fmt(event.netBalance)}</div>
    </div>
    <div class="kpi orange">
      <div class="label">Contributors</div>
      <div class="value">${contributions.length}</div>
    </div>
  </div>

  ${budgetLine ? `<div class="section" style="margin-bottom:16px;font-size:13px;color:#374151">${budgetLine}</div>` : ''}

  ${noteLine}

  <section class="section">
    <h2>💰 Contributions (${contributions.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Contributor</th><th>Flat</th><th style="text-align:right">Amount</th>
          <th>Mode</th><th>Paid On</th><th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${contribRows}
        ${contributions.length > 0 ? `<tr class="total-row">
          <td colspan="2"><strong>Total Collected</strong></td>
          <td class="amt green">${fmt(event.totalCollected)}</td>
          <td colspan="3"></td>
        </tr>` : ''}
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2>🧾 Expenses (${expenses.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Item</th><th>Category</th><th style="text-align:right">Amount</th>
          <th>Vendor</th><th>Paid On</th><th>Notes</th>
        </tr>
      </thead>
      <tbody>
        ${expenseRows}
        ${expenses.length > 0 ? `<tr class="total-row">
          <td colspan="2"><strong>Total Spent</strong></td>
          <td class="amt red">${fmt(event.totalSpent)}</td>
          <td colspan="3"></td>
        </tr>` : ''}
      </tbody>
    </table>
  </section>

  ${teamSection}

  <div class="footer">
    <span>Society Management Portal — Event Report</span>
    <span>Generated: ${new Date().toLocaleString('en-IN')}</span>
  </div>

  <script>window.onload = function() { window.print(); window.addEventListener('afterprint', function() { window.close(); }); }</script>
</body>
</html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (w) {
    w.document.write(html)
    w.document.close()
  }
}

// ─── Event Report Modal ───────────────────────────────────────────────────────

function EventReportModal({ event, onClose }: { event: SocietyEvent; onClose: () => void }) {
  const [note, setNote] = useState('')
  const { data: detail, isLoading } = useQuery({
    queryKey: ['event-detail', event.id],
    queryFn: () => eventsApi.getById(event.id),
  })
  const d = detail ?? event

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">📄 Event Report</h3>
            <p className="text-xs text-gray-500 mt-0.5">{event.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          {isLoading && (
            <div className="text-center text-sm text-gray-400 py-2">Loading event details…</div>
          )}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Collected</p>
              <p className="font-bold text-green-600">{fmt(d.totalCollected)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Spent</p>
              <p className="font-bold text-red-500">{fmt(d.totalSpent)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Balance</p>
              <p className={`font-bold ${d.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(d.netBalance)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              📝 Report Notes / Summary <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
              placeholder="Add a closing note, highlights, acknowledgements or any summary for this event report…"
              className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none resize-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            The report includes event details, all contributions, all expenses, team members and your note above.
          </p>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => { printEventReport(d, note); onClose() }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              🖨️ Print / Share Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Event Detail Drawer ──────────────────────────────────────────────────────

function EventDetail({ event, onClose, onReport }: { event: SocietyEvent; onClose: () => void; onReport: () => void }) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'contributions' | 'expenses' | 'team'>('contributions')
  const [showBulk, setShowBulk] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const { data: detail, isLoading } = useQuery({
    queryKey: ['event-detail', event.id],
    queryFn: () => eventsApi.getById(event.id),
  })

  const { data: residentsData } = useQuery({
    queryKey: ['residents-dropdown'],
    queryFn: () => residentsApi.list({ limit: 200 }),
  })
  const residents = residentsData?.data ?? []

  const contribForm = useForm<ContributionForm>({ resolver: zodResolver(contributionSchema) })
  const addContribMut = useMutation({
    mutationFn: (d: ContributionForm) => eventsApi.addContribution(event.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      qc.invalidateQueries({ queryKey: ['events'] })
      contribForm.reset()
      toast.success('Contribution added')
    },
    onError: () => toast.error('Failed to add contribution'),
  })
  const delContribMut = useMutation({
    mutationFn: (cid: string) => eventsApi.deleteContribution(event.id, cid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Contribution removed')
    },
    onError: () => toast.error('Failed to remove'),
  })

  const expForm = useForm<ExpenseForm>({ resolver: zodResolver(expenseSchema) })
  const addExpMut = useMutation({
    mutationFn: (d: ExpenseForm) => eventsApi.addExpense(event.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      qc.invalidateQueries({ queryKey: ['events'] })
      expForm.reset()
      toast.success('Expense added')
    },
    onError: () => toast.error('Failed to add expense'),
  })
  const delExpMut = useMutation({
    mutationFn: (eid: string) => eventsApi.deleteExpense(event.id, eid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      qc.invalidateQueries({ queryKey: ['events'] })
      toast.success('Expense removed')
    },
    onError: () => toast.error('Failed to remove'),
  })

  const teamForm = useForm<TeamForm>({ resolver: zodResolver(teamSchema) })
  const addTeamMut = useMutation({
    mutationFn: (d: TeamForm) => eventsApi.addTeamMember(event.id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      teamForm.reset()
      toast.success('Team member added')
    },
    onError: () => toast.error('Failed to add team member'),
  })
  const delTeamMut = useMutation({
    mutationFn: (mid: string) => eventsApi.deleteTeamMember(event.id, mid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
      toast.success('Removed')
    },
    onError: () => toast.error('Failed to remove'),
  })

  const d = detail ?? event

  return (
    <div className="fixed inset-0 z-40 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-yellow-50 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{d.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">📅 {fmtDate(d.eventDate)}</p>
            {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={onReport}
              title="Generate printable report"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
              📄 Report
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="px-6 py-3 bg-white border-b grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500">Collected</p>
            <p className="text-lg font-bold text-green-600">{fmt(d.totalCollected)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Spent</p>
            <p className="text-lg font-bold text-red-500">{fmt(d.totalSpent)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Balance</p>
            <p className={`text-lg font-bold ${d.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(d.netBalance)}</p>
          </div>
        </div>

        <div className="flex border-b px-6">
          {(['contributions', 'expenses', 'team'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-4 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${tab === t ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'contributions' ? `💰 Contributions (${d.contributions?.length ?? 0})`
                : t === 'expenses' ? `🧾 Expenses (${d.expenses?.length ?? 0})`
                : `👥 Team (${d.teamMembers?.length ?? 0})`}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && <p className="text-gray-400 text-sm text-center py-4">Loading...</p>}

          {tab === 'contributions' && (
            <div className="space-y-4">
              {/* Bulk / Import action buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulk(true)}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                  ⚡ Bulk Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowImport(true)}
                  className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                  📥 Import CSV
                </button>
              </div>

              <form onSubmit={contribForm.handleSubmit(v => addContribMut.mutate(v))}
                className="bg-orange-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-orange-700">Add Contribution</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input {...contribForm.register('contributorName')} placeholder="Name *"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                    {contribForm.formState.errors.contributorName && (
                      <p className="text-red-500 text-xs mt-1">{contribForm.formState.errors.contributorName.message}</p>
                    )}
                  </div>
                  <input {...contribForm.register('amount')} type="number" placeholder="Amount ₹ *"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select {...contribForm.register('paymentMode')}
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none">
                    {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input {...contribForm.register('paidOn')} type="date"
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                  <input {...contribForm.register('notes')} placeholder="Notes"
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                </div>
                <button type="submit" disabled={addContribMut.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {addContribMut.isPending ? 'Adding...' : '+ Add'}
                </button>
              </form>

              {(d.contributions ?? []).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-5xl mb-3">💰</p>
                  <p className="font-semibold text-gray-700">No contributions yet</p>
                  <p className="text-sm text-gray-400 mt-1">Add the first contribution above</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(d.contributions ?? []).map((c: EventContribution) => (
                    <div key={c.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{c.contributorName}</p>
                        <p className="text-xs text-gray-500">
                          {c.flatNumber ? `Flat ${c.flatNumber} · ` : ''}{c.paymentMode}
                          {c.paidOn ? ` · ${fmtDate(c.paidOn)}` : ''}
                          {c.notes ? ` · ${c.notes}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-green-600 text-sm">{fmt(c.amount)}</span>
                        <button onClick={() => delContribMut.mutate(c.id)}
                          className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'expenses' && (
            <div className="space-y-4">
              <form onSubmit={expForm.handleSubmit(v => addExpMut.mutate(v))}
                className="bg-red-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-red-700">Add Expense</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input {...expForm.register('title')} placeholder="Title *"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                    {expForm.formState.errors.title && (
                      <p className="text-red-500 text-xs mt-1">{expForm.formState.errors.title.message}</p>
                    )}
                  </div>
                  <input {...expForm.register('amount')} type="number" placeholder="Amount ₹ *"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select {...expForm.register('category')}
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none">
                    <option value="">Category *</option>
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input {...expForm.register('paidOn')} type="date"
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                  <input {...expForm.register('vendor')} placeholder="Vendor name"
                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none" />
                </div>
                <button type="submit" disabled={addExpMut.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {addExpMut.isPending ? 'Adding...' : '+ Add'}
                </button>
              </form>

              {(d.expenses ?? []).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-5xl mb-3">🧾</p>
                  <p className="font-semibold text-gray-700">No expenses yet</p>
                  <p className="text-sm text-gray-400 mt-1">Log event expenses here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(d.expenses ?? []).map((e: EventExpense) => (
                    <div key={e.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{e.title}</p>
                        <p className="text-xs text-gray-500">
                          {e.category}{e.vendor ? ` · ${e.vendor}` : ''}{e.paidOn ? ` · ${fmtDate(e.paidOn)}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-red-500 text-sm">{fmt(e.amount)}</span>
                        <button onClick={() => delExpMut.mutate(e.id)}
                          className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'team' && (
            <div className="space-y-4">
              <form onSubmit={teamForm.handleSubmit(v => addTeamMut.mutate(v))}
                className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-700">Add Team Member</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <select {...teamForm.register('residentId')}
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none">
                      <option value="">Select resident *</option>
                      {residents.map(r => (
                        <option key={r.id} value={r.id}>{r.name} ({r.flatNumber})</option>
                      ))}
                    </select>
                    {teamForm.formState.errors.residentId && (
                      <p className="text-red-500 text-xs mt-1">{teamForm.formState.errors.residentId.message}</p>
                    )}
                  </div>
                  <div>
                    <input {...teamForm.register('role')} placeholder="Role (e.g. Coordinator) *"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none" />
                    {teamForm.formState.errors.role && (
                      <p className="text-red-500 text-xs mt-1">{teamForm.formState.errors.role.message}</p>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={addTeamMut.isPending}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {addTeamMut.isPending ? 'Adding...' : '+ Add'}
                </button>
              </form>

              {(d.teamMembers ?? []).length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-5xl mb-3">👥</p>
                  <p className="font-semibold text-gray-700">No team members yet</p>
                  <p className="text-sm text-gray-400 mt-1">Build your event core team</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(d.teamMembers ?? []).map((m: EventTeamMember) => (
                    <div key={m.id} className="flex items-center justify-between bg-white border rounded-xl px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{m.residentName ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                      <button onClick={() => delTeamMut.mutate(m.id)}
                        className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Contribution Modal */}
      {showBulk && (
        <BulkContributionModal
          eventId={event.id}
          eventName={event.name}
          onClose={() => setShowBulk(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
            qc.invalidateQueries({ queryKey: ['events'] })
            toast.success('Contributions saved!')
            setShowBulk(false)
          }}
        />
      )}

      {/* CSV Import Modal */}
      {showImport && (
        <ContributionImportModal
          eventId={event.id}
          eventName={event.name}
          onClose={() => setShowImport(false)}
          onImported={() => {
            qc.invalidateQueries({ queryKey: ['event-detail', event.id] })
            qc.invalidateQueries({ queryKey: ['events'] })
            toast.success('Contributions imported!')
          }}
        />
      )}
    </div>
  )
}

// ─── Main Events Page ─────────────────────────────────────────────────────────

export default function Events() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editEvent, setEditEvent] = useState<SocietyEvent | null>(null)
  const [detailEvent, setDetailEvent] = useState<SocietyEvent | null>(null)
  const [reportEvent, setReportEvent] = useState<SocietyEvent | null>(null)
  const [filterStatus, setFilterStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['events', filterStatus],
    queryFn: () => eventsApi.list(filterStatus ? { status: filterStatus } : {}),
  })
  const events = data?.data ?? []

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: { status: 'planning' },
  })

  const resetForm = () => {
    form.reset({ status: 'planning' })
    setEditEvent(null)
    setShowForm(false)
  }

  const createMut = useMutation({
    mutationFn: (d: EventForm) => eventsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event created!'); resetForm() },
    onError: () => toast.error('Failed to create event'),
  })

  const updateMut = useMutation({
    mutationFn: (d: EventForm) => eventsApi.update(editEvent!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event updated!'); resetForm() },
    onError: () => toast.error('Failed to update event'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => eventsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['events'] }); toast.success('Event deleted') },
    onError: () => toast.error('Failed to delete event'),
  })

  const openEdit = (ev: SocietyEvent) => {
    setEditEvent(ev)
    form.reset({
      name: ev.name,
      description: ev.description ?? '',
      eventDate: ev.eventDate.split('T')[0],
      status: ev.status,
      budgetTarget: ev.budgetTarget ?? undefined,
    })
    setShowForm(true)
  }

  const onSubmit = (d: EventForm) => {
    if (editEvent) updateMut.mutate(d)
    else createMut.mutate(d)
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎉 Society Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage events, contributions, expenses and core team</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
          + New Event
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(['', 'planning', 'active', 'completed', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filterStatus === s ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}>
            {s === '' ? 'All Events' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editEvent ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
                <input {...form.register('name')} placeholder="e.g. Ganesh Chaturthi 2026"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                {form.formState.errors.name && <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea {...form.register('description')} rows={2} placeholder="Brief description..."
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input {...form.register('eventDate')} type="date"
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
                  {form.formState.errors.eventDate && <p className="text-red-500 text-xs mt-1">{form.formState.errors.eventDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select {...form.register('status')}
                    className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none">
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Target (₹)</label>
                <input {...form.register('budgetTarget')} type="number" placeholder="0"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-300 focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {isPending ? 'Saving...' : editEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-5xl mb-3">🎉</p>
          <p className="font-semibold text-gray-700">No events yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first society event</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setDetailEvent(ev)}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{ev.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">📅 {fmtDate(ev.eventDate)}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[ev.status]}`}>
                    {STATUS_LABELS[ev.status]}
                  </span>
                </div>
                {ev.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{ev.description}</p>}
                <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-xl p-3">
                  <div>
                    <p className="text-xs text-gray-400">Collected</p>
                    <p className="text-sm font-bold text-green-600">{fmt(ev.totalCollected)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Spent</p>
                    <p className="text-sm font-bold text-red-500">{fmt(ev.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Balance</p>
                    <p className={`text-sm font-bold ${ev.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{fmt(ev.netBalance)}</p>
                  </div>
                </div>
                {ev.budgetTarget && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Budget progress</span>
                      <span>{Math.round((ev.totalCollected / ev.budgetTarget) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-400 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (ev.totalCollected / ev.budgetTarget) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 pb-4 flex gap-2" onClick={e => e.stopPropagation()}>
                <button onClick={() => openEdit(ev)}
                  className="flex-1 text-xs border border-gray-200 text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                  ✏️ Edit
                </button>
                <button onClick={() => setReportEvent(ev)}
                  className="flex-1 text-xs border border-orange-200 text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 font-medium">
                  📄 Report
                </button>
                <button onClick={() => { if (window.confirm('Delete this event?')) deleteMut.mutate(ev.id) }}
                  className="flex-1 text-xs border border-red-100 text-red-500 py-1.5 rounded-lg hover:bg-red-50 font-medium">
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {detailEvent && (
        <EventDetail
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onReport={() => { setReportEvent(detailEvent); setDetailEvent(null) }}
        />
      )}

      {reportEvent && (
        <EventReportModal
          event={reportEvent}
          onClose={() => setReportEvent(null)}
        />
      )}
    </div>
  )
}
