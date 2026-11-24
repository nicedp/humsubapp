import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformNotice, transformNotices } from '../transformers/notice.transformer';
import { CreateNoticeDto, UpdateNoticeDto } from '../dtos/notice.dto';
import { PaginationParams } from '../helpers/pagination.helper';

export async function getAllNotices(societyId: number, pagination: PaginationParams, activeOnly = false) {
  const where = {
    societyId,
    ...(activeOnly && {
      OR: [
        { expiresOn: null },
        { expiresOn: { gte: new Date() } },
      ],
    }),
  };

  const [notices, total] = await Promise.all([
    prisma.notice.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { postedOn: 'desc' },
    }),
    prisma.notice.count({ where }),
  ]);
  return { data: transformNotices(notices), total };
}

export async function getNoticeById(societyId: number, id: string) {
  const notice = await prisma.notice.findFirst({ where: { id, societyId } });
  if (!notice) throw createError('Notice not found', 404);
  return transformNotice(notice);
}

export async function createNotice(societyId: number, dto: CreateNoticeDto, postedBy: string) {
  const notice = await prisma.notice.create({
    data: {
      societyId,
      title: dto.title,
      body: dto.body,
      priority: dto.priority as 'low' | 'normal' | 'high' | 'urgent',
      postedBy,
      expiresOn: dto.expiresOn ? new Date(dto.expiresOn) : undefined,
    },
  });
  return transformNotice(notice);
}

export async function updateNotice(societyId: number, id: string, dto: UpdateNoticeDto) {
  const notice = await prisma.notice.findFirst({ where: { id, societyId } });
  if (!notice) throw createError('Notice not found', 404);

  const updated = await prisma.notice.update({
    where: { id },
    data: {
      ...(dto.title && { title: dto.title }),
      ...(dto.body && { body: dto.body }),
      ...(dto.priority && { priority: dto.priority as 'low' | 'normal' | 'high' | 'urgent' }),
      ...(dto.expiresOn !== undefined && {
        expiresOn: dto.expiresOn ? new Date(dto.expiresOn) : null,
      }),
    },
  });
  return transformNotice(updated);
}

export async function deleteNotice(societyId: number, id: string) {
  const notice = await prisma.notice.findFirst({ where: { id, societyId } });
  if (!notice) throw createError('Notice not found', 404);
  await prisma.notice.delete({ where: { id } });
}