import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import {
  CreateCommitteeDto,
  UpdateCommitteeDto,
  AddMemberDto,
  UpdateMemberDto,
  AddAchievementDto,
} from '../dtos/committee.dto';

// ─── Member include helper ─────────────────────────────────────────────────────

const MEMBER_INCLUDE = {
  resident: {
    select: {
      id: true,
      name: true,
      flatId: true,
      flat: { select: { flatNumber: true, floor: true } },
    },
  },
};

const COMMITTEE_INCLUDE = {
  members: {
    include: MEMBER_INCLUDE,
    orderBy: [{ designation: 'asc' }, { joinedOn: 'asc' }] as any,
  },
  achievements: {
    orderBy: { achievedOn: 'desc' } as any,
  },
  _count: { select: { members: true, achievements: true } },
};

// ─── List ──────────────────────────────────────────────────────────────────────

export async function listCommittees(societyId = 1) {
  const rows = await (prisma as any).committee.findMany({
    where: { societyId },
    include: COMMITTEE_INCLUDE,
    orderBy: [{ isActive: 'desc' }, { formedOn: 'desc' }],
  });
  return rows;
}

// ─── Get single ────────────────────────────────────────────────────────────────

export async function getCommittee(id: string, societyId = 1) {
  const committee = await (prisma as any).committee.findFirst({
    where: { id, societyId },
    include: COMMITTEE_INCLUDE,
  });
  if (!committee) throw createError('Committee not found', 404);
  return committee;
}

// ─── Create ────────────────────────────────────────────────────────────────────

export async function createCommittee(dto: CreateCommitteeDto, createdBy: string, societyId = 1) {
  const committee = await (prisma as any).committee.create({
    data: {
      societyId,
      name: dto.name,
      formedOn: new Date(dto.formedOn),
      dissolvedOn: dto.dissolvedOn ? new Date(dto.dissolvedOn) : null,
      isActive: false,
      createdBy,
    },
    include: COMMITTEE_INCLUDE,
  });
  return committee;
}

// ─── Update ────────────────────────────────────────────────────────────────────

export async function updateCommittee(id: string, dto: UpdateCommitteeDto, societyId = 1) {
  await assertCommitteeExists(id, societyId);
  const committee = await (prisma as any).committee.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.formedOn !== undefined && { formedOn: new Date(dto.formedOn) }),
      ...(dto.dissolvedOn !== undefined && {
        dissolvedOn: dto.dissolvedOn ? new Date(dto.dissolvedOn) : null,
      }),
    },
    include: COMMITTEE_INCLUDE,
  });
  return committee;
}

// ─── Delete ────────────────────────────────────────────────────────────────────

export async function deleteCommittee(id: string, societyId = 1) {
  const committee = await assertCommitteeExists(id, societyId);
  if (committee.isActive) {
    throw createError('Cannot delete the active committee. Activate another committee first.', 400);
  }
  await (prisma as any).committee.delete({ where: { id } });
}

// ─── Activate ─────────────────────────────────────────────────────────────────
// Uses $transaction to atomically swap the active flag

export async function activateCommittee(id: string, societyId = 1) {
  await assertCommitteeExists(id, societyId);

  const [, activated] = await prisma.$transaction([
    // Deactivate all committees in this society
    (prisma as any).committee.updateMany({
      where: { societyId },
      data: { isActive: false },
    }),
    // Activate the target committee
    (prisma as any).committee.update({
      where: { id },
      data: { isActive: true },
      include: COMMITTEE_INCLUDE,
    }),
  ]);

  return activated;
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function addMember(committeeId: string, dto: AddMemberDto, societyId = 1) {
  await assertCommitteeExists(committeeId, societyId);

  // Verify resident exists
  const resident = await prisma.resident.findUnique({ where: { id: dto.residentId } });
  if (!resident) throw createError('Resident not found', 404);

  // Check for duplicate (same resident already in this committee)
  const existing = await (prisma as any).committeeMember.findUnique({
    where: { committeeId_residentId: { committeeId, residentId: dto.residentId } },
  });
  if (existing) throw createError('This resident is already a member of this committee', 409);

  const member = await (prisma as any).committeeMember.create({
    data: {
      committeeId,
      residentId: dto.residentId,
      designation: dto.designation,
      joinedOn: dto.joinedOn ? new Date(dto.joinedOn) : new Date(),
      notes: dto.notes ?? null,
    },
    include: MEMBER_INCLUDE,
  });
  return member;
}

export async function updateMember(
  committeeId: string,
  memberId: string,
  dto: UpdateMemberDto,
  societyId = 1
) {
  await assertCommitteeExists(committeeId, societyId);
  const member = await (prisma as any).committeeMember.findFirst({
    where: { id: memberId, committeeId },
  });
  if (!member) throw createError('Member not found', 404);

  const updated = await (prisma as any).committeeMember.update({
    where: { id: memberId },
    data: {
      ...(dto.designation !== undefined && { designation: dto.designation }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.leftOn !== undefined && { leftOn: dto.leftOn ? new Date(dto.leftOn) : null }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
    include: MEMBER_INCLUDE,
  });
  return updated;
}

export async function removeMember(committeeId: string, memberId: string, societyId = 1) {
  await assertCommitteeExists(committeeId, societyId);
  const member = await (prisma as any).committeeMember.findFirst({
    where: { id: memberId, committeeId },
  });
  if (!member) throw createError('Member not found', 404);
  await (prisma as any).committeeMember.delete({ where: { id: memberId } });
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export async function addAchievement(committeeId: string, dto: AddAchievementDto, societyId = 1) {
  await assertCommitteeExists(committeeId, societyId);

  const achievement = await (prisma as any).committeeAchievement.create({
    data: {
      committeeId,
      title: dto.title,
      description: dto.description ?? null,
      achievedOn: new Date(dto.achievedOn),
      category: dto.category,
    },
  });
  return achievement;
}

export async function deleteAchievement(
  committeeId: string,
  achievementId: string,
  societyId = 1
) {
  await assertCommitteeExists(committeeId, societyId);
  const achievement = await (prisma as any).committeeAchievement.findFirst({
    where: { id: achievementId, committeeId },
  });
  if (!achievement) throw createError('Achievement not found', 404);
  await (prisma as any).committeeAchievement.delete({ where: { id: achievementId } });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function assertCommitteeExists(id: string, societyId: number) {
  const committee = await (prisma as any).committee.findFirst({ where: { id, societyId } });
  if (!committee) throw createError('Committee not found', 404);
  return committee;
}