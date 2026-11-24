import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformHelper, transformHelpers } from '../transformers/helper.transformer';
import { CreateHelperDto, UpdateHelperDto, GetHelpersQueryDto, BulkCreateHelpersDto } from '../dtos/helper.dto';
import { uploadFile, deleteFile } from './storage.service';
import { PaginationParams } from '../helpers/pagination.helper';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const helperDb = (prisma as any).helper;

export async function getHelpers(query: GetHelpersQueryDto, societyId: number = 1) {
  const where: Record<string, unknown> = { societyId };

  if (query.category) where['category'] = query.category;
  if (query.isActive !== undefined) where['isActive'] = query.isActive === 'true';
  if (query.search) {
    where['OR'] = [
      { name:        { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [helpers, total] = await Promise.all([
    helperDb.findMany({
      where,
      skip:    query.skip,
      take:    query.limit,
      orderBy: [{ isActive: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    }),
    helperDb.count({ where }),
  ]);

  return { data: transformHelpers(helpers), total };
}

export async function getHelperById(id: string) {
  const helper = await helperDb.findUnique({ where: { id } });
  if (!helper) throw createError('Helper not found', 404);
  return transformHelper(helper);
}

export async function createHelper(dto: CreateHelperDto, addedBy: string, societyId: number = 1) {
  const helper = await helperDb.create({
    data: {
      societyId,
      name:           dto.name,
      phone:          dto.phone,
      alternatePhone: dto.alternatePhone ?? null,
      email:          dto.email ?? null,
      category:       dto.category,
      description:    dto.description ?? null,
      isActive:       dto.isActive ?? true,
      addedBy,
    },
  });
  return transformHelper(helper);
}

export async function updateHelper(id: string, dto: UpdateHelperDto) {
  const existing = await helperDb.findUnique({ where: { id } });
  if (!existing) throw createError('Helper not found', 404);

  const helper = await helperDb.update({
    where: { id },
    data:  {
      ...(dto.name           !== undefined && { name:           dto.name }),
      ...(dto.phone          !== undefined && { phone:          dto.phone }),
      ...(dto.alternatePhone !== undefined && { alternatePhone: dto.alternatePhone }),
      ...(dto.email          !== undefined && { email:          dto.email }),
      ...(dto.category       !== undefined && { category:       dto.category }),
      ...(dto.description    !== undefined && { description:    dto.description }),
      ...(dto.isActive       !== undefined && { isActive:       dto.isActive }),
    },
  });
  return transformHelper(helper);
}

export async function deleteHelper(id: string) {
  const existing = await helperDb.findUnique({ where: { id } });
  if (!existing) throw createError('Helper not found', 404);

  // Delete photo if exists
  if (existing.photoUrl) {
    await deleteFile(existing.photoUrl);
  }

  await helperDb.delete({ where: { id } });
}

export async function uploadHelperPhoto(id: string, buffer: Buffer, mimeType: string) {
  const existing = await helperDb.findUnique({ where: { id } });
  if (!existing) throw createError('Helper not found', 404);

  // Delete old photo if exists
  if (existing.photoUrl) {
    await deleteFile(existing.photoUrl);
  }

  const ext = mimeType.split('/')[1] ?? 'jpg';
  const url = await uploadFile(buffer, ext, mimeType);

  const helper = await helperDb.update({
    where: { id },
    data:  { photoUrl: url },
  });

  return transformHelper(helper);
}

// ─── Bulk Create Helpers ──────────────────────────────────────────────────────

export interface BulkHelperRowResult {
  index: number;
  status: 'created' | 'error';
  id?: string;
  name?: string;
  reason?: string;
}

export interface BulkHelperResult {
  total: number;
  created: number;
  errors: number;
  rows: BulkHelperRowResult[];
}

export async function bulkCreateHelpers(dto: BulkCreateHelpersDto, addedBy: string, societyId: number = 1): Promise<BulkHelperResult> {
  const rows: BulkHelperRowResult[] = [];
  let created = 0;

  for (let i = 0; i < dto.helpers.length; i++) {
    const item = dto.helpers[i];
    try {
      const helper = await helperDb.create({
        data: {
          societyId,
          name:           item.name,
          phone:          item.phone,
          alternatePhone: item.alternatePhone ?? null,
          email:          item.email ?? null,
          category:       item.category,
          description:    item.description ?? null,
          isActive:       item.isActive ?? true,
          addedBy,
        },
      });

      rows.push({ index: i, status: 'created', id: helper.id, name: helper.name });
      created++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      rows.push({ index: i, status: 'error', name: item.name, reason: message });
    }
  }

  return { total: dto.helpers.length, created, errors: dto.helpers.length - created, rows };
}