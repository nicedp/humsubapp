import prisma from '../config/db';
import { hashPassword } from '../utils/hash.utils';
import { createError } from '../middleware/error.middleware';
import { transformStaff, transformStaffList } from '../transformers/staff.transformer';
import { CreateStaffDto, UpdateStaffDto, BulkCreateStaffDto } from '../dtos/staff.dto';
import { PaginationParams } from '../helpers/pagination.helper';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function getAllStaff(
  societyId: number,
  role: string | undefined,
  isActive: boolean | undefined,
  search: string | undefined,
  pagination: PaginationParams
) {
  const where: Record<string, unknown> = { societyId };
  if (role) where['role'] = role;
  if (isActive !== undefined) where['isActive'] = isActive;
  if (search) {
    where['OR'] = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [staffList, total] = await Promise.all([
    prisma.staff.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { name: 'asc' },
    }),
    prisma.staff.count({ where }),
  ]);
  return { data: transformStaffList(staffList), total };
}

export async function getStaffById(societyId: number, id: string) {
  const staff = await prisma.staff.findFirst({ where: { id, societyId } });
  if (!staff) throw createError('Staff member not found', 404);
  return transformStaff(staff);
}

export async function createStaff(societyId: number, dto: CreateStaffDto) {
  // If username/password provided, create user account (for security guards)
  if (dto.username && dto.password) {
    const usernameExists = await prisma.user.findUnique({
      where: { societyId_username: { societyId, username: dto.username } },
    });
    if (usernameExists) throw createError('Username already taken', 409);
  }

  const staff = await prisma.$transaction(async (tx: TxClient) => {
    const newStaff = await tx.staff.create({
      data: {
        societyId,
        name: dto.name,
        role: dto.role,
        phone: dto.phone,
        shift: dto.shift,
        joinDate: dto.joinDate ? new Date(dto.joinDate) : new Date(),
      },
    });

    if (dto.username && dto.password) {
      const passwordHash = await hashPassword(dto.password);
      await tx.user.create({
        data: {
          societyId,
          username: dto.username,
          passwordHash,
          role: 'security',
          staffId: newStaff.id,
        },
      });
    }

    return newStaff;
  });

  return transformStaff(staff);
}

export async function updateStaff(societyId: number, id: string, dto: UpdateStaffDto) {
  const staff = await prisma.staff.findFirst({ where: { id, societyId } });
  if (!staff) throw createError('Staff member not found', 404);

  const updated = await prisma.staff.update({
    where: { id },
    data: {
      ...(dto.name && { name: dto.name }),
      ...(dto.role && { role: dto.role }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.shift !== undefined && { shift: dto.shift }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    },
  });
  return transformStaff(updated);
}

export async function deleteStaff(societyId: number, id: string) {
  const staff = await prisma.staff.findFirst({
    where: { id, societyId },
    include: { user: true },
  });
  if (!staff) throw createError('Staff member not found', 404);

  await prisma.$transaction(async (tx: TxClient) => {
    if (staff.user) {
      await tx.user.delete({ where: { id: staff.user.id } });
    }
    await tx.staff.delete({ where: { id } });
  });
}

// ─── Bulk Create Staff ────────────────────────────────────────────────────────

export interface BulkStaffRowResult {
  index: number;
  status: 'created' | 'error';
  id?: string;
  name?: string;
  reason?: string;
}

export interface BulkStaffResult {
  total: number;
  created: number;
  errors: number;
  rows: BulkStaffRowResult[];
}

export async function bulkCreateStaff(societyId: number, dto: BulkCreateStaffDto): Promise<BulkStaffResult> {
  const rows: BulkStaffRowResult[] = [];
  let created = 0;

  for (let i = 0; i < dto.staff.length; i++) {
    const item = dto.staff[i];
    try {
      // Check username uniqueness if provided
      if (item.username) {
        const usernameExists = await prisma.user.findUnique({
          where: { societyId_username: { societyId, username: item.username } },
        });
        if (usernameExists) {
          rows.push({ index: i, status: 'error', name: item.name, reason: `Username ${item.username} already taken` });
          continue;
        }
      }

      const staff = await prisma.$transaction(async (tx: TxClient) => {
        const newStaff = await tx.staff.create({
          data: {
            societyId,
            name: item.name,
            role: item.role,
            phone: item.phone,
            shift: item.shift,
            joinDate: item.joinDate ? new Date(item.joinDate) : new Date(),
          },
        });

        if (item.username && item.password) {
          const passwordHash = await hashPassword(item.password);
          await tx.user.create({
            data: {
              societyId,
              username: item.username,
              passwordHash,
              role: 'security',
              staffId: newStaff.id,
            },
          });
        }

        return newStaff;
      });

      rows.push({ index: i, status: 'created', id: staff.id, name: staff.name });
      created++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      rows.push({ index: i, status: 'error', name: item.name, reason: message });
    }
  }

  return { total: dto.staff.length, created, errors: dto.staff.length - created, rows };
}