import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'

interface ChartPoint {
  label: string
  billed: number
  collected: number
  expenses: number
  rate: number
}

interface Props {
  chartData: ChartPoint[]
}

export default function FinanceCharts({ chartData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart: Billed vs Collected vs Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">💰 Revenue vs Expenses (6 months)</h2>
          <Link to="/admin/expenses" className="text-xs text-blue-600 hover:underline">View expenses →</Link>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="billed" name="Billed" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
              <Bar dataKey="collected" name="Collected" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Line Chart: Collection Rate */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">📈 Collection Rate % (6 months)</h2>
          <Link to="/admin/billing" className="text-xs text-blue-600 hover:underline">View billing →</Link>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Collection Rate']} />
              <ReferenceLine y={80} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: '80%', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
              <Line type="monotone" dataKey="rate" name="Collection Rate" stroke="#3b82f6"
                strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}