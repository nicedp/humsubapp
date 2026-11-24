import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const goHome = () => {
    if (!user) { navigate('/login'); return }
    if (user.role === 'admin' || user.role === 'sub_admin' || user.role === 'member') {
      navigate('/admin/dashboard')
    } else if (user.role === 'owner' || user.role === 'tenant') {
      navigate('/resident/dashboard')
    } else {
      navigate('/guard/visitor-entry')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-sm mx-auto px-6">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm mb-6">
          You don't have permission to view this page.
          Contact your society admin to request access.
        </p>
        <button
          onClick={goHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          ← Go to Dashboard
        </button>
      </div>
    </div>
  )
}