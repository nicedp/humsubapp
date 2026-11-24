import prisma from '../config/db'
import { createError } from '../middleware/error.middleware'
import { CreateFamilyMemberDto, UpdateFamilyMemberDto } from '../dtos/family-member.dto'

async function assertResidentBelongsToSociety(residentId: string, societyId: number) {
  const resident = await (prisma as any).resident.findFirst({
    where: { id: residentId, flat: { societyId } },
    select: { id: true },
  })
  if (!resident) throw createError('Resident not found', 404)
}

export async function listFamilyMembers(residentId: string, societyId: number) {
  await assertResidentBelongsToSociety(residentId, societyId)
  return (prisma as any).familyMember.findMany({
    where: { residentId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createFamilyMember(
  residentId: string,
  dto: CreateFamilyMemberDto,
  societyId: number
) {
  await assertResidentBelongsToSociety(residentId, societyId)
  return (prisma as any).familyMember.create({
    data: {
      residentId,
      name: dto.name,
      relation: dto.relation,
      phone: dto.phone ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      isEmergency: dto.isEmergency ?? false,
    },
  })
}

export async function updateFamilyMember(
  residentId: string,
  memberId: string,
  dto: UpdateFamilyMemberDto,
  societyId: number
) {
  await assertResidentBelongsToSociety(residentId, societyId)
  const existing = await (prisma as any).familyMember.findFirst({
    where: { id: memberId, residentId },
  })
  if (!existing) throw createError('Family member not found', 404)

  return (prisma as any).familyMember.update({
    where: { id: memberId },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.relation !== undefined && { relation: dto.relation }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.dateOfBirth !== undefined && {
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      }),
      ...(dto.isEmergency !== undefined && { isEmergency: dto.isEmergency }),
    },
  })
}

export async function deleteFamilyMember(
  residentId: string,
  memberId: string,
  societyId: number
) {
  await assertResidentBelongsToSociety(residentId, societyId)
  const existing = await (prisma as any).familyMember.findFirst({
    where: { id: memberId, residentId },
  })
  if (!existing) throw createError('Family member not found', 404)
  await (prisma as any).familyMember.delete({ where: { id: memberId } })
}