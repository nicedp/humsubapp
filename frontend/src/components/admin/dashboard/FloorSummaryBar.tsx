import { Link } from 'react-router-dom'
import { FlatBillStatus } from '../../../api/billing'

interface FloorEntry {
  floor: number
  paid: number
  unpaid: number
  overdue: number
  noBill: number
  total: number
}

interface Props {
  floorData: FlatBillStatus[]
  month: number
  year: number
}

function buildFloorSummary(flats: FlatBillStatus[]): FloorEntry[] {
  const byFloor: Record<number, FloorEntry> = {}
  for (const f of flats) {
    const key = f.floor ?? 0
    if (!byFloor[key]) byFloor[key] = { floor: key, paid: 0, unpaid: 0, overdue: 0, noBill: 0, total: 0 }
    byFloor[key].total++
    if (f.billStatus === 'paid') byFloor[key].paid++
    else if (f.billStatus === 'overdue') byFloor[key].overdue++
    else if (f.billStatus === 'unpaid') byFloor[key].unpaid++
    else byFloor[key].noBill++
  }
  return Object.values(byFloor).sort((a, b) => a.floor - b.floor)
}

export default function FloorSummaryBar({ floorData, month, year }: Props) {
  const floorSummary = buildFloorSummary(floorData)
  if (floorSummary.length === 0) return null

  const monthLabel = new Date(year, month - 1).toLocaleString('default', { month: 'long' })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">
          🏢 Floor-wise Bill Status — {monthLabel} {year}
        </h2>
        <Link to="/admin/billing" className="text-xs text-blue-600 hover:underline">View billing →</Link>
      </div>
      <div className="space-y-3">
        {floorSummary.map(({ floor, paid, unpaid, overdue, noBill, total }) => {
          const billed = total - noBill
          const paidPct = billed > 0 ? Math.round((paid / billed) * 100) : 0
          const overduePct = billed > 0 ? Math.round((overdue / billed) * 100) : 0
          const unpaidPct = billed > 0 ? Math.round((unpaid / billed) * 100) : 0
          const label = floor === 0 ? 'Ground' : floor === 5 ? 'Floor 5 (PH)' : `Floor ${floor}`
          return (
            <div key={floor} className="flex items-center gap-3">
              <div className="w-20 shrink-0">
                <span className="text-xs font-semibold text-gray-600">{label}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex h-5 rounded-md overflow-hidden bg-gray-100 text-xs font-medium">
                  {paidPct > 0 && (
                    <div className="bg-green-500 flex items-center justify-center text-white transition-all"
                      style={{ width: `${paidPct}%` }} title={`Paid: ${paid}`}>
                      {paidPct >= 15 ? paid : ''}
                    </div>
                  )}
                  {unpaidPct > 0 && (
                    <div className="bg-yellow-400 flex items-center justify-center text-white transition-all"
                      style={{ width: `${unpaidPct}%` }} title={`Unpaid: ${unpaid}`}>
                      {unpaidPct >= 15 ? unpaid : ''}
                    </div>
                  )}
                  {overduePct > 0 && (
                    <div className="bg-red-500 flex items-center justify-center text-white transition-all"
                      style={{ width: `${overduePct}%` }} title={`Overdue: ${overdue}`}>
                      {overduePct >= 15 ? overdue : ''}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-28 shrink-0 flex gap-2 text-xs justify-end">
                {paid > 0 && <span className="text-green-600 font-medium">{paid}✓</span>}
                {unpaid > 0 && <span className="text-yellow-600 font-medium">{unpaid}↻</span>}
                {overdue > 0 && <span className="text-red-600 font-medium">{overdue}!</span>}
                {noBill > 0 && <span className="text-gray-400">{noBill}–</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" /> Paid</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-yellow-400 inline-block" /> Unpaid</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> Overdue</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded-sm bg-gray-200 inline-block" /> No Bill</div>
      </div>
    </div>
  )
}