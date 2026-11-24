import prisma from '../config/db';
import { hashPassword } from '../utils/hash.utils';
import { createError } from '../middleware/error.middleware';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto';
import { PaginationParams } from '../helpers/pagination.helper';
import { User } from '@prisma/client';

function transformUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    residentId: user.residentId,
    staffId: user.staffId,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getAllUsers(
  societyId: number,
  pagination: PaginationParams,
  filters: { search?: string; role?: string; isActive?: boolean } = {}
) {
  const where: Record<string, unknown> = { societyId };

  if (filters.role) {
    where['role'] = filters.role;
  }

  if (filters.isActive !== undefined) {
    where['isActive'] = filters.isActive;
  }

  if (filters.search) {
    where['username'] = { contains: filters.search, mode: 'insensitive' };
  }

  const [users, total] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.user.findMany({
      where: where as any,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma.user.count({ where: where as any }),
  ]);
  return { data: users.map(transformUser), total };
}

export async function getUserById(societyId: number, id: string) {
  const user = await prisma.user.findFirst({ where: { id, societyId } });
  if (!user) throw createError('User not found', 404);
  return transformUser(user);
}

export async function createUser(societyId: number, dto: CreateUserDto) {
  const existing = await prisma.user.findUnique({
    where: { societyId_username: { societyId, username: dto.username } },
  });
  if (existing) throw createError('Username already taken', 409);

  const passwordHash = await hashPassword(dto.password);
  const user = await prisma.user.create({
    data: {
      societyId,
      username: dto.username,
      passwordHash,
      role: dto.role,
    },
  });
  return transformUser(user);
}

export async function updateUser(societyId: number, id: string, dto: UpdateUserDto) {
  const user = await prisma.user.findFirst({ where: { id, societyId } });
  if (!user) throw createError('User not found', 404);

  const data: Record<string, unknown> = {};
  if (dto.password !== undefined) {
    data.passwordHash = await hashPassword(dto.password);
  }
  if (dto.isActive !== undefined) data.isActive = dto.isActive;
  if (dto.role !== undefined) data.role = dto.role;

  const updated = await prisma.user.update({ where: { id }, data });
  return transformUser(updated);
}

export async function deleteUser(societyId: number, id: string, requestingUserId: string) {
  const user = await prisma.user.findFirst({ where: { id, societyId } });
  if (!user) throw createError('User not found', 404);
  if (user.id === requestingUserId) throw createError('Cannot delete your own account', 400);
  if (user.residentId) throw createError('Cannot delete a resident-linked user here. Remove the resident instead.', 400);
  if (user.staffId) throw createError('Cannot delete a staff-linked user here. Delete the staff member instead.', 400);

  await prisma.user.delete({ where: { id } });
}