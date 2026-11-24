import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aclApi, PERMISSION_MODULES, type PermissionEntry, type AclRole, type AclMatrix } from '../../api/acl'

// ─── Module display labels ────────────────────────────────────────────────────
const MODULE_LABELS: Record<string, string> = {
  billing: '💰 Billing',
  residents: '👥 Residents',
  flats: '🏘️ Properties',
  visitors: '🚶 Visitors',
  notices: '📢 Notices',
  complaints: '📝 Complaints',
  staff: '👷 Staff',
  assets: '🔧 Assets',
  parking: '🚗 Parking',
  expenses: '💸 Expenses',
  income: '💵 Other Income',
  invoices: '🧾 Invoices',
  events: '🎉 Events',
  vendors: '🔩 Vendors & AMC',
  committee: '🏛️ Committee',
  helpers: '🛠️ Helpers',
  reports: '📊 Reports',
  settings: '⚙️ Settings',
  users: '🔑 Users',
}

const ACTIONS: Array<{ key: keyof PermissionEntry; label: string; short: string }> = [
  { key: 'canView',   label: 'View',   short: 'V' },
  { key: 'canCreate', label: 'Create', short: 'C' },
  { key: 'canEdit',   label: 'Edit',   short: 'E' },
  { key: 'canDelete', label: 'Delete', short: 'D' },
  { key: 'canExport', label: 'Export', short: 'X' },
]

// Helper — convert array to map for easier editing
function entriesToMap(entries: PermissionEntry[]): Record<string, PermissionEntry> {
  const map: Record<string, PermissionEntry> = {}
  for (const e of entries) map[e.module] = { ...e }
  // Ensure all modules present
  for (const mod of PERMISSION_MODULES) {
    if (!map[mod]) {
      map[mod] = { module: mod, canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false }
    }
  }
  return map
}

function mapToEntries(map: Record<string, PermissionEntry>): PermissionEntry[] {
  return PERMISSION_MODULES.map((mod) => map[mod] ?? {
    module: mod, canView: false, canCreate: false, canEdit: false, canDelete: false, canExport: false,
  })
}

// ─── Role tab labels ──────────────────────────────────────────────────────────
const ROLE_LABELS: Record<AclRole, string> = {
  sub_admin: '🔐 Sub-Admin',
  member: '👤 Member',
}

const ROLE_DESCRIPTIONS: Record<AclRole, string> = {
  sub_admin: 'Treasury managers, property managers, office assistants. Can access most admin features based on configured permissions.',
  member: 'Committee members with view-heavy access and notices write access. Limited to configured permissions.',
}

export default function ACLSettings() {
  const queryClient = useQueryClient()
  const [activeRole, setActiveRole] = useState<AclRole>('sub_admin')
  const [dirty, setDirty] = useState(false)
  const [editMap, setEditMap] = useState<Record<string, PermissionEntry> | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const { data: matrix, isLoading } = useQuery<AclMatrix>({
    queryKey: ['acl-permissions'],
    queryFn: aclApi.getPermissions,
    staleTime: 30_000,
  })

  // When matrix loads or role switches, sync editMap
  React.useEffect(() => {
    if (!matrix) return
    setEditMap(entriesToMap(matrix[activeRole] ?? []))
    setDirty(false)
  }, [matrix, activeRole])

  const saveMutation = useMutation({
    mutationFn: () => aclApi.updatePermissions({
      role: activeRole,
      permissions: mapToEntries(editMap!),
    }),
    onSuccess: (newMatrix: AclMatrix) => {
      queryClient.setQueryData(['acl-permissions'], newMatrix)
      setDirty(false)
      setSuccessMsg(`${ROLE_LABELS[activeRole as AclRole]} permissions saved successfully`)
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  const togglePermission = (module: string, action: keyof PermissionEntry) => {
    if (!editMap) return
    const current = editMap[module]
    const updated = { ...current, [action]: !current[action as string] }
    // If turning off canView, also turn off all others
    if (action === 'canView' && !updated.canView) {
      updated.canCreate = false
      updated.canEdit = false
      updated.canDelete = false
      updated.canExport = false
    }
    // If turning on any action other than canView, also turn on canView
    if (action !== 'canView' && updated[action as string]) {
      updated.canView = true
    }
    setEditMap({ ...editMap, [module]: updated })
    setDirty(true)
  }

  const setAllForModule = (module: string, allTrue: boolean) => {
    if (!editMap) return
    setEditMap({
      ...editMap,
      [module]: {
        module,
        canView: allTrue,
        canCreate: allTrue,
        canEdit: allTrue,
        canDelete: allTrue,
        canExport: allTrue,
      },
    })
    setDirty(true)
  }

  if (isLoading || !editMap) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🛡️ Access Control Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure what Sub-Admins and Members can do in the admin portal.
          Admin always has full access and is not configurable.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      {/* Role tabs */}
      <div className="flex gap-2 mb-4">
        {(['sub_admin', 'member'] as AclRole[]).map((role) => (
          <button
            key={role}
            onClick={() => { if (dirty && !confirm('Discard unsaved changes?')) return; setActiveRole(role) }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeRole === role
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>

      {/* Role description */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-5 text-sm text-blue-700">
        {ROLE_DESCRIPTIONS[activeRole as AclRole]}
      </div>

      {/* Permission matrix */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 gap-4">
          <span>Module</span>
          {ACTIONS.map((a) => (
            <span key={a.key} className="w-14 text-center">{a.label}</span>
          ))}
          <span className="w-16 text-center">All</span>
        </div>

        {/* Rows */}
        {PERMISSION_MODULES.map((mod, idx) => {
          const entry = editMap[mod]
          const allOn = ACTIONS.every((a) => entry[a.key as string])
          return (
            <div
              key={mod}
              className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center px-4 py-3 gap-4 ${
                idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
              } border-b border-gray-100 last:border-0`}
            >
              <span className="text-sm font-medium text-gray-700">{MODULE_LABELS[mod] ?? mod}</span>
              {ACTIONS.map((a) => (
                <div key={a.key} className="w-14 flex justify-center">
                  <button
                    onClick={() => togglePermission(mod, a.key)}
                    title={a.label}
                    className={`w-7 h-7 rounded-md text-sm font-semibold transition-colors ${
                      entry[a.key as string]
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {a.short}
                  </button>
                </div>
              ))}
              {/* All toggle */}
              <div className="w-16 flex justify-center">
                <button
                  onClick={() => setAllForModule(mod, !allOn)}
                  title={allOn ? 'Remove all' : 'Grant all'}
                  className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                    allOn
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {allOn ? '✓' : '○'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
        <span><span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-center leading-5 mr-1">V</span>View</span>
        <span><span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-center leading-5 mr-1">C</span>Create</span>
        <span><span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-center leading-5 mr-1">E</span>Edit</span>
        <span><span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-center leading-5 mr-1">D</span>Delete</span>
        <span><span className="inline-block w-5 h-5 rounded bg-green-500 text-white text-center leading-5 mr-1">X</span>Export</span>
      </div>

      {/* Save button */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!dirty || saveMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {saveMutation.isPending ? 'Saving...' : `Save ${ROLE_LABELS[activeRole]} Permissions`}
        </button>
        {dirty && (
          <span className="text-xs text-amber-600 font-medium">● Unsaved changes</span>
        )}
      </div>

      {saveMutation.isError && (
        <p className="mt-3 text-sm text-red-600">Failed to save permissions. Please try again.</p>
      )}
    </div>
  )
}