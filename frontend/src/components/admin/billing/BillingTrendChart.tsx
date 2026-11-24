import { MonthlyTrendPoint } from '../../../api/billing'

interface Props {
  data: MonthlyTrendPoint[]
  isLoading: boolean
}

export default function BillingTrendChart({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
        <div className="flex items-end gap-3 h-28">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-gray-200 rounded-t" style={{ height: `${40 + i * 12}px` }} />
              <div className="h-2 bg-gray-200 rounded w-8" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) return null

  const maxBilled = Math.max(...data.map(d => d.totalBilled), 1)
  const BAR_HEIGHT = 96 // px — max bar height

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">📈 Collection Trend — Last 6 Months</h3>
          <p className="text-xs text-gray-400 mt-0.5">Green = collected · Gray outline = total billed</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />Collected</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm border border-gray-300 bg-gray-100 inline-block" />Billed</span>
        </div>
      </div>

      <div className="flex items-end gap-2">
        {data.map((d) => {
          const billedH = Math.round((d.totalBilled / maxBilled) * BAR_HEIGHT)
          const collectedH = d.totalBilled > 0 ? Math.round((d.totalCollected / d.totalBilled) * billedH) : 0
          const rate = d.collectionRate

          return (
            <div key={`${d.year}-${d.month}`} className="flex-1 flex flex-col items-center gap-1 group">
              {/* Rate label */}
              <span className={`text-xs font-semibold tabular-nums ${
                rate >= 80 ? 'text-green-600' : rate >= 50 ? 'text-yellow-600' : 'text-red-500'
              }`}>
                {rate}%
              </span>

              {/* Bar group */}
              <div
                className="relative w-full rounded-t border border-gray-200 bg-gray-100 overflow-hidden"
                style={{ height: `${billedH || 8}px` }}
                title={`Billed: ₹${d.totalBilled.toLocaleString('en-IN')}\nCollected: ₹${d.totalCollected.toLocaleString('en-IN')}\nRate: ${rate}%`}
              >
                {/* Collected portion (bottom) */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-green-400 rounded-t transition-all"
                  style={{ height: `${collectedH}px` }}
                />
              </div>

              {/* Month label */}
              <span className="text-xs text-gray-500 whitespace-nowrap">{d.label}</span>

              {/* Hover tooltip — amount */}
              <span className="text-xs text-gray-400 whitespace-nowrap hidden group-hover:block">
                ₹{Math.round(d.totalCollected / 1000)}k
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary row */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
        {data.length > 0 && (() => {
          const latest = data[data.length - 1]
          const prev = data.length > 1 ? data[data.length - 2] : null
          const trend = prev && prev.collectionRate > 0
            ? latest.collectionRate - prev.collectionRate
            : null
          return (
            <>
              <span>
                Latest: <strong className="text-gray-700">{latest.label}</strong>
                {' — '}₹{latest.totalCollected.toLocaleString('en-IN')} collected
              </span>
              {trend !== null && (
                <span className={trend >= 0 ? 'text-green-600' : 'text-red-500'}>
                  {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last month
                </span>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}