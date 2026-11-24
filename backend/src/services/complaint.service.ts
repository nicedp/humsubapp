import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformComplaint, transformComplaints } from '../transformers/complaint.transformer';
import { CreateComplaintDto, UpdateComplaintDto } from '../dtos/complaint.dto';
import { PaginationParams } from '../helpers/pagination.helper';

export async function getAllComplaints(
  flatId: string | undefined,
  status: string | undefined,
  pagination: PaginationParams,
  societyId: number = 1
) {
  const where = {
    flat: { societyId },
    ...(flatId && { flatId }),
    ...(status && { status: status as 'open' | 'in_progress' | 'resolved' | 'closed' }),
  };

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true },
      orderBy: { raisedOn: 'desc' },
    }),
    prisma.complaint.count({ where }),
  ]);
  return { data: transformComplaints(complaints), total };
}

export async function getComplaintById(id: string, requestingResidentId?: string) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: { flat: true },
  });
  if (!complaint) throw createError('Complaint not found', 404);

  // OWASP A01: If caller is a resident (not admin), verify complaint belongs to their flat
  if (requestingResidentId) {
    const resident = await prisma.resident.findUnique({ where: { id: requestingResidentId } });
    if (!resident || resident.flatId !== complaint.flatId) {
      throw createError('Forbidden', 403);
    }
  }

  return transformComplaint(complaint);
}

export async function createComplaint(dto: CreateComplaintDto, raisedBy: string, enforcedFlatId?: string) {
  // OWASP A01: If a resident's enforcedFlatId is provided, always use it (never trust body flatId)
  const flatId = enforcedFlatId ?? dto.flatId;
  if (!flatId) throw createError('Flat ID is required', 400);
  const flat = await prisma.flat.findUnique({ where: { id: flatId } });
  if (!flat) throw createError('Flat not found', 404);

  const complaint = await prisma.complaint.create({
    data: {
      flatId: flatId as string,
      raisedBy,
      category: dto.category as 'maintenance' | 'noise' | 'cleanliness' | 'security' | 'billing' | 'other',
      description: dto.description,
    },
    include: { flat: true },
  });
  return transformComplaint(complaint);
}

export async function updateComplaint(id: string, dto: UpdateComplaintDto) {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) throw createError('Complaint not found', 404);

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      ...(dto.status && { status: dto.status as 'open' | 'in_progress' | 'resolved' | 'closed' }),
      ...(dto.adminRemark !== undefined && { adminRemark: dto.adminRemark }),
      ...(dto.resolvedOn && { resolvedOn: new Date(dto.resolvedOn) }),
    },
    include: { flat: true },
  });
  return transformComplaint(updated);
}

export async function getMyComplaints(residentId: string, pagination: PaginationParams) {
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  const where = { flatId: resident.flatId };

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true },
      orderBy: { raisedOn: 'desc' },
    }),
    prisma.complaint.count({ where }),
  ]);
  return { data: transformComplaints(complaints), total };
}