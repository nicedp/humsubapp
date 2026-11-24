import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { expensesApi, ExpenseCategoryItem } from '../../api/expenses'
import { FALLBACK_COLORS } from '../../constants/labels'

// Print-only styles injected once
const PRINT_STYLE = `
@media print {
  .no-print { display: none !important; }
  body { background: white; }
  .print-break { page-break-before: always; }
}
`

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]

function buildColorMap(cats: ExpenseCategoryItem[]): Record<string, string> {
  const map: Record<string, string> = {}
  cats.forEach((c, i) => {
    map[c.slug] = c.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
  })
  return map
}

function buildLabelMap(cats: ExpenseCategoryItem[]): Record<string, string> {
  const map: Record<string, string> = {}
  cats.forEach(c => { map[c.slug] = c.name })
  return map
}

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) {
  if (percentage < 4) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${percentage.toFixed(1)}%`}
    </text>
  )
}

export default function ExpenseAnalytics() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [yoyYears, setYoyYears] = useState(3)

  // Inject print styles once
  React.useEffect(() => {
    const id = 'analytics-print-style'
    if (!document.getElementById(id)) {
      const s = document.createElement('style')
      s.id = id
      s.textContent = PRINT_STYLE
      document.head.appendChild(s)
    }
  }, [])

  // Fetch all categories (for colors + labels)
  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.categories.list(),
    staleTime: 60_000,
  })

  const categoryColors = useMemo(() => buildColorMap(categories), [categories])
  const categoryLabels = useMemo(() => buildLabelMap(categories), [categories])

  // Category breakdown for selected year
  const { data: breakdown, isLoading: loadingBreakdown } = useQuery({
    queryKey: ['expense-category-breakdown', selectedYear],
    queryFn: () => expensesApi.getCategoryBreakdown(selectedYear),
    staleTime: 60_000,
  })

  // Year-over-year data
  const { data: yoyData, isLoading: loadingYoy } = useQuery({
    queryKey: ['expense-yoy', yoyYears],
    queryFn: () => expensesApi.getYearOverYear(yoyYears),
    staleTime: 60_000,
  })

  // Vendor summary for selected year
  const { data: vendorData = [], isLoading: loadingVendors } = useQuery({
    queryKey: ['expense-vendor-summary', selectedYear],
    queryFn: () => expensesApi.getVendorSummary(selectedYear),
    staleTime: 60_000,
  })

  // Pie chart data — built from breakdown, uses dynamic colors
  const pieData = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return []
    return breakdown.map(b => ({
      name: categoryLabels[b.category] ?? b.category,
      value: b.total,
      percentage: b.percentage,
      color: categoryColors[b.category] ?? '#6b7280',
      slug: b.category,
    }))
  }, [breakdown, categoryColors, categoryLabels])

  // YoY grouped bar chart data — one row per year, one key per category slug
  const yoyChartData = useMemo(() => {
    if (!yoyData) return []
    return yoyData.map(row => {
      const entry: Record<string, any> = { year: String(row.year) }
      categories.forEach(cat => {
        entry[cat.slug] = row.categories[cat.slug] ?? 0
      })
      entry.grandTotal = row.grandTotal
      return entry
    })
  }, [yoyData, categories])

  const grandTotal = useMemo(() => breakdown?.reduce((s, b) => s + b.total, 0) ?? 0, [breakdown])

  const vendorMaxTotal = vendorData.length > 0 ? vendorData[0].total : 1

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Category breakdown and year-over-year trends</p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5"
          >
            🖨️ Export PDF
          </button>
          <Link
            to="/admin/expenses"
            className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
          >
            ← Back to Expenses
          </Link>
        </div>
      </div>

      {/* ── Section 1: Category Breakdown ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Category Breakdown</h2>
            <p className="text-sm text-gray-500">Where is the society spending money?</p>
          </div>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="no-print px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {loadingBreakdown ? (
          <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">Loading…</div>
        ) : pieData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">🥧</div>
            <p className="font-medium">No expense data for {selectedYear}</p>
            <p className="text-sm mt-1">Record expenses to see the breakdown</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Pie chart */}
            <div className="w-full lg:w-1/2" style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomLabel}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [fmt(value), 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Legend
                    formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category summary table */}
            <div className="w-full lg:w-1/2">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
                Total: <span className="text-gray-800 text-sm normal-case font-bold">{fmt(grandTotal)}</span>
              </div>
              <div className="space-y-3">
                {pieData.map((d, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="text-sm font-medium text-gray-700">{d.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-800">{fmt(d.value)}</span>
                        <span className="text-xs text-gray-400 ml-2">{d.percentage}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${d.percentage}%`, background: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Year-over-Year ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Year-over-Year Comparison</h2>
            <p className="text-sm text-gray-500">Category spend across years — stacked view</p>
          </div>
          <select
            value={yoyYears}
            onChange={e => setYoyYears(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2}>Last 2 years</option>
            <option value={3}>Last 3 years</option>
            <option value={4}>Last 4 years</option>
            <option value={5}>Last 5 years</option>
          </select>
        </div>

        {loadingYoy ? (
          <div className="h-72 flex items-center justify-center text-gray-400 animate-pulse">Loading…</div>
        ) : yoyChartData.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-medium">No data available</p>
          </div>
        ) : (
          <>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="year" tick={{ fontSize: 13, fill: '#6b7280' }} />
                  <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [fmt(value), categoryLabels[name] ?? name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                  />
                  <Legend formatter={(value) => categoryLabels[value] ?? value} />
                  {categories.map(cat => (
                    <Bar
                      key={cat.slug}
                      dataKey={cat.slug}
                      stackId="a"
                      fill={categoryColors[cat.slug] ?? '#6b7280'}
                      name={cat.slug}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* YoY summary table */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Category</th>
                    {yoyData?.map(r => (
                      <th key={r.year} className="px-3 py-2 text-right font-medium text-gray-600">{r.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {categories.map(cat => (
                    <tr key={cat.slug} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: categoryColors[cat.slug] ?? '#6b7280' }} />
                          <span className="text-gray-700">{cat.name}</span>
                        </div>
                      </td>
                      {yoyData?.map(r => (
                        <td key={r.year} className="px-3 py-2 text-right text-gray-700">
                          {r.categories[cat.slug] ? fmt(r.categories[cat.slug]) : <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-semibold border-t border-gray-200">
                    <td className="px-3 py-2 text-gray-700">Total</td>
                    {yoyData?.map(r => (
                      <td key={r.year} className="px-3 py-2 text-right text-gray-900">{fmt(r.grandTotal)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Section 3: Top Vendors ───────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 print-break">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Top Vendors</h2>
            <p className="text-sm text-gray-500">Highest spend vendors for {selectedYear}</p>
          </div>
          <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
            Top 10 by spend
          </span>
        </div>

        {loadingVendors ? (
          <div className="h-48 flex items-center justify-center text-gray-400 animate-pulse">Loading…</div>
        ) : vendorData.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-gray-400">
            <div className="text-4xl mb-2">🏪</div>
            <p className="font-medium">No vendor data for {selectedYear}</p>
            <p className="text-sm mt-1">Record expenses with vendor names to see ranking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendorData.map((v, idx) => (
              <div key={v.vendor}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{v.vendor}</span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{v.count} txn{v.count !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 ml-3 flex-shrink-0">{fmt(v.total)}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all"
                    style={{ width: `${Math.max(2, (v.total / vendorMaxTotal) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}