import { Link } from 'react-router-dom'
import { format, isToday } from 'date-fns'
import { MaintenanceBill, Complaint, Visitor } from '../../../types'
import { Defaulter } from '../../../api/billing'

interface Props {
  recentPayments: MaintenanceBill[]
  openComplaints: Complaint[]
  todaysVisitors: Visitor[]
  defaulters: Defaulter[]
}

export default function RecentActivity({ recentPayments, openComplaints, todaysVisitors, defaulters }: Props) {
  const currentlyInside = todaysVisitors.filter((v) => !v.exitTime)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Payments</h2>
          <Link to="/admin/billing" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-gray-400">No payments recorded this month</p>
        ) : (
          <ul className="space-y-3">
            {recentPayments.slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{b.flatNumber}</span>
                  <span className="text-gray-400 ml-2 text-xs">
                    {b.payment ? format(new Date(b.payment.paidOn), 'dd MMM') : ''}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-green-700">₹{b.amount.toLocaleString('en-IN')}</span>
                  {b.payment && (
                    <span className="text-xs text-gray-400 ml-2 capitalize">{b.payment.paymentMode}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Open Complaints */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Open Complaints</h2>
          <Link to="/admin/complaints" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {openComplaints.length === 0 ? (
          <p className="text-sm text-gray-400">No open complaints 🎉</p>
        ) : (
          <ul className="space-y-3">
            {openComplaints.slice(0, 5).map((c) => (
              <li key={c.id} className="flex items-start gap-3 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize whitespace-nowrap ${
                  c.category === 'security' ? 'bg-red-100 text-red-700' :
                  c.category === 'maintenance' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {c.category}
                </span>
                <span className="text-gray-600 line-clamp-2">{c.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Today's Visitors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Today's Visitors</h2>
          <Link to="/admin/visitors" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {todaysVisitors.length === 0 ? (
          <p className="text-sm text-gray-400">No visitors today</p>
        ) : (
          <ul className="space-y-3">
            {todaysVisitors.slice(0, 6).map((v) => (
              <li key={v.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{v.visitorName}</span>
                  <span className="text-gray-400 ml-2 text-xs">→ Flat {v.flatNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {isToday(new Date(v.entryTime)) ? format(new Date(v.entryTime), 'h:mm a') : ''}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.exitTime ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                    {v.exitTime ? 'Left' : 'Inside'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {currentlyInside.length > 0 && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
            {currentlyInside.length} currently inside
          </p>
        )}
      </div>

      {/* Top Defaulters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Top Defaulters</h2>
          <Link to="/admin/billing" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {defaulters.length === 0 ? (
          <p className="text-sm text-gray-400">No defaulters! All up to date 🎉</p>
        ) : (
          <ul className="space-y-3">
            {defaulters.slice(0, 5).map((d) => (
              <li key={d.flatId} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-800">{d.flatNumber}</span>
                  {d.residentName && (
                    <span className="text-gray-400 ml-2 text-xs">{d.residentName}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-red-600">₹{d.totalOutstanding.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-gray-400 ml-1">({d.unpaidMonths}mo)</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}