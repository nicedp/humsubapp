import React from 'react'
import { MONTHS_LONG, INCOME_SOURCE_LABELS } from '../../constants/labels'

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN')
}

function fmtFull(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface ExpenseCategory {
  category: string
  total: number
  percentage: number
}

interface ExpenseItem {
  id: string
  description: string
  amount: number
  categorySlug?: string
}

interface IncomeRecord {
  id: string
  source: string
  amount: number
  description?: string
  receivedAt: string
}

interface BillingData {
  totalBilled: number
  totalCollected: number
  totalOutstanding: number
  totalBills: number
  paidBills: number
  unpaidBills: number
  collectionRate: number
}

interface ExpensesData {
  grandTotal: number
  byCategory: ExpenseCategory[]
  items?: ExpenseItem[]
}

interface IncomeData {
  grandTotal: number
  records: IncomeRecord[]
}

export interface MonthlyReportData {
  societyName: string
  monthLabel: string
  billing: BillingData
  expenses: ExpensesData
  netBalance: number
  income?: IncomeData
}

interface Props {
  data: MonthlyReportData
  month: number
  year: number
  categoryColors: Record<string, string>
  categoryLabels: Record<string, string>
}

const s: React.CSSProperties = {
  fontFamily: "'Segoe UI', Arial, sans-serif",
  fontSize: '13px',
  color: '#1a1a1a',
  lineHeight: '1.5',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '28px',
  pageBreakInside: 'avoid',
  breakInside: 'avoid',
}

const sectionHeadingStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#1f2937',
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '6px',
  marginBottom: '14px',
  pageBreakAfter: 'avoid',
  breakAfter: 'avoid',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '12px',
  marginBottom: '10px',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '7px 8px',
  fontWeight: 600,
  color: '#4b5563',
  borderBottom: '1.5px solid #d1d5db',
  background: '#f9fafb',
}

const tdStyle: React.CSSProperties = {
  padding: '7px 8px',
  borderBottom: '1px solid #f3f4f6',
  verticalAlign: 'middle',
}

const tdRightStyle: React.CSSProperties = { ...tdStyle, textAlign: 'right' }

function kpiBox(bg: string, label: string, value: string, sub: string, valueColor: string) {
  return (
    <div style={{
      background: bg,
      borderRadius: '8px',
      padding: '14px 16px',
      pageBreakInside: 'avoid',
      breakInside: 'avoid',
    }}>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, color: valueColor, margin: '4px 0 2px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{sub}</div>
    </div>
  )
}

export default function MonthlyReportPrint({ data, month, year, categoryColors, categoryLabels }: Props) {
  const { societyName, monthLabel, billing, expenses, netBalance } = data
  const income = data.income
  const incomeTotal = income?.grandTotal ?? 0
  const incomeRecords = income?.records ?? []

  const sectionNum = (n: number) => String(n)
  const sec = {
    maintenance: 1,
    income: incomeTotal > 0 ? 2 : 0,
    expenses: incomeTotal > 0 ? 3 : 2,
    balance: incomeTotal > 0 ? 4 : 3,
  }

  const collectionRateColor = billing.collectionRate >= 80 ? '#15803d' : billing.collectionRate >= 50 ? '#b45309' : '#dc2626'
  const collectionRateBg = billing.collectionRate >= 80 ? '#f0fdf4' : billing.collectionRate >= 50 ? '#fefce8' : '#fef2f2'
  const collectionRateLabel = billing.collectionRate >= 80 ? 'Excellent' : billing.collectionRate >= 50 ? 'Moderate' : 'Needs attention'

  return (
    <div style={s}>
      {/* Page header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{societyName}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>Monthly Finance Report</div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginTop: '6px' }}>{monthLabel}</div>
      </div>

      {/* Section 1: Maintenance Collection */}
      <div style={sectionStyle}>
        <div style={sectionHeadingStyle}>{sectionNum(sec.maintenance)}. Maintenance Collection</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
          {kpiBox('#f9fafb', 'Total Billed', fmt(billing.totalBilled), `${billing.totalBills} bills generated`, '#111827')}
          {kpiBox('#f0fdf4', 'Total Collected', fmt(billing.totalCollected), `${billing.paidBills} bills paid`, '#15803d')}
          {kpiBox('#fef2f2', 'Outstanding', fmt(billing.totalOutstanding), `${billing.unpaidBills} bills pending`, '#dc2626')}
          {kpiBox(collectionRateBg, 'Collection Rate', `${billing.collectionRate}%`, collectionRateLabel, collectionRateColor)}
        </div>
      </div>

      {/* Section 2 (optional): Other Income */}
      {incomeTotal > 0 && (
        <div style={sectionStyle}>
          <div style={sectionHeadingStyle}>{sectionNum(sec.income)}. Other Income</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Description</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeRecords.map((rec) => (
                <tr key={rec.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <td style={tdStyle}>{INCOME_SOURCE_LABELS[rec.source] ?? rec.source}</td>
                  <td style={{ ...tdStyle, color: '#6b7280' }}>{rec.description ?? '—'}</td>
                  <td style={{ ...tdRightStyle, color: '#15803d', fontWeight: 600 }}>{fmt(rec.amount)}</td>
                </tr>
              ))}
              <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
                <td style={tdStyle} colSpan={2}>Total Other Income</td>
                <td style={{ ...tdRightStyle, color: '#15803d' }}>{fmt(incomeTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Section: Expenses */}
      <div style={sectionStyle}>
        <div style={sectionHeadingStyle}>{sectionNum(sec.expenses)}. Society Expenses</div>
        {expenses.byCategory.length === 0 ? (
          <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '12px' }}>No expenses recorded for this month.</p>
        ) : (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Category</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {expenses.byCategory.map((cat, idx) => (
                  <tr key={idx} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0,
                          background: categoryColors[cat.category] ?? '#6b7280',
                        }} />
                        <span>{categoryLabels[cat.category] ?? cat.category}</span>
                      </div>
                    </td>
                    <td style={{ ...tdRightStyle, fontWeight: 600 }}>{fmt(cat.total)}</td>
                    <td style={{ ...tdRightStyle, color: '#6b7280' }}>{cat.percentage}%</td>
                  </tr>
                ))}
                <tr style={{ background: '#f9fafb', fontWeight: 700 }}>
                  <td style={tdStyle}>Total Expenses</td>
                  <td style={{ ...tdRightStyle, color: '#dc2626' }}>{fmt(expenses.grandTotal)}</td>
                  <td style={{ ...tdRightStyle, color: '#9ca3af' }}>100%</td>
                </tr>
              </tbody>
            </table>

            {/* Expense line items */}
            {expenses.items && expenses.items.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Individual Expense Items ({expenses.items.length})
                </div>
                <table style={{ ...tableStyle, fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Description</th>
                      <th style={thStyle}>Category</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.items.map((item) => (
                      <tr key={item.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <td style={tdStyle}>{item.description}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>
                          {item.categorySlug ? (categoryLabels[item.categorySlug] ?? item.categorySlug) : '—'}
                        </td>
                        <td style={{ ...tdRightStyle, fontWeight: 600 }}>{fmtFull(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Section: Net Balance Summary */}
      <div style={{ ...sectionStyle, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
        <div style={sectionHeadingStyle}>{sectionNum(sec.balance)}. Net Balance Summary</div>
        <div style={{
          borderRadius: '10px',
          padding: '18px 20px',
          background: netBalance >= 0 ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${netBalance >= 0 ? '#bbf7d0' : '#fecaca'}`,
        }}>
          {/* Maintenance */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#374151' }}>Maintenance Collected</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Actual payments received</div>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#15803d' }}>{fmt(billing.totalCollected)}</div>
          </div>

          {incomeTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#374151' }}>Other Income</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>Sponsorships, events, etc.</div>
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: '#15803d' }}>+ {fmt(incomeTotal)}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#374151' }}>Total Expenses</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>All categories</div>
            </div>
            <div style={{ fontSize: '17px', fontWeight: 700, color: '#dc2626' }}>− {fmt(expenses.grandTotal)}</div>
          </div>

          <div style={{
            borderTop: '1px solid #d1d5db',
            marginTop: '14px',
            paddingTop: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Net Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: netBalance >= 0 ? '#15803d' : '#dc2626' }}>
              {netBalance >= 0 ? '+' : ''}{fmt(netBalance)}
            </div>
          </div>

          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '8px' }}>
            {netBalance >= 0
              ? `Society surplus: ₹${netBalance.toLocaleString('en-IN')} available for reserves or carry-forward`
              : `Society deficit: ₹${Math.abs(netBalance).toLocaleString('en-IN')} exceeds total income for this month`}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '14px', textAlign: 'center', color: '#9ca3af', fontSize: '11px' }}>
        <div>Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div style={{ marginTop: '3px' }}>{societyName} — Society Management Portal</div>
      </div>
    </div>
  )
}