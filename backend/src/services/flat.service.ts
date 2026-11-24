import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformFlat, transformFlats } from '../transformers/flat.transformer';
import { CreateFlatDto, UpdateFlatDto, BulkCreateFlatsDto } from '../dtos/flat.dto';
import { PaginationParams } from '../helpers/pagination.helper';

export interface FlatFilters {
  status?: 'occupied' | 'vacant';
  floor?: number;
  type?: string;
  blockId?: string;
  search?: string;
}

const flatInclude = {
  block: true,
  residents: {
    where: { isActive: true, residentType: 'owner' as const },
    select: { id: true, name: true, residentType: true, isActive: true },
    take: 1,
  },
};

export async function getAllFlats(societyId: number, pagination: PaginationParams, filters: FlatFilters = {}) {
  const where: Record<string, unknown> = { societyId };
  if (filters.status) where['status'] = filters.status;
  if (filters.floor !== undefined) where['floor'] = filters.floor;
  if (filters.type) where['type'] = filters.type;
  if (filters.blockId) where['blockId'] = filters.blockId;
  if (filters.search) where['flatNumber'] = { contains: filters.search, mode: 'insensitive' };

  const [flats, total] = await Promise.all([
    prisma.flat.findMany({
      where,
      include: flatInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: [{ flatNumber: 'asc' }],
    }),
    prisma.flat.count({ where }),
  ]);
  return { data: transformFlats(flats as any), total };
}

export async function getFlatById(societyId: number, id: string) {
  const flat = await prisma.flat.findFirst({ where: { id, societyId }, include: flatInclude });
  if (!flat) throw createError('Flat not found', 404);
  return transformFlat(flat as any);
}

export async function createFlat(societyId: number, dto: CreateFlatDto) {
  const existing = await prisma.flat.findUnique({
    where: { societyId_flatNumber: { societyId, flatNumber: dto.flatNumber } },
  });
  if (existing) throw createError(`Flat number ${dto.flatNumber} already exists`, 409);

  const flat = await prisma.flat.create({
    data: {
      societyId,
      flatNumber: dto.flatNumber,
      blockId: dto.blockId ?? null,
      floor: dto.floor ?? null,
      type: (dto.type ?? 'flat') as any,
      sqFt: dto.sqFt,
      status: dto.status ?? 'vacant',
    },
    include: flatInclude,
  });
  return transformFlat(flat);
}

export async function updateFlat(societyId: number, id: string, dto: UpdateFlatDto) {
  const flat = await prisma.flat.findFirst({ where: { id, societyId } });
  if (!flat) throw createError('Flat not found', 404);

  if (dto.flatNumber && dto.flatNumber !== flat.flatNumber) {
    const existing = await prisma.flat.findUnique({
      where: { societyId_flatNumber: { societyId, flatNumber: dto.flatNumber } },
    });
    if (existing) throw createError(`Flat number ${dto.flatNumber} already exists`, 409);
  }

  const updated = await prisma.flat.update({
    where: { id },
    data: {
      ...(dto.flatNumber !== undefined && { flatNumber: dto.flatNumber }),
      ...(dto.blockId !== undefined && { blockId: dto.blockId }),
      ...(dto.floor !== undefined && { floor: dto.floor === null ? null : dto.floor }),
      ...(dto.type !== undefined && { type: dto.type as any }),
      ...(dto.sqFt !== undefined && { sqFt: dto.sqFt }),
      ...(dto.status !== undefined && { status: dto.status }),
    } as any,
    include: flatInclude,
  });
  return transformFlat(updated as any);
}

export async function deleteFlat(societyId: number, id: string) {
  const flat = await prisma.flat.findFirst({ where: { id, societyId } });
  if (!flat) throw createError('Flat not found', 404);
  await prisma.flat.delete({ where: { id } });
}

export async function bulkCreateFlats(societyId: number, flats: BulkCreateFlatsDto) {
  // Find which flatNumbers already exist for this society
  const flatNumbers = flats.map((f) => f.flatNumber);
  const existing = await prisma.flat.findMany({
    where: { societyId, flatNumber: { in: flatNumbers } },
    select: { flatNumber: true },
  });
  const existingSet = new Set(existing.map((e) => e.flatNumber));

  const toCreate = flats.filter((f) => !existingSet.has(f.flatNumber));
  const skipped = flats
    .filter((f) => existingSet.has(f.flatNumber))
    .map((f) => f.flatNumber);

  if (toCreate.length > 0) {
    await prisma.flat.createMany({
      data: toCreate.map((f) => ({
        societyId,
        flatNumber: f.flatNumber,
        blockId: f.blockId ?? null,
        floor: (f.floor ?? null) as any,
        type: (f.type ?? 'flat') as any,
        sqFt: f.sqFt,
        status: f.status ?? 'vacant',
      })),
      skipDuplicates: true,
    });
  }

  // Fetch the created flat records so frontend can use their IDs for resident creation
  const createdFlatNumbers = toCreate.map((f) => f.flatNumber);
  const createdFlats = createdFlatNumbers.length > 0
    ? await prisma.flat.findMany({
        where: { societyId, flatNumber: { in: createdFlatNumbers } },
        select: { id: true, flatNumber: true, floor: true, type: true },
        orderBy: { flatNumber: 'asc' },
      })
    : [];

  return { created: toCreate.length, skipped, flats: createdFlats };
}