import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { settingsApi } from '../api/settings'
import { notificationsApi } from '../api/notifications'
import CalcPanel from './CalcPanel'
import AdminNotificationBell from './admin/AdminNotificationBell'

// ─── New + quick-action items for admin ──────────────────────
const ADMIN_NEW_ACTIONS = [
  { label: 'Bulk Generate Bills', icon: '💰', href: '/admin/billing' },
  { label: 'Add Resident', icon: '👤', href: '/admin/residents' },
  { label: 'Add Expense', icon: '💸', href: '/admin/expenses' },
  { label: 'Add Income', icon: '💵', href: '/admin/income' },
  { label: 'Create Invoice', icon: '🧾', href: '/admin/invoices' },
  { label: 'Post Notice', icon: '📢', href: '/admin/notices' },
  { label: 'Log Visitor', icon: '🚶', href: '/admin/visitors' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [newPlusOpen, setNewPlusOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [calcOpen, setCalcOpen] = useState(false)
  const newPlusRef = useRef<HTMLDivElement>(null)

  // Society info — all roles (shared cache with Settings page + Sidebar)
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 5 * 60_000,
  })

  // Unread count for residents
  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationsApi.getUnreadCount,
    enabled: user?.role === 'owner' || user?.role === 'tenant',
    refetchInterval: 30_000,
  })
  const unreadCount = unreadData?.count ?? 0

  const isAdminPanel = user?.role === 'admin' || user?.role === 'sub_admin' || user?.role === 'member'

  // Close popover on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (newPlusRef.current && !newPlusRef.current.contains(e.target as Node)) {
        setNewPlusOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Cmd+K / Ctrl+K global shortcut
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      // Cmd+Shift+C / Ctrl+Shift+C opens calculator
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault()
        setCalcOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = async () => {
    try { await api.post('/auth/logout') } catch { /* ignore */ }
    logout()
    navigate('/login')
  }

  const societyName = settings?.societyName || 'Society Portal'
  const accountNumber = settings?.accountNumber ?? null
  const isAdmin = user?.role === 'admin'
  const isResident = user?.role === 'owner' || user?.role === 'tenant'
  const isAdminPanelUser = isAdminPanel

  const portalLabel: Record<string, string> = {
    admin: 'Admin Panel',
    sub_admin: 'Sub-Admin Panel',
    member: 'Member Panel',
    owner: 'Resident Portal',
    tenant: 'Resident Portal',
    security: 'Security Portal',
  }

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-30">
        {/* Left: Society name + account number */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-gray-900 truncate">{societyName}</h2>
              {accountNumber && (
                <button
                  onClick={() => navigator.clipboard.writeText(accountNumber)}
                  title="Click to copy account number"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 hover:bg-blue-100 transition text-xs font-mono font-semibold text-blue-700 hover:text-blue-900 flex-shrink-0"
                >
                  <span>#{accountNumber}</span>
                  <span>📋</span>
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              {portalLabel[user?.role ?? ''] ?? 'Portal'}
            </p>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {/* Search shortcut hint (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              title="Global search (Cmd+K)"
            >
              <span>🔍</span>
              <span>Search</span>
              <kbd className="text-[10px] bg-white border border-gray-200 rounded px-1 py-0.5 text-gray-400">⌘K</kbd>
            </button>
          )}

          {/* Calculator — all roles */}
          <button
            onClick={() => setCalcOpen(prev => !prev)}
            className={`p-2 rounded-lg transition ${calcOpen ? 'bg-orange-100 text-orange-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            title="Calculator (Ctrl+Shift+C)"
          >
            <span className="text-xl">🧮</span>
          </button>

          {/* Notification bell — admin panel users (admin/sub_admin/member) */}
          {isAdminPanelUser && <AdminNotificationBell />}

          {/* Notification bell — residents */}
          {isResident && (
            <button
              onClick={() => navigate('/resident/notifications')}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title="Notifications"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          {/* New + popover — admin only */}
          {isAdmin && (
            <div className="relative" ref={newPlusRef}>
              <button
                onClick={() => setNewPlusOpen(!newPlusOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
              >
                <span className="text-base leading-none">+</span>
                <span className="hidden sm:inline">New</span>
              </button>
              {newPlusOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Quick Actions</p>
                  {ADMIN_NEW_ACTIONS.map((action) => (
                    <button
                      key={action.href}
                      onClick={() => { navigate(action.href); setNewPlusOpen(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
              {user?.username?.charAt(0) ?? 'U'}
            </div>
            <span className="text-sm text-gray-700 font-medium hidden md:block truncate max-w-[120px]">{user?.username}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Calculator Panel (all roles) */}
      <CalcPanel open={calcOpen} onClose={() => setCalcOpen(false)} />

      {/* Global Search Modal (Cmd+K) */}
      {searchOpen && (
        <GlobalSearch onClose={() => setSearchOpen(false)} />
      )}
    </>
  )
}

// ─── Global Search Modal ──────────────────────────────────────
import { residentsApi } from '../api/residents'
import { flatsApi } from '../api/flats'
import { Resident, Flat } from '../types'

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const { data: residentsData } = useQuery({
    queryKey: ['search-residents', query],
    queryFn: () => residentsApi.list({ search: query, limit: 5 }),
    enabled: query.length >= 2,
    staleTime: 10_000,
  })

  const { data: flatsData } = useQuery({
    queryKey: ['search-flats', query],
    queryFn: () => flatsApi.list({ limit: 100 }),
    enabled: query.length >= 1,
    staleTime: 60_000,
  })

  const residents: Resident[] = residentsData?.data ?? []
  const allFlats: Flat[] = flatsData?.data ?? []
  const flats = query.length >= 1
    ? allFlats.filter((f) => f.flatNumber.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  const hasResults = residents.length > 0 || flats.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
          <span className="text-gray-400 text-xl flex-shrink-0">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search residents or flats..."
            className="flex-1 text-base outline-none text-gray-900 placeholder-gray-400"
          />
          <kbd className="text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.length < 2 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              <p>Type at least 2 characters to search</p>
              <p className="text-xs mt-1 text-gray-300">Searches residents by name or flat number</p>
            </div>
          ) : !hasResults ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">No results for "<span className="font-medium">{query}</span>"</p>
            </div>
          ) : (
            <div className="py-2">
              {residents.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Residents</p>
                  {residents.map((r: Resident) => (
                    <button
                      key={r.id}
                      onClick={() => { navigate('/admin/residents'); onClose() }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0 font-semibold text-blue-700">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          Flat {r.flatNumber} · {r.residentType}
                        </p>
                      </div>
                      <span className="ml-auto text-xs text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              )}
              {flats.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Flats</p>
                  {flats.map((f: Flat) => (
                    <button
                      key={f.id}
                      onClick={() => { navigate('/admin/flats'); onClose() }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">🏠</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Flat {f.flatNumber}</p>
                        <p className="text-xs text-gray-500">Floor {f.floor} · {f.type} · {f.status}</p>
                      </div>
                      <span className="ml-auto text-xs text-gray-300">→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
          <span>⏎ to navigate</span>
          <span>·</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  )
}