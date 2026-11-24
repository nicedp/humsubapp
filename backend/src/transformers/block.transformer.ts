import { Block } from '@prisma/client';

export function transformBlock(block: Block & { _count?: { flats: number } }) {
  return {
    id: block.id,
    societyId: block.societyId,
    name: block.name,
    description: block.description ?? null,
    blockType: block.blockType,
    totalFloors: block.totalFloors ?? null,
    isActive: block.isActive,
    flatCount: block._count?.flats ?? undefined,
    createdAt: block.createdAt,
    updatedAt: block.updatedAt,
  };
}

export function transformBlocks(blocks: (Block & { _count?: { flats: number } })[]) {
  return blocks.map(transformBlock);
}