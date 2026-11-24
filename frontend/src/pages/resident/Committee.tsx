import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { committeeApi } from '../../api/committee'
import CommitteeMemberGrid from '../../components/admin/committee/CommitteeMemberGrid'
import AchievementTimeline from '../../components/admin/committee/AchievementTimeline'

export default function ResidentCommittee() {
  const { data: committees = [], isLoading } = useQuery({
    queryKey: ['committees'],
    queryFn: () => committeeApi.list(),
  })

  const activeCommittee = committees.find(c => c.isActive) ?? null

  const { data: activeDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['committee', activeCommittee?.id],
    queryFn: () => committeeApi.get(activeCommittee!.id),
    enabled: !!activeCommittee?.id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeCommittee) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-5xl mb-3">🏛️</p>
          <p className="font-semibold text-gray-700">No active committee</p>
          <p className="text-sm text-gray-400 mt-1">
            The society management committee information will appear here once set up
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">🏛️ Society Committee</h1>
        <p className="text-sm text-gray-500 mt-0.5">Meet your managing committee</p>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm text-blue-200 font-medium">Active Committee</p>
        <h2 className="text-xl font-bold mt-1">{activeCommittee.name}</h2>
        <p className="text-blue-200 text-sm mt-1">
          Formed{' '}
          {new Date(activeCommittee.formedOn).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
        <div className="mt-4 flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {activeDetail?.members?.filter(m => m.isActive).length ??
                activeCommittee.memberCount}
            </p>
            <p className="text-xs text-blue-200">Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">
              {activeDetail?.achievements?.length ?? activeCommittee.achievementCount}
            </p>
            <p className="text-xs text-blue-200">Achievements</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Committee Members</h3>
        </div>
        <div className="p-5">
          {isLoadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <CommitteeMemberGrid
              members={activeDetail?.members ?? []}
              isAdmin={false}
            />
          )}
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Achievements</h3>
        </div>
        <div className="p-5">
          {isLoadingDetail ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AchievementTimeline
              achievements={activeDetail?.achievements ?? []}
              isAdmin={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}