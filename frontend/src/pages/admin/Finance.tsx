import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { financeApi, FinanceSummaryPoint } from '../../api/finance'

import { MONTHS_SHORT } from '../../constants/labels'
const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2]

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function netColor(n: number) {
  if (n > 0) return 'text-green-600 font-semibold'
  if (n < 0) return 'text-red-600 font-semibold'
  return 'text-gray-500'
}

// Parse "YYYY-MM" string into { year, month }
function parseMonthInput(v: string): { year: number; month: number } | null {
  const [y, m] = v.split('-').map(Number)
  if (!y || !m) return null
  return { year: y, month: m }
}

function toMonthKey(year: number, month: number) {
  return year * 100 + month
}

function exportCSV(rows: FinanceSummaryPoint[], rangeLabel: string) {
  const sorted = [...rows].sort((a, b) =>
    a.year !== b.year ? a.year - b.year : a.month - b.month
  )
  const ytdCollected = sorted.reduce((s, r) => s + r.totalCollected, 0)
  const ytdIncome = sorted.reduce((s, r) => s + r.totalIncome, 0)
  const ytdExpenses = sorted.reduce((s, r) => s + r.totalExpenses, 0)
  const ytdNet = sorted.reduce((s, r) => s + r.netBalance, 0)
  const firstOB = sorted.length > 0 ? sorted[0].openingBalance : 0
  const lastCB = sorted.length > 0 ? sorted[sorted.length - 1].closingBalance : 0

  const headers = [
    'Month', 'Year',
    'Opening Balance (₹)',
    'Maintenance Collected (₹)', 'Collection Rate (%)',
    'Other Income (₹)',
    'Expenses (₹)',
    'Net Balance (₹)',
    'Closing Balance (₹)',
  ]

  const dataRows = sorted.map(r => [
    `${MONTHS_SHORT[r.month - 1]} ${r.year}`,
    r.year,
    r.openingBalance.toFixed(2),
    r.totalCollected.toFixed(2),
    r.collectionRate,
    r.totalIncome.toFixed(2),
    r.totalExpenses.toFixed(2),
    r.netBalance.toFixed(2),
    r.closingBalance.toFixed(2),
  ])

  const totalsRow = [
    `Total (${sorted.length} months)`, '',
    firstOB.toFixed(2),
    ytdCollected.toFixed(2), '',
    ytdIncome.toFixed(2),
    ytdExpenses.toFixed(2),
    ytdNet.toFixed(2),
    lastCB.toFixed(2),
  ]

  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') ? `"${s}"` : s
  }

  const csv = [headers, ...dataRows, [], totalsRow]
    .map(row => (row as (string | number)[]).map(escape).join(','))
    .join('\n')

  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-ledger-${rangeLabel}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminFinance() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [advancedMode, setAdvancedMode] = useState(false)
  // "YYYY-MM" strings for input[type=month]
  const [fromValue, setFromValue] = useState(`${CURRENT_YEAR}-01`)
  const [toValue, setToValue] = useState(
    `${CURRENT_YEAR}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const navigate = useNavigate()

  const { data: allData, isLoading } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.getSummary(36),
    staleTime: 60_000,
  })

  const rows = useMemo(() => {
    if (!allData) return []
    let filtered: FinanceSummaryPoint[]
    if (advancedMode) {
      const from = parseMonthInput(fromValue)
      const to = parseMonthInput(toValue)
      if (!from || !to) return []
      const fromKey = toMonthKey(from.year, from.month)
      const toKey = toMonthKey(to.year, to.month)
      filtered = allData.filter(r => {
        const key = toMonthKey(r.year, r.month)
        return key >= fromKey && key <= toKey
      })
    } else {
      filtered = allData.filter(r => r.year === selectedYear)
    }
    return filtered.slice().sort((a, b) =>
      a.year !== b.year ? b.year - a.year : b.month - a.month
    )
  }, [allData, selectedYear, advancedMode, fromValue, toValue])

  const ytd = useMemo(() => {
    return rows.reduce(
      (acc, r) => ({
        totalCollected: acc.totalCollected + r.totalCollected,
        totalIncome: acc.totalIncome + r.totalIncome,
        totalExpenses: acc.totalExpenses + r.totalExpenses,
        netBalance: acc.netBalance + r.netBalance,
      }),
      { totalCollected: 0, totalIncome: 0, totalExpenses: 0, netBalance: 0 }
    )
  }, [rows])

  const rangeLabel = useMemo(() => {
    if (advancedMode) return `${fromValue}_to_${toValue}`
    return String(selectedYear)
  }, [advancedMode, fromValue, toValue, selectedYear])

  const kpiSubLabel = useMemo(() => {
    if (advancedMode) {
      const from = parseMonthInput(fromValue)
      const to = parseMonthInput(toValue)
      if (!from || !to) return ''
      return `${MONTHS_SHORT[from.month - 1]} ${from.year} – ${MONTHS_SHORT[to.month - 1]} ${to.year}`
    }
    return `Jan – ${MONTHS_SHORT[now.getMonth()]} ${selectedYear}`
  }, [advancedMode, fromValue, toValue, selectedYear])

  // Validate range
  const rangeInvalid = advancedMode && fromValue > toValue

  // Sorted ascending for footer OB/CB
  const rowsAsc = useMemo(
    () => [...rows].sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month),
    [rows]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Ledger</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monthly maintenance collected vs. society expenses</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Top controls */}
          <div className="flex gap-2 items-center flex-wrap">
            {!advancedMode && (
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            <button
              onClick={() => setAdvancedMode(v => !v)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                advancedMode
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {advancedMode ? '✕ Simple' : '📅 Date Range'}
            </button>
            <button
              onClick={() => rows.length > 0 && exportCSV(rows, rangeLabel)}
              disabled={rows.length === 0 || rangeInvalid}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ⬇ Export CSV
            </button>
            <Link
              to="/admin/expense-analytics"
              className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              📈 Analytics
            </Link>
          </div>

          {/* Advanced date range row */}
          {advancedMode && (
            <div className="flex items-center gap-3 flex-wrap bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-blue-700 whitespace-nowrap">From</label>
                <input
                  type="month"
                  value={fromValue}
                  max={toValue}
                  onChange={e => setFromValue(e.target.value)}
                  className="px-2 py-1 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              <span className="text-blue-400 text-lg font-light">→</span>
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-blue-700 whitespace-nowrap">To</label>
                <input
                  type="month"
                  value={toValue}
                  min={fromValue}
                  onChange={e => setToValue(e.target.value)}
                  className="px-2 py-1 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              {rangeInvalid && (
                <span className="text-xs text-red-500 font-medium">⚠ From must be before To</span>
              )}
              {!rangeInvalid && rows.length > 0 && (
                <span className="text-xs text-blue-600 font-medium">{rows.length} month{rows.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Maintenance Collected</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{fmt(ytd.totalCollected)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpiSubLabel}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Expenses</p>
            <p className="text-2xl font-bold text-red-500 mt-1">{fmt(ytd.totalExpenses)}</p>
            <p className="text-xs text-gray-400 mt-0.5">All categories</p>
          </div>
          <div className={`bg-white rounded-xl border shadow-sm p-5 ${ytd.netBalance >= 0 ? 'border-green-100' : 'border-red-100'}`}>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Net Balance</p>
            <p className={`text-2xl font-bold mt-1 ${ytd.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {ytd.netBalance >= 0 ? '+' : ''}{fmt(ytd.netBalance)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Collected + Income − Expenses</p>
          </div>
          {rowsAsc.length > 0 && (() => {
            const latestCB = rowsAsc[rowsAsc.length - 1].closingBalance
            return (
              <div className={`bg-white rounded-xl border shadow-sm p-5 ${latestCB >= 0 ? 'border-blue-100' : 'border-red-100'}`}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Closing Balance</p>
                <p className={`text-2xl font-bold mt-1 ${latestCB >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {fmt(latestCB)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Est. society account balance</p>
              </div>
            )
          })()}
        </div>
      )}

      {/* Monthly ledger table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading finance data…</div>
        ) : rangeInvalid ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">📅</div>
            <p className="text-gray-500 font-medium">Invalid date range</p>
            <p className="text-gray-400 text-sm mt-1">From date must be before or equal to To date</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-gray-500 font-medium">No data for selected period</p>
            <p className="text-gray-400 text-sm mt-1">Generate bills or record expenses to see data here</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Month</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Opening Balance</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Maintenance Collected</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Other Income</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Expenses</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Net</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600 whitespace-nowrap">Closing Balance</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600 whitespace-nowrap">Drill-down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map(r => (
                <tr key={`${r.year}-${r.month}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {MONTHS_SHORT[r.month - 1]} {r.year}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 whitespace-nowrap">
                    {fmt(r.openingBalance)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="text-green-700 font-medium">
                      {fmt(r.totalCollected)}
                      {r.totalBilled > 0 && r.totalBilled !== r.totalCollected && (
                        <span className="text-xs text-gray-400 ml-1">/ {fmt(r.totalBilled)} billed</span>
                      )}
                    </div>
                    {r.totalBilled > 0 && (
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${r.collectionRate >= 80 ? 'bg-green-500' : r.collectionRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                            style={{ width: `${r.collectionRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold ${r.collectionRate >= 80 ? 'text-green-600' : r.collectionRate >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                          {r.collectionRate}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {r.totalIncome > 0
                      ? <span className="text-teal-600 font-medium">{fmt(r.totalIncome)}</span>
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right text-red-600 whitespace-nowrap">
                    {r.totalExpenses > 0 ? fmt(r.totalExpenses) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className={`px-4 py-3 text-right whitespace-nowrap ${netColor(r.netBalance)}`}>
                    {r.netBalance >= 0 ? '+' : ''}{fmt(r.netBalance)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${r.closingBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    {fmt(r.closingBalance)}
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Link
                        to={`/admin/billing?month=${r.month}&year=${r.year}`}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium"
                      >
                        Bills →
                      </Link>
                      <Link
                        to={`/admin/expenses?month=${r.month}&year=${r.year}`}
                        className="px-2 py-1 text-xs bg-orange-50 text-orange-600 rounded hover:bg-orange-100 font-medium"
                      >
                        Expenses →
                      </Link>
                      <button
                        onClick={() => navigate(`/admin/monthly-report?month=${r.month}&year=${r.year}`)}
                        className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded hover:bg-purple-100 font-medium"
                      >
                        Report 🖨
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer totals */}
            <tfoot className="bg-gray-50 border-t border-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total ({rows.length} months)</td>
                <td className="px-4 py-3 text-right text-sm text-gray-400">
                  {rowsAsc.length > 0 ? fmt(rowsAsc[0].openingBalance) : '—'}
                  <span className="text-xs text-gray-400 ml-1">(first OB)</span>
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{fmt(ytd.totalCollected)}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-teal-600">
                  {ytd.totalIncome > 0 ? fmt(ytd.totalIncome) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{fmt(ytd.totalExpenses)}</td>
                <td className={`px-4 py-3 text-right text-sm font-bold ${ytd.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ytd.netBalance >= 0 ? '+' : ''}{fmt(ytd.netBalance)}
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-blue-700">
                  {rowsAsc.length > 0 ? fmt(rowsAsc[rowsAsc.length - 1].closingBalance) : '—'}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  )
}