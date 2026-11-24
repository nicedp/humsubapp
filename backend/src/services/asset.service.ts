import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformAsset, transformAssets } from '../transformers/asset.transformer';
import { CreateAssetDto, UpdateAssetDto } from '../dtos/asset.dto';
import { PaginationParams } from '../helpers/pagination.helper';

export async function getAllAssets(
  societyId: number,
  type: string | undefined,
  status: string | undefined,
  search: string | undefined,
  pagination: PaginationParams
) {
  const where: Record<string, unknown> = { societyId };
  if (type) where['type'] = type;
  if (status) where['status'] = status;
  if (search) {
    where['OR'] = [
      { name: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { name: 'asc' },
    }),
    prisma.asset.count({ where }),
  ]);
  return { data: transformAssets(assets), total };
}

export async function getAssetById(societyId: number, id: string) {
  const asset = await prisma.asset.findFirst({ where: { id, societyId } });
  if (!asset) throw createError('Asset not found', 404);
  return transformAsset(asset);
}

export async function createAsset(societyId: number, dto: CreateAssetDto) {
  const asset = await prisma.asset.create({
    data: {
      societyId,
      name: dto.name,
      type: dto.type as 'lift' | 'borewell' | 'water_tank' | 'generator' | 'other',
      status: (dto.status ?? 'operational') as 'operational' | 'under_maintenance' | 'out_of_service',
      location: dto.location,
      lastServiceDate: dto.lastServiceDate ? new Date(dto.lastServiceDate) : undefined,
      nextServiceDue: dto.nextServiceDue ? new Date(dto.nextServiceDue) : undefined,
      notes: dto.notes,
    },
  });
  return transformAsset(asset);
}

export async function updateAsset(societyId: number, id: string, dto: UpdateAssetDto) {
  const asset = await prisma.asset.findFirst({ where: { id, societyId } });
  if (!asset) throw createError('Asset not found', 404);

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      ...(dto.name && { name: dto.name }),
      ...(dto.type && { type: dto.type as 'lift' | 'borewell' | 'water_tank' | 'generator' | 'other' }),
      ...(dto.status && { status: dto.status as 'operational' | 'under_maintenance' | 'out_of_service' }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.lastServiceDate && { lastServiceDate: new Date(dto.lastServiceDate) }),
      ...(dto.nextServiceDue && { nextServiceDue: new Date(dto.nextServiceDue) }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
  });
  return transformAsset(updated);
}

export async function deleteAsset(societyId: number, id: string) {
  const asset = await prisma.asset.findFirst({ where: { id, societyId } });
  if (!asset) throw createError('Asset not found', 404);
  await prisma.asset.delete({ where: { id } });
}