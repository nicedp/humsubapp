import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { CreateBlockDto, UpdateBlockDto } from '../dtos/block.dto';

export async function getAllBlocks(societyId: number) {
  return prisma.block.findMany({
    where: { societyId },
    include: { _count: { select: { flats: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function getBlockById(id: string, societyId: number) {
  const block = await prisma.block.findFirst({
    where: { id, societyId },
    include: { _count: { select: { flats: true } } },
  });
  if (!block) throw createError('Block not found', 404);
  return block;
}

export async function createBlock(societyId: number, dto: CreateBlockDto) {
  const existing = await prisma.block.findFirst({ where: { societyId, name: dto.name } });
  if (existing) throw createError(`A block named "${dto.name}" already exists`, 409);

  return prisma.block.create({
    data: {
      societyId,
      name: dto.name,
      description: dto.description ?? null,
      blockType: dto.blockType ?? 'flats',
      totalFloors: dto.totalFloors ?? null,
    },
    include: { _count: { select: { flats: true } } },
  });
}

export async function updateBlock(id: string, societyId: number, dto: UpdateBlockDto) {
  await getBlockById(id, societyId);

  if (dto.name) {
    const conflict = await prisma.block.findFirst({
      where: { societyId, name: dto.name, NOT: { id } },
    });
    if (conflict) throw createError(`A block named "${dto.name}" already exists`, 409);
  }

  return prisma.block.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.blockType !== undefined && { blockType: dto.blockType }),
      ...(dto.totalFloors !== undefined && { totalFloors: dto.totalFloors }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    },
    include: { _count: { select: { flats: true } } },
  });
}

export async function deleteBlock(id: string, societyId: number) {
  const block = await getBlockById(id, societyId);
  const flatCount = (block as any)._count?.flats ?? 0;
  if (flatCount > 0) {
    throw createError('Cannot delete block with assigned properties. Reassign or remove them first.', 409);
  }
  await prisma.block.delete({ where: { id } });
}