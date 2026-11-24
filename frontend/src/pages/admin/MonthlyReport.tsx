import React, { useEffect, useMemo } from 'react'
import ReactDOM from 'react-dom/client'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, Link } from 'react-router-dom'
import { financeApi } from '../../api/finance'
import { expensesApi } from '../../api/expenses'
import { MONTHS_LONG, FALLBACK_COLORS, INCOME_SOURCE_LABELS } from '../../constants/labels'
import MonthlyReportPrint from '../../components/admin/MonthlyReportPrint'

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function fmtFull(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function MonthlyReport() {
  const [searchParams, setSearchParams] = useSearchParams()
  const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1))
  const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

  const currentYear = new Date().getFullYear()
  // Allow selecting from 3 years back up to current year
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - i)

  function handleMonthChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSearchParams({ month: e.target.value, year: String(year) })
  }

  function handleYearChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSearchParams({ month: String(month), year: e.target.value })
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['monthly-report', month, year],
    queryFn: () => financeApi.getMonthlyReport(month, year),
    staleTime: 60_000,
    enabled: !isNaN(month) && !isNaN(year),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: () => expensesApi.categories.list(),
    staleTime: 60_000,
  })

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((c: { slug: string; color?: string | null }, i: number) => {
      map[c.slug] = c.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
    })
    return map
  }, [categories])

  const categoryLabels = useMemo(() => {
    const map: Record<string, string> = {}
    categories.forEach((c: { slug: string; name: string }) => { map[c.slug] = c.name })
    return map
  }, [categories])

  useEffect(() => {
    if (data) document.title = `Report — ${MONTHS_LONG[month - 1]} ${year}`
  }, [data, month, year])

  const handleWhatsApp = () => {
    if (!data) return
    const { billing, expenses, netBalance, societyName, monthLabel } = data
    const income = (data as { income?: { grandTotal: number; records: { source: string; amount: number; description?: string }[] } }).income
    const incomeTotal = income?.grandTotal ?? 0

    const lines = [
      `*${societyName}*`,
      `📊 Monthly Report — *${monthLabel}*`,
      ``,
      `*1️⃣ Maintenance Collection*`,
      `• Billed: ${fmt(billing.totalBilled)} (${billing.totalBills} flats)`,
      `• Collected: ${fmt(billing.totalCollected)} (${billing.paidBills} paid)`,
      `• Outstanding: ${fmt(billing.totalOutstanding)} (${billing.unpaidBills} pending)`,
      `• Collection Rate: ${billing.collectionRate}%`,
      ``,
    ]

    if (incomeTotal > 0) {
      lines.push(`*2️⃣ Other Income*`)
      lines.push(`• Total: ${fmt(incomeTotal)}`)
      income?.records?.forEach((r: { source: string; amount: number; description?: string }) => {
        lines.push(`  · ${INCOME_SOURCE_LABELS[r.source] ?? r.source}: ${fmt(r.amount)}${r.description ? ` (${r.description})` : ''}`)
      })
      lines.push(``)
    }

    lines.push(`*${incomeTotal > 0 ? '3️⃣' : '2️⃣'} Expenses*`)
    if (expenses.byCategory.length === 0) {
      lines.push(`• No expenses this month`)
    } else {
      expenses.byCategory.forEach((cat: { category: string; total: number }) => {
        lines.push(`• ${categoryLabels[cat.category] ?? cat.category}: ${fmt(cat.total)}`)
      })
      lines.push(`• *Total: ${fmt(expenses.grandTotal)}*`)
    }
    lines.push(``)

    lines.push(`*${incomeTotal > 0 ? '4️⃣' : '3️⃣'} Net Balance*`)
    lines.push(`• Collected: ${fmt(billing.totalCollected)}`)
    if (incomeTotal > 0) lines.push(`• Other Income: ${fmt(incomeTotal)}`)
    lines.push(`• Expenses: −${fmt(expenses.grandTotal)}`)
    lines.push(`• *Net: ${netBalance >= 0 ? '+' : ''}${fmt(netBalance)}* ${netBalance >= 0 ? '✅ Surplus' : '⚠️ Deficit'}`)

    const text = encodeURIComponent(lines.join('\n'))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Derive safe values for use before data loads (for toolbar subtitle)
  const societyName = data?.societyName ?? ''
  const monthLabel = data?.monthLabel ?? `${MONTHS_LONG[month - 1]} ${year}`

  // Report body derived values (only used when data is available)
  const billing = data?.billing
  const expenses = data?.expenses
  const netBalance = data?.netBalance ?? 0
  const income = (data as { income?: { grandTotal: number; records: { id: string; source: string; amount: number; description?: string; receivedAt: string }[] } } | undefined)?.income
  const incomeTotal = income?.grandTotal ?? 0
  const incomeRecords = income?.records ?? []

  const handlePrint = () => {
    if (!data || !billing || !expenses) return

    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) return

    const title = `Report \u2014 ${monthLabel}`
    printWindow.document.write(
      '<!DOCTYPE html><html lang="en"><head>' +
      '<meta charset="UTF-8" />' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
      '<title>' + title + '</title>' +
      '<style>' +
      '*, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      'html, body { margin: 0; padding: 0; background: white; font-family: \'Segoe UI\', Arial, sans-serif; }' +
      '@page { size: A4 portrait; margin: 1.5cm 1.4cm; }' +
      '</style>' +
      '</head><body>' +
      '<div id="print-root" style="padding:0;margin:0;"></div>' +
      '</body></html>'
    )
    printWindow.document.close()

    const root = ReactDOM.createRoot(printWindow.document.getElementById('print-root')!)
    root.render(
      React.createElement(MonthlyReportPrint, {
        data: data as import('../../components/admin/MonthlyReportPrint').MonthlyReportData,
        month,
        year,
        categoryColors,
        categoryLabels,
      })
    )

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.addEventListener('afterprint', () => printWindow.close())
    }, 400)
  }

  const sectionNum = (n: number) => {
    const nums = ['1', '2', '3', '4', '5']
    return nums[n - 1] ?? String(n)
  }
  const s = {
    maintenance: 1,
    income: incomeTotal > 0 ? 2 : 0,
    expenses: incomeTotal > 0 ? 3 : 2,
    balance: incomeTotal > 0 ? 4 : 3,
  }

  return (
    <>
      {/* Print toolbar — always visible so user can change month/year even during loading */}
      <div className="print:hidden mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Monthly Report</h1>
            <p className="text-sm text-gray-500">
              {isLoading
                ? `Loading ${MONTHS_LONG[month - 1]} ${year}…`
                : `${monthLabel}${societyName ? ` — ${societyName}` : ''}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Month picker */}
            <select
              value={month}
              onChange={handleMonthChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MONTHS_LONG.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            {/* Year picker */}
            <select
              value={year}
              onChange={handleYearChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="w-px h-6 bg-gray-200" />
            <Link
              to="/admin/finance"
              className="px-3 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              ← Finance Ledger
            </Link>
            {!isLoading && !isError && data && (
              <>
                <button
                  onClick={handleWhatsApp}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  📤 Share on WhatsApp
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  🖨 Print / Save PDF
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center h-48 text-gray-400 animate-pulse">
          Generating report for {MONTHS_LONG[month - 1]} {year}…
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <p>Failed to load report data.</p>
        </div>
      )}

      {/* Printable report — only rendered when data is fully loaded */}
      {!isLoading && !isError && data && billing && expenses && (
        <div className="report-page bg-white p-8 max-w-3xl mx-auto shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:max-w-full">

          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-5 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{societyName}</h2>
            <p className="text-sm text-gray-500 mt-1">Monthly Finance Report</p>
            <p className="text-lg font-semibold text-gray-700 mt-2">{monthLabel}</p>
          </div>

          {/* Section 1: Maintenance Collection */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
              {sectionNum(s.maintenance)}. Maintenance Collection
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Billed</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{fmt(billing.totalBilled)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{billing.totalBills} bills generated</p>
              </div>
              <div className="kpi-card bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Collected</p>
                <p className="text-xl font-bold text-green-700 mt-1">{fmt(billing.totalCollected)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{billing.paidBills} bills paid</p>
              </div>
              <div className="kpi-card bg-red-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Outstanding</p>
                <p className="text-xl font-bold text-red-600 mt-1">{fmt(billing.totalOutstanding)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{billing.unpaidBills} bills pending</p>
              </div>
              <div className={`kpi-card rounded-lg p-4 ${billing.collectionRate >= 80 ? 'bg-green-50' : billing.collectionRate >= 50 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Collection Rate</p>
                <p className={`text-xl font-bold mt-1 ${billing.collectionRate >= 80 ? 'text-green-700' : billing.collectionRate >= 50 ? 'text-yellow-700' : 'text-red-600'}`}>
                  {billing.collectionRate}%
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {billing.collectionRate >= 80 ? 'Excellent' : billing.collectionRate >= 50 ? 'Moderate' : 'Needs attention'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 (optional): Other Income */}
          {incomeTotal > 0 && (
            <div className="report-section mb-8">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
                {sectionNum(s.income)}. Other Income
              </h3>
              <table className="w-full text-sm mb-3">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-600">Source</th>
                    <th className="text-left py-2 font-semibold text-gray-600">Description</th>
                    <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeRecords.map((rec) => (
                    <tr key={rec.id} className="border-b border-gray-50">
                      <td className="py-2">
                        <span className="text-gray-700">{INCOME_SOURCE_LABELS[rec.source] ?? rec.source}</span>
                      </td>
                      <td className="py-2 text-gray-500 text-xs">{rec.description ?? '—'}</td>
                      <td className="py-2 text-right text-green-700 font-medium">{fmt(rec.amount)}</td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-semibold">
                    <td className="py-2 pl-2 text-gray-700" colSpan={2}>Total Other Income</td>
                    <td className="py-2 text-right text-green-700">{fmt(incomeTotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Section: Expenses */}
          <div className="report-section mb-8">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
              {sectionNum(s.expenses)}. Society Expenses
            </h3>
            {expenses.byCategory.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No expenses recorded for this month.</p>
            ) : (
              <>
                <table className="w-full text-sm mb-3">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold text-gray-600">Category</th>
                      <th className="text-right py-2 font-semibold text-gray-600">Amount</th>
                      <th className="text-right py-2 font-semibold text-gray-600">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.byCategory.map((cat: { category: string; total: number; percentage: number }, idx: number) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: categoryColors[cat.category] ?? '#6b7280' }}
                            />
                            <span className="text-gray-700">{categoryLabels[cat.category] ?? cat.category}</span>
                          </div>
                        </td>
                        <td className="py-2 text-right text-gray-800 font-medium">{fmt(cat.total)}</td>
                        <td className="py-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${cat.percentage}%`, background: categoryColors[cat.category] ?? '#6b7280' }}
                              />
                            </div>
                            <span className="text-gray-500 text-xs w-10 text-right">{cat.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-2 pl-2 text-gray-700">Total Expenses</td>
                      <td className="py-2 text-right text-red-600">{fmt(expenses.grandTotal)}</td>
                      <td className="py-2 text-right text-gray-400">100%</td>
                    </tr>
                  </tbody>
                </table>

                {/* Expense line items (if available from API) */}
                {(() => {
                  const expAny = expenses as unknown as { items?: { id: string; description: string; amount: number; categorySlug?: string }[] }
                  if (!expAny.items || expAny.items.length === 0) return null
                  return (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:underline print:hidden">
                        View individual expense items ({expAny.items.length} items)
                      </summary>
                      <table className="w-full text-xs mt-2 border border-gray-100 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Description</th>
                            <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                            <th className="text-right px-3 py-2 font-medium text-gray-600">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expAny.items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50">
                              <td className="px-3 py-2 text-gray-700">{item.description}</td>
                              <td className="px-3 py-2 text-gray-500">{item.categorySlug ? (categoryLabels[item.categorySlug] ?? item.categorySlug) : '—'}</td>
                              <td className="px-3 py-2 text-right font-medium text-gray-800">{fmtFull(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )
                })()}
              </>
            )}
          </div>

          {/* Section: Net Balance Summary */}
          <div className="report-section mb-8">
            <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">
              {sectionNum(s.balance)}. Net Balance Summary
            </h3>
            <div className={`rounded-xl p-5 ${netBalance >= 0 ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Maintenance Collected</p>
                  <p className="text-xs text-gray-400">Actual payments received</p>
                </div>
                <p className="text-lg font-bold text-green-700">{fmt(billing.totalCollected)}</p>
              </div>

              {incomeTotal > 0 && (
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Other Income</p>
                    <p className="text-xs text-gray-400">Sponsorships, events, etc.</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">+ {fmt(incomeTotal)}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Expenses</p>
                  <p className="text-xs text-gray-400">All categories</p>
                </div>
                <p className="text-lg font-bold text-red-600">− {fmt(expenses.grandTotal)}</p>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-between">
                <p className="text-base font-bold text-gray-800">Net Balance</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {netBalance >= 0 ? '+' : ''}{fmt(netBalance)}
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {netBalance >= 0
                  ? `Society surplus: ₹${netBalance.toLocaleString('en-IN')} available for reserves or carry-forward`
                  : `Society deficit: ₹${Math.abs(netBalance).toLocaleString('en-IN')} exceeds total income for this month`}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 text-center text-xs text-gray-400">
            <p>Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="mt-1">{societyName} — Society Management Portal</p>
          </div>
        </div>
      )}

    </>
  )
}