// Committee transformer — shapes raw Prisma objects for API responses

export function transformCommittee(c: any) {
  return {
    id: c.id,
    societyId: c.societyId,
    name: c.name,
    formedOn: c.formedOn,
    dissolvedOn: c.dissolvedOn ?? null,
    isActive: c.isActive,
    createdBy: c.createdBy ?? null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    memberCount: c.members?.length ?? c._count?.members ?? 0,
    achievementCount: c.achievements?.length ?? c._count?.achievements ?? 0,
    members: c.members ? c.members.map(transformMember) : undefined,
    achievements: c.achievements ? c.achievements.map(transformAchievement) : undefined,
  };
}

export function transformMember(m: any) {
  return {
    id: m.id,
    committeeId: m.committeeId,
    residentId: m.residentId,
    designation: m.designation,
    isActive: m.isActive,
    joinedOn: m.joinedOn,
    leftOn: m.leftOn ?? null,
    notes: m.notes ?? null,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    // Nested resident info (present when fetched with include)
    resident: m.resident
      ? {
          id: m.resident.id,
          name: m.resident.name,
          flatNumber: m.resident.flat?.flatNumber ?? null,
          floor: m.resident.flat?.floor ?? null,
          flatId: m.resident.flatId,
        }
      : undefined,
  };
}

export function transformAchievement(a: any) {
  return {
    id: a.id,
    committeeId: a.committeeId,
    title: a.title,
    description: a.description ?? null,
    achievedOn: a.achievedOn,
    category: a.category,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}