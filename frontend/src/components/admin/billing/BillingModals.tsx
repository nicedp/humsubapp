import { Flat } from '../../../types'
import { MONTHS_SHORT as MONTHS } from '../../../constants/labels'

// ─── Confirm Modal (Group 2 — replaces window.confirm()) ────────
interface ConfirmModalProps {
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}
export function ConfirmModal({ message, confirmLabel = 'Confirm', onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-3 mb-5">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <p className="text-gray-800 text-sm leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Generate Bills Modal (Group 6 — with preview info) ─────────
interface GenForm { month: number; year: number; dueDayOfMonth: number }
interface GenModalProps {
  form: GenForm
  years: number[]
  isPending: boolean
  existingCount?: number   // how many bills already generated for this period
  occupiedCount?: number   // total occupied flats
  onChange: (f: GenForm) => void
  onSubmit: () => void
  onClose: () => void
}
export function GenerateBillsModal({ form, years, isPending, existingCount, occupiedCount, onChange, onSubmit, onClose }: GenModalProps) {
  const willGenerate = occupiedCount !== undefined && existingCount !== undefined
    ? Math.max(0, occupiedCount - existingCount)
    : null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Generate Monthly Bills</h2>
        <p className="text-sm text-gray-500 mb-4">Creates one bill per occupied flat for the selected month/year.</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={form.month} onChange={e => onChange({ ...form, month: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select value={form.year} onChange={e => onChange({ ...form, year: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Day of Month</label>
            <input type="number" min={1} max={28} value={form.dueDayOfMonth}
              onChange={e => onChange({ ...form, dueDayOfMonth: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <p className="text-xs text-gray-400 mt-1">Bills due on the {form.dueDayOfMonth}{form.dueDayOfMonth === 1 ? 'st' : form.dueDayOfMonth === 2 ? 'nd' : form.dueDayOfMonth === 3 ? 'rd' : 'th'} of {MONTHS[form.month - 1]} {form.year}</p>
          </div>

          {/* Preview box — Group 6 */}
          {(willGenerate !== null || existingCount !== undefined) && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              existingCount && existingCount > 0 && willGenerate === 0
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <p className="font-semibold text-gray-800 mb-1.5">📋 Preview</p>
              {occupiedCount !== undefined && (
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Occupied flats</span>
                  <span className="font-medium">{occupiedCount}</span>
                </div>
              )}
              {existingCount !== undefined && (
                <div className="flex justify-between text-xs text-gray-600 mt-0.5">
                  <span>Already billed this month</span>
                  <span className="font-medium text-amber-700">{existingCount}</span>
                </div>
              )}
              {willGenerate !== null && (
                <div className={`flex justify-between text-xs font-bold mt-1.5 pt-1.5 border-t ${existingCount && existingCount > 0 ? 'border-amber-200' : 'border-blue-200'}`}>
                  <span>Will be created</span>
                  <span className={willGenerate === 0 ? 'text-amber-600' : 'text-blue-700'}>
                    {willGenerate === 0 ? '0 — all already billed ✓' : `${willGenerate} new bills`}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={onSubmit} disabled={isPending || willGenerate === 0}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              {isPending ? 'Generating...' : willGenerate === 0 ? 'Nothing to Generate' : 'Generate Bills'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Single Bill Modal ───────────────────────────────────────────
interface SingleForm {
  flatId: string; months: number[]; year: number
  rangeMode: boolean; fromMonth: number; fromYear: number; toMonth: number; toYear: number
  dueDate: string; amount: string
}
interface SingleModalProps {
  form: SingleForm
  flats: Flat[]
  flatsLoading: boolean
  isPending: boolean
  years: number[]
  flatSearch: string
  showFlatDropdown: boolean
  onChange: (f: SingleForm) => void
  onFlatSearch: (s: string) => void
  onFlatDropdown: (v: boolean) => void
  onSubmit: () => void
  onClose: () => void
}
export function SingleBillModal({
  form, flats, flatsLoading, isPending, years, flatSearch, showFlatDropdown,
  onChange, onFlatSearch, onFlatDropdown, onSubmit, onClose,
}: SingleModalProps) {
  const selectedFlatObj = flats.find(f => f.id === form.flatId)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Create Bill(s) for Flat</h2>
        <p className="text-sm text-gray-500 mb-4">Select a flat and one or more months to create bills.</p>
        <div className="space-y-4">
          {/* Flat combobox */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat</label>
            <input type="text" autoComplete="off" placeholder="Type flat number e.g. F2-05..."
              value={flatSearch || (selectedFlatObj?.flatNumber ?? '')}
              onChange={e => { onFlatSearch(e.target.value); onChange({ ...form, flatId: '' }); onFlatDropdown(true) }}
              onFocus={() => onFlatDropdown(true)}
              onBlur={() => setTimeout(() => onFlatDropdown(false), 150)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {form.flatId && (
              <button type="button" onClick={() => { onChange({ ...form, flatId: '' }); onFlatSearch('') }}
                className="absolute right-2 top-9 text-gray-400 hover:text-gray-600 text-xs">✕</button>
            )}
            {showFlatDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {flats.filter(f => f.flatNumber.toLowerCase().includes(flatSearch.toLowerCase())).slice(0, 20).map(f => (
                  <button key={f.id} type="button"
                    onMouseDown={() => { onChange({ ...form, flatId: f.id }); onFlatSearch(''); onFlatDropdown(false) }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${form.flatId === f.id ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-800'}`}>
                    <span>{f.flatNumber}</span>
                    <span className="text-xs text-gray-400">Floor {f.floor} · {f.status === 'occupied' ? <span className="text-green-600">occupied ✓</span> : <span className="text-gray-400">vacant</span>}</span>
                  </button>
                ))}
                {flats.filter(f => f.flatNumber.toLowerCase().includes(flatSearch.toLowerCase())).length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-400">No flats match</p>
                )}
              </div>
            )}
            {form.flatId && <p className="text-xs text-green-600 mt-1">✓ Selected: {selectedFlatObj?.flatNumber}</p>}
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            {(['Simple', 'Range (cross-year)'] as const).map((label, i) => {
              const isRange = i === 1
              return (
                <button key={label} type="button" onClick={() => onChange({ ...form, rangeMode: isRange })}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${form.rangeMode === isRange ? 'bg-white shadow text-blue-700 border border-blue-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  {label}
                </button>
              )
            })}
          </div>

          {!form.rangeMode ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Months</label>
                  <div className="flex gap-2 text-xs">
                    <button type="button" onClick={() => onChange({ ...form, months: [1,2,3,4,5,6,7,8,9,10,11,12] })} className="text-blue-600 hover:underline">All</button>
                    <button type="button" onClick={() => onChange({ ...form, months: [] })} className="text-gray-400 hover:underline">None</button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS.map((m, i) => {
                    const val = i + 1
                    const checked = form.months.includes(val)
                    return (
                      <label key={i} className={`flex items-center justify-center px-2 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-colors ${checked ? 'bg-blue-600 border-blue-600 text-white font-medium' : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'}`}>
                        <input type="checkbox" className="sr-only" checked={checked}
                          onChange={() => onChange({ ...form, months: checked ? form.months.filter(x => x !== val) : [...form.months, val].sort((a, b) => a - b) })} />
                        {m}
                      </label>
                    )
                  })}
                </div>
                {form.months.length > 0 && <p className="text-xs text-blue-600 mt-1">{form.months.length} month{form.months.length > 1 ? 's' : ''} selected</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select value={form.year} onChange={e => onChange({ ...form, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => onChange({ ...form, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.fromMonth} onChange={e => onChange({ ...form, fromMonth: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                  <select value={form.fromYear} onChange={e => onChange({ ...form, fromYear: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={form.toMonth} onChange={e => onChange({ ...form, toMonth: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                  <select value={form.toYear} onChange={e => onChange({ ...form, toYear: Number(e.target.value) })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {(() => {
                  const fromKey = form.fromYear * 100 + form.fromMonth
                  const toKey = form.toYear * 100 + form.toMonth
                  if (toKey < fromKey) return <p className="text-xs text-red-500 mt-1">⚠ "To" must be after "From"</p>
                  let count = 0, y = form.fromYear, m = form.fromMonth
                  while (y * 100 + m <= toKey) { count++; m++; if (m > 12) { m = 1; y++ } }
                  return <p className="text-xs text-blue-600 mt-1">{count} month{count !== 1 ? 's' : ''} selected ({MONTHS[form.fromMonth - 1]} {form.fromYear} → {MONTHS[form.toMonth - 1]} {form.toYear})</p>
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => onChange({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) — optional</label>
            <input type="number" min={0} placeholder="Leave blank to auto-calculate" value={form.amount}
              onChange={e => onChange({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <p className="text-xs text-gray-400 mt-1">If blank, calculated from sqFt × rate + fixed charge</p>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={onSubmit} disabled={
              isPending || !form.flatId || !form.dueDate ||
              (!form.rangeMode && form.months.length === 0) ||
              (form.rangeMode && (form.fromYear * 100 + form.fromMonth) > (form.toYear * 100 + form.toMonth))
            } className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300">
              {isPending ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Record Payment Modal (Group 3 — Pay Full button + breakdown) ─
interface PayForm { amountPaid: number; paymentMode: string; notes: string; paidOn: string }
interface PayModalProps {
  billLabel: string
  baseAmount: number
  lateFee: number
  totalDue: number
  form: PayForm
  isPending: boolean
  onChange: (f: PayForm) => void
  onSubmit: () => void
  onClose: () => void
}
export function RecordPaymentModal({ billLabel, baseAmount, lateFee, totalDue, form, isPending, onChange, onSubmit, onClose }: PayModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Record Payment</h2>
        <p className="text-sm text-gray-500 mb-3">{billLabel}</p>

        {/* Amount breakdown */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 mb-4 text-sm space-y-1.5">
          <div className="flex justify-between text-gray-600">
            <span>Base maintenance</span>
            <span>₹{baseAmount.toLocaleString('en-IN')}</span>
          </div>
          {lateFee > 0 && (
            <div className="flex justify-between text-orange-600">
              <span>Late fee</span>
              <span>+ ₹{lateFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
            <span>Total Due</span>
            <span>₹{totalDue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Amount Paid (₹)</label>
              {/* Pay Full quick-fill button */}
              <button type="button"
                onClick={() => onChange({ ...form, amountPaid: totalDue })}
                className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors ${
                  form.amountPaid === totalDue
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                }`}>
                💯 Pay Full ₹{totalDue.toLocaleString('en-IN')}
              </button>
            </div>
            <input type="number" min="1" value={form.amountPaid}
              onChange={e => onChange({ ...form, amountPaid: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 'cash', icon: '💵', label: 'Cash' },
                { val: 'upi', icon: '📱', label: 'UPI' },
                { val: 'bank_transfer', icon: '🏦', label: 'Bank' },
                { val: 'cheque', icon: '📝', label: 'Cheque' },
              ].map(({ val, icon, label }) => (
                <button key={val} type="button"
                  onClick={() => onChange({ ...form, paymentMode: val })}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-lg border text-xs font-medium transition-colors ${
                    form.paymentMode === val
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}>
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paid On</label>
            <input type="date" value={form.paidOn} onChange={e => onChange({ ...form, paidOn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
            <input value={form.notes} onChange={e => onChange({ ...form, notes: e.target.value })}
              placeholder="e.g. UTR#12345 or cheque no."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={onSubmit} disabled={isPending || form.amountPaid <= 0}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400">
              {isPending ? 'Saving...' : '✓ Record Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Bill Modal ─────────────────────────────────────────────
interface EditForm { dueDate: string; amount: string }
interface EditModalProps {
  billLabel: string
  form: EditForm
  isPending: boolean
  onChange: (f: EditForm) => void
  onSubmit: () => void
  onClose: () => void
}
export function EditBillModal({ billLabel, form, isPending, onChange, onSubmit, onClose }: EditModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Bill</h2>
        <p className="text-sm text-gray-500 mb-4">{billLabel}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => onChange({ ...form, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
            <input type="number" min={1} value={form.amount}
              onChange={e => onChange({ ...form, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg">Cancel</button>
            <button onClick={onSubmit} disabled={isPending}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
              {isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}