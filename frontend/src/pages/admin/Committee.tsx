import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { committeeApi, Committee, CommitteeMember, CommitteeAchievement } from '../../api/committee'
import { residentsApi } from '../../api/residents'
import CommitteeMemberGrid from '../../components/admin/committee/CommitteeMemberGrid'
import AchievementTimeline from '../../components/admin/committee/AchievementTimeline'
import PastCommitteesPanel from '../../components/admin/committee/PastCommitteesPanel'
import {
  CommitteeModal,
  AddMemberModal,
  AddAchievementModal,
  ConfirmDeleteModal,
} from '../../components/admin/committee/CommitteeModals'
import type {
  CommitteeForm,
  MemberForm,
  AchievementForm,
} from '../../components/admin/committee/CommitteeModals'

type Tab = 'active' | 'past' | 'manage'

export default function AdminCommittee() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('active')

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [committeeModal, setCommitteeModal] = useState(false)
  const [editingCommittee, setEditingCommittee] = useState<Committee | null>(null)
  const [memberModal, setMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null)
  const [achievementModal, setAchievementModal] = useState(false)

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'committee' | 'member' | 'achievement'
    item: Committee | CommitteeMember | CommitteeAchievement
  } | null>(null)

  // ── Queries ──────────────────────────────────────────────────────────────────
  const { data: committees = [], isLoading } = useQuery({
    queryKey: ['committees'],
    queryFn: () => committeeApi.list(),
  })

  const { data: residents = [] } = useQuery({
    queryKey: ['residents-slim'],
    queryFn: async () => {
      const res = await residentsApi.list({ skip: 0, limit: 500 })
      return res.data.map((r: any) => ({
        id: r.id,
        name: r.name,
        flatNumber: r.flatNumber ?? null,
      }))
    },
  })

  // Active committee (with members + achievements)
  const activeCommittee = committees.find(c => c.isActive) ?? null
  const { data: activeDetail } = useQuery({
    queryKey: ['committee', activeCommittee?.id],
    queryFn: () => committeeApi.get(activeCommittee!.id),
    enabled: !!activeCommittee?.id,
  })

  const pastCommittees = committees.filter(c => !c.isActive)
  // For past committees, list only has memberCount/achievementCount — fetch detail on expand is handled inside PastCommitteesPanel
  // We pass the list-level data; for expanded detail we load via activate/delete only

  // ── Mutations ────────────────────────────────────────────────────────────────
  const createCommittee = useMutation({
    mutationFn: (f: CommitteeForm) =>
      committeeApi.create({
        name: f.name,
        formedOn: f.formedOn,
        dissolvedOn: f.dissolvedOn || null,
      }),
    onSuccess: () => {
      toast.success('Committee created')
      qc.invalidateQueries({ queryKey: ['committees'] })
      setCommitteeModal(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to create committee'),
  })

  const updateCommittee = useMutation({
    mutationFn: ({ id, f }: { id: string; f: CommitteeForm }) =>
      committeeApi.update(id, {
        name: f.name,
        formedOn: f.formedOn,
        dissolvedOn: f.dissolvedOn || null,
      }),
    onSuccess: () => {
      toast.success('Committee updated')
      qc.invalidateQueries({ queryKey: ['committees'] })
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setCommitteeModal(false)
      setEditingCommittee(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update'),
  })

  const deleteCommittee = useMutation({
    mutationFn: (id: string) => committeeApi.delete(id),
    onSuccess: () => {
      toast.success('Committee deleted')
      qc.invalidateQueries({ queryKey: ['committees'] })
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to delete'),
  })

  const activateCommittee = useMutation({
    mutationFn: (id: string) => committeeApi.activate(id),
    onSuccess: () => {
      toast.success('Committee activated')
      qc.invalidateQueries({ queryKey: ['committees'] })
      setTab('active')
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to activate'),
  })

  const addMember = useMutation({
    mutationFn: ({ committeeId, f }: { committeeId: string; f: MemberForm }) =>
      committeeApi.addMember(committeeId, {
        residentId: f.residentId,
        designation: f.designation,
        joinedOn: f.joinedOn,
        notes: f.notes || null,
      }),
    onSuccess: () => {
      toast.success('Member added')
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setMemberModal(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to add member'),
  })

  const updateMember = useMutation({
    mutationFn: ({ committeeId, memberId, f }: { committeeId: string; memberId: string; f: MemberForm }) =>
      committeeApi.updateMember(committeeId, memberId, {
        designation: f.designation,
        notes: f.notes || null,
      }),
    onSuccess: () => {
      toast.success('Member updated')
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setMemberModal(false)
      setEditingMember(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to update member'),
  })

  const removeMember = useMutation({
    mutationFn: ({ committeeId, memberId }: { committeeId: string; memberId: string }) =>
      committeeApi.removeMember(committeeId, memberId),
    onSuccess: () => {
      toast.success('Member removed')
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to remove member'),
  })

  const addAchievement = useMutation({
    mutationFn: ({ committeeId, f }: { committeeId: string; f: AchievementForm }) =>
      committeeApi.addAchievement(committeeId, {
        title: f.title,
        description: f.description || null,
        achievedOn: f.achievedOn,
        category: f.category,
      }),
    onSuccess: () => {
      toast.success('Achievement added')
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setAchievementModal(false)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to add achievement'),
  })

  const deleteAchievement = useMutation({
    mutationFn: ({ committeeId, achievementId }: { committeeId: string; achievementId: string }) =>
      committeeApi.deleteAchievement(committeeId, achievementId),
    onSuccess: () => {
      toast.success('Achievement deleted')
      if (activeCommittee) qc.invalidateQueries({ queryKey: ['committee', activeCommittee.id] })
      setDeleteTarget(null)
    },
    onError: (e: any) => toast.error(e?.response?.data?.error ?? 'Failed to delete achievement'),
  })

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleCommitteeSubmit = (f: CommitteeForm) => {
    if (editingCommittee) {
      updateCommittee.mutate({ id: editingCommittee.id, f })
    } else {
      createCommittee.mutate(f)
    }
  }

  const handleMemberSubmit = (f: MemberForm) => {
    if (!activeDetail) return
    if (editingMember) {
      updateMember.mutate({ committeeId: activeDetail.id, memberId: editingMember.id, f })
    } else {
      addMember.mutate({ committeeId: activeDetail.id, f })
    }
  }

  const handleAchievementSubmit = (f: AchievementForm) => {
    if (!activeDetail) return
    addAchievement.mutate({ committeeId: activeDetail.id, f })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'committee') {
      deleteCommittee.mutate((deleteTarget.item as Committee).id)
    } else if (deleteTarget.type === 'member') {
      const m = deleteTarget.item as CommitteeMember
      if (activeDetail) removeMember.mutate({ committeeId: activeDetail.id, memberId: m.id })
    } else if (deleteTarget.type === 'achievement') {
      const a = deleteTarget.item as CommitteeAchievement
      if (activeDetail) deleteAchievement.mutate({ committeeId: activeDetail.id, achievementId: a.id })
    }
  }

  const isDeleting =
    deleteCommittee.isPending || removeMember.isPending || deleteAchievement.isPending

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏛️ Society Committee</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage the managing committee and achievements</p>
        </div>
        <button
          onClick={() => { setEditingCommittee(null); setCommitteeModal(true) }}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Committee
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {([
          { key: 'active', label: '🟢 Active' },
          { key: 'past',   label: '📚 Past' },
          { key: 'manage', label: '⚙️ Manage' },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              tab === t.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Active Tab ── */}
      {!isLoading && tab === 'active' && (
        <div className="space-y-6">
          {!activeCommittee ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-5xl mb-3">🏛️</p>
              <p className="font-semibold text-gray-700">No active committee</p>
              <p className="text-sm text-gray-400 mt-1">
                Create a new committee or reactivate a past one from the Past tab
              </p>
            </div>
          ) : (
            <>
              {/* Committee hero card */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-blue-200 font-medium">Active Committee</p>
                    <h2 className="text-xl font-bold mt-1">{activeCommittee.name}</h2>
                    <p className="text-blue-200 text-sm mt-1">
                      Formed {new Date(activeCommittee.formedOn).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCommittee(activeCommittee); setCommitteeModal(true) }}
                      className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{activeDetail?.members?.length ?? activeCommittee.memberCount}</p>
                    <p className="text-xs text-blue-200">Members</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{activeDetail?.achievements?.length ?? activeCommittee.achievementCount}</p>
                    <p className="text-xs text-blue-200">Achievements</p>
                  </div>
                </div>
              </div>

              {/* Members section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Members</h3>
                  <button
                    onClick={() => { setEditingMember(null); setMemberModal(true) }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Member
                  </button>
                </div>
                <div className="p-5">
                  <CommitteeMemberGrid
                    members={activeDetail?.members ?? []}
                    isAdmin
                    onEdit={m => { setEditingMember(m); setMemberModal(true) }}
                    onRemove={m => setDeleteTarget({ type: 'member', item: m })}
                  />
                </div>
              </div>

              {/* Achievements section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Achievements</h3>
                  <button
                    onClick={() => setAchievementModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Add Achievement
                  </button>
                </div>
                <div className="p-5">
                  <AchievementTimeline
                    achievements={activeDetail?.achievements ?? []}
                    isAdmin
                    onDelete={a => setDeleteTarget({ type: 'achievement', item: a })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Past Tab ── */}
      {!isLoading && tab === 'past' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Past Committees</h3>
          </div>
          <div className="p-5">
            <PastCommitteesPanel
              committees={pastCommittees}
              onActivate={c => activateCommittee.mutate(c.id)}
              onDelete={c => setDeleteTarget({ type: 'committee', item: c })}
            />
          </div>
        </div>
      )}

      {/* ── Manage Tab ── */}
      {!isLoading && tab === 'manage' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">All Committees</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {committees.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-4xl mb-2">📋</p>
                <p className="font-semibold text-gray-700">No committees yet</p>
              </div>
            ) : (
              committees.map(c => (
                <div key={c.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.formedOn).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        {c.isActive && <span className="ml-2 text-green-600 font-medium">Active</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingCommittee(c); setCommitteeModal(true) }}
                      className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                    {!c.isActive && (
                      <button
                        onClick={() => activateCommittee.mutate(c.id)}
                        className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded border border-green-200 hover:bg-green-50 transition-colors"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget({ type: 'committee', item: c })}
                      className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <CommitteeModal
        open={committeeModal}
        editing={editingCommittee}
        saving={createCommittee.isPending || updateCommittee.isPending}
        onClose={() => { setCommitteeModal(false); setEditingCommittee(null) }}
        onSubmit={handleCommitteeSubmit}
      />

      <AddMemberModal
        open={memberModal}
        editing={editingMember}
        saving={addMember.isPending || updateMember.isPending}
        residents={residents}
        onClose={() => { setMemberModal(false); setEditingMember(null) }}
        onSubmit={handleMemberSubmit}
      />

      <AddAchievementModal
        open={achievementModal}
        saving={addAchievement.isPending}
        onClose={() => setAchievementModal(false)}
        onSubmit={handleAchievementSubmit}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title={
          deleteTarget?.type === 'committee'
            ? `Delete "${(deleteTarget.item as Committee).name}"?`
            : deleteTarget?.type === 'member'
            ? `Remove ${(deleteTarget.item as CommitteeMember).resident?.name ?? 'member'} from committee?`
            : `Delete achievement "${(deleteTarget?.item as CommitteeAchievement)?.title}"?`
        }
        description="This action cannot be undone."
        deleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}