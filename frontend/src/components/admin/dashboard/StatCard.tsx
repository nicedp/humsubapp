import { Link } from 'react-router-dom'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  subtitle?: string
  to?: string
}

export default function StatCard({ title, value, icon, color, subtitle, to }: StatCardProps) {
  const inner = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}