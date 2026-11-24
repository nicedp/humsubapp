import prisma from '../config/db';
import { hashPassword } from '../utils/hash.utils';
import { createError } from '../middleware/error.middleware';
import { sendPasswordChangedNotification } from '../utils/email.utils';
import { transformResident, transformResidents } from '../transformers/resident.transformer';
import { transformVehicle, transformVehicles } from '../transformers/vehicle.transformer';
import { transformFamilyMembers } from '../transformers/family-member.transformer';
import { CreateResidentDto, UpdateResidentDto, CreateVehicleDto, UpdateVehicleDto, UpdateMyProfileDto, BulkCreateResidentsDto } from '../dtos/resident.dto';
import { PaginationParams } from '../helpers/pagination.helper';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface ResidentFilters {
  search?: string;
  residentType?: 'owner' | 'tenant';
  isActive?: boolean;
  flatId?: string;
}

export async function getAllResidents(pagination: PaginationParams, filters: ResidentFilters = {}, societyId: number = 1) {
  const where: Record<string, unknown> = {
    flat: { societyId },
  };
  if (filters.residentType) where['residentType'] = filters.residentType;
  if (filters.isActive !== undefined) where['isActive'] = filters.isActive;
  if (filters.flatId) where['flatId'] = filters.flatId;
  if (filters.search) {
    where['OR'] = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
      { flat: { flatNumber: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [residents, total] = await Promise.all([
    prisma.resident.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true, user: true },
      orderBy: { name: 'asc' },
    }),
    prisma.resident.count({ where }),
  ]);

  // Re-derive numCars / numBikes from actual Vehicle records to fix stale counter issue.
  // We fetch vehicle type breakdown for all residents in one query.
  const residentIds = residents.map(r => r.id);
  const vehicleCounts = await prisma.vehicle.groupBy({
    by: ['residentId', 'vehicleType'],
    where: { residentId: { in: residentIds }, isActive: true },
    _count: { id: true },
  });

  // Build a map: residentId → { numCars, numBikes }
  const vehicleMap = new Map<string, { numCars: number; numBikes: number }>();
  for (const row of vehicleCounts) {
    if (!vehicleMap.has(row.residentId)) {
      vehicleMap.set(row.residentId, { numCars: 0, numBikes: 0 });
    }
    const entry = vehicleMap.get(row.residentId)!;
    if (row.vehicleType === 'car') {
      entry.numCars += row._count.id;
    } else {
      // bike, scooter, other all count as bikes
      entry.numBikes += row._count.id;
    }
  }

  // Patch the numCars/numBikes on each resident before transforming
  const patchedResidents = residents.map(r => ({
    ...r,
    numCars: vehicleMap.get(r.id)?.numCars ?? 0,
    numBikes: vehicleMap.get(r.id)?.numBikes ?? 0,
  }));

  return { data: transformResidents(patchedResidents), total };
}

export async function getMyProfile(residentId: string) {
  const resident = await prisma.resident.findUnique({
    where: { id: residentId },
    include: { flat: true, user: true },
  });
  if (!resident) throw createError('Resident profile not found', 404);
  return transformResident(resident);
}

export async function updateMyProfile(residentId: string, dto: UpdateMyProfileDto) {
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  const updated = await prisma.resident.update({
    where: { id: residentId },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
    },
    include: { flat: true, user: true },
  });
  return transformResident(updated);
}

export async function getResidentById(id: string) {
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: { flat: true, user: true },
  });
  if (!resident) throw createError('Resident not found', 404);
  return transformResident(resident);
}

export async function createResident(dto: CreateResidentDto) {
  // Check flat exists
  const flat = await prisma.flat.findUnique({ where: { id: dto.flatId } });
  if (!flat) throw createError('Flat not found', 404);

  // Check email uniqueness (only if email provided)
  if (dto.email) {
    const emailExists = await prisma.resident.findUnique({ where: { email: dto.email } });
    if (emailExists) throw createError('Email already in use', 409);
  }

  // Check username uniqueness (only if username provided)
  if (dto.username) {
    const usernameExists = await prisma.user.findUnique({
      where: { societyId_username: { societyId: flat.societyId, username: dto.username } },
    });
    if (usernameExists) throw createError('Username already taken', 409);
  }

  const resident = await prisma.$transaction(async (tx: TxClient) => {
    const newResident = await (tx.resident as any).create({
      data: {
        name: dto.name,
        ...(dto.email ? { email: dto.email } : {}),
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        flatId: dto.flatId,
        residentType: dto.residentType,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        numCars: dto.numCars ?? 0,
        numBikes: dto.numBikes ?? 0,
      },
    });

    if (dto.username && dto.password) {
      const passwordHash = await hashPassword(dto.password);
      await tx.user.create({
        data: {
          societyId: flat.societyId,
          username: dto.username,
          passwordHash,
          role: dto.residentType === 'owner' ? 'owner' : 'tenant',
          residentId: newResident.id,
        },
      });
    }

    // Mark flat as occupied
    await tx.flat.update({
      where: { id: dto.flatId },
      data: { status: 'occupied' },
    });

    return newResident;
  });

  return getResidentById(resident.id);
}

export async function updateResident(id: string, dto: UpdateResidentDto) {
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: { user: true, flat: true },
  });
  if (!resident) throw createError('Resident not found', 404);

  if (dto.email && dto.email !== resident.email) {
    const existing = await prisma.resident.findUnique({ where: { email: dto.email } });
    if (existing) throw createError('Email already in use', 409);
  }

  // Extract credential fields from dto before updating resident fields
  const { username, password, ...residentFields } = dto;

  const updated = await prisma.$transaction(async (tx: TxClient) => {
    const updatedResident = await tx.resident.update({
      where: { id },
      data: {
        ...residentFields,
        moveOutDate: residentFields.moveOutDate ? new Date(residentFields.moveOutDate) : undefined,
      },
      include: { flat: true, user: true },
    });

    if (password && resident.user) {
      // Resident already has a login account — update the password
      const passwordHash = await hashPassword(password);
      await tx.user.update({
        where: { id: resident.user.id },
        data: { passwordHash },
      });
    } else if (username && password && !resident.user) {
      // Resident has no login — create one
      const usernameExists = await tx.user.findUnique({
        where: { societyId_username: { societyId: resident.flat!.societyId, username } },
      });
      if (usernameExists) throw createError('Username already taken', 409);
      const passwordHash = await hashPassword(password);
      await tx.user.create({
        data: {
          societyId: resident.flat!.societyId,
          username,
          passwordHash,
          role: resident.residentType === 'owner' ? 'owner' : 'tenant',
          residentId: id,
        },
      });
    }

    return updatedResident;
  });

  return getResidentById(updated.id);
}

// ─── Vehicle Service Methods ──────────────────────────────────────────────────

export async function getVehiclesByResident(residentId: string) {
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  const vehicles = await prisma.vehicle.findMany({
    where: { residentId },
    include: { resident: true },
    orderBy: { createdAt: 'asc' },
  });
  return transformVehicles(vehicles);
}

export async function getVehicleById(residentId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, residentId },
    include: { resident: true },
  });
  if (!vehicle) throw createError('Vehicle not found', 404);
  return transformVehicle(vehicle);
}

export async function addVehicle(residentId: string, dto: CreateVehicleDto) {
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  // Check vehicle number uniqueness
  const existing = await prisma.vehicle.findUnique({ where: { vehicleNumber: dto.vehicleNumber } });
  if (existing) throw createError(`Vehicle number ${dto.vehicleNumber} already registered`, 409);

  const isCar = dto.vehicleType === 'car';

  const vehicle = await prisma.$transaction(async (tx: TxClient) => {
    const newVehicle = await tx.vehicle.create({
      data: {
        residentId,
        flatId: resident.flatId,
        vehicleType: dto.vehicleType,
        vehicleNumber: dto.vehicleNumber,
        make: dto.make,
        model: dto.model,
        color: dto.color,
      },
      include: { resident: true },
    });

    // Keep numCars / numBikes counter in sync
    await tx.resident.update({
      where: { id: residentId },
      data: isCar ? { numCars: { increment: 1 } } : { numBikes: { increment: 1 } },
    });

    return newVehicle;
  });

  return transformVehicle(vehicle);
}

export async function updateVehicle(residentId: string, vehicleId: string, dto: UpdateVehicleDto) {
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, residentId } });
  if (!vehicle) throw createError('Vehicle not found', 404);

  if (dto.vehicleNumber && dto.vehicleNumber !== vehicle.vehicleNumber) {
    const existing = await prisma.vehicle.findUnique({ where: { vehicleNumber: dto.vehicleNumber } });
    if (existing) throw createError(`Vehicle number ${dto.vehicleNumber} already registered`, 409);
  }

  const updated = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...(dto.vehicleType !== undefined && { vehicleType: dto.vehicleType }),
      ...(dto.vehicleNumber !== undefined && { vehicleNumber: dto.vehicleNumber }),
      ...(dto.make !== undefined && { make: dto.make }),
      ...(dto.model !== undefined && { model: dto.model }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    },
    include: { resident: true },
  });
  return transformVehicle(updated);
}

export async function deleteVehicle(residentId: string, vehicleId: string) {
  const vehicle = await prisma.vehicle.findFirst({ where: { id: vehicleId, residentId } });
  if (!vehicle) throw createError('Vehicle not found', 404);

  const isCar = vehicle.vehicleType === 'car';

  await prisma.$transaction(async (tx: TxClient) => {
    await tx.vehicle.delete({ where: { id: vehicleId } });

    // Keep numCars / numBikes counter in sync (floor at 0 to avoid negatives)
    const resident = await tx.resident.findUnique({ where: { id: residentId } });
    if (resident) {
      await tx.resident.update({
        where: { id: residentId },
        data: isCar
          ? { numCars: Math.max(0, resident.numCars - 1) }
          : { numBikes: Math.max(0, resident.numBikes - 1) },
      });
    }
  });
}

export async function deleteResident(id: string) {
  const resident = await prisma.resident.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!resident) throw createError('Resident not found', 404);

  await prisma.$transaction(async (tx: TxClient) => {
    if (resident.user) {
      await tx.user.delete({ where: { id: resident.user.id } });
    }
    await tx.resident.delete({ where: { id } });

    // Check if any active residents remain in the flat
    const remaining = await tx.resident.count({
      where: { flatId: resident.flatId, isActive: true },
    });
    if (remaining === 0) {
      await tx.flat.update({ where: { id: resident.flatId }, data: { status: 'vacant' } });
    }
  });
}

// ─── Bulk Create Residents ────────────────────────────────────────────────────

export interface BulkResidentRowResult {
  index: number;
  status: 'created' | 'error';
  id?: string;
  name?: string;
  reason?: string;
}

export interface BulkResidentResult {
  total: number;
  created: number;
  errors: number;
  rows: BulkResidentRowResult[];
}

export async function bulkCreateResidents(dto: BulkCreateResidentsDto, societyId: number = 1): Promise<BulkResidentResult> {
  const rows: BulkResidentRowResult[] = [];
  let created = 0;

  for (let i = 0; i < dto.residents.length; i++) {
    const item = dto.residents[i];
    try {
      // Validate flat exists and belongs to society
      const flat = await prisma.flat.findFirst({ where: { id: item.flatId, societyId } });
      if (!flat) {
        rows.push({ index: i, status: 'error', name: item.name, reason: `Flat not found or not in society` });
        continue;
      }

      // Check email uniqueness (only if email provided)
      if (item.email) {
        const emailExists = await prisma.resident.findUnique({ where: { email: item.email } });
        if (emailExists) {
          rows.push({ index: i, status: 'error', name: item.name, reason: `Email ${item.email} already in use` });
          continue;
        }
      }

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

      const resident = await prisma.$transaction(async (tx: TxClient) => {
        const newResident = await (tx.resident as any).create({
          data: {
            name: item.name,
            ...(item.email ? { email: item.email } : {}),
            phone: item.phone,
            whatsapp: item.whatsapp,
            flatId: item.flatId,
            residentType: item.residentType,
            moveInDate: item.moveInDate ? new Date(item.moveInDate) : undefined,
            numCars: item.numCars ?? 0,
            numBikes: item.numBikes ?? 0,
          },
        });

        if (item.username && item.password) {
          const passwordHash = await hashPassword(item.password);
          await tx.user.create({
            data: {
              societyId: flat.societyId,
              username: item.username,
              passwordHash,
              role: item.residentType === 'owner' ? 'owner' : 'tenant',
              residentId: newResident.id,
            },
          });
        }

        await tx.flat.update({ where: { id: item.flatId }, data: { status: 'occupied' } });

        return newResident;
      });

      rows.push({ index: i, status: 'created', id: resident.id, name: resident.name });
      created++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      rows.push({ index: i, status: 'error', name: item.name, reason: message });
    }
  }

  return { total: dto.residents.length, created, errors: dto.residents.length - created, rows };
}
// ─── Admin: Change Resident Password ─────────────────────────────────────────

export async function adminChangeResidentPassword(
  residentId: string,
  newPassword: string,
  notify: 'email' | 'whatsapp' | 'none',
  societyId: number
): Promise<{ success: boolean; notified: string }> {
  const resident = await prisma.resident.findFirst({
    where: { id: residentId, flat: { societyId } },
    include: { user: true },
  });
  if (!resident) throw createError('Resident not found', 404);
  if (!resident.user) throw createError('This resident has no portal account', 400);

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: resident.user.id },
    data: { passwordHash: newHash },
  });

  // Send email notification if requested and email is available
  if (notify === 'email' && resident.email) {
    await sendPasswordChangedNotification(resident.email, resident.user.username);
  }

  return { success: true, notified: notify };
}

// ─── Resident Profile (aggregated for profile page) ──────────────────────────

export async function getResidentProfile(id: string, societyId: number) {
  const resident = await prisma.resident.findFirst({
    where: { id, flat: { societyId } },
    include: {
      flat: { include: { block: true, parkingSlots: true } },
      user: true,
    },
  });
  if (!resident) throw createError('Resident not found', 404);

  const flatId = resident.flatId;
  const userId = resident.user?.id;

  const [
    vehicles,
    familyMembers,
    bills,
    complaints,
    recentVisitors,
    committeeRoles,
    adminNotes,
    loginSession,
  ] = await Promise.all([
    prisma.vehicle.findMany({ where: { residentId: id }, orderBy: { createdAt: 'asc' } }),
    (prisma as any).familyMember.findMany({ where: { residentId: id }, orderBy: { createdAt: 'asc' } }),
    prisma.maintenanceBill.findMany({
      where: { flatId },
      include: { payment: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 24,
    }),
    prisma.complaint.findMany({ where: { flatId }, orderBy: { raisedOn: 'desc' }, take: 20 }),
    prisma.visitor.findMany({ where: { flatId }, orderBy: { entryTime: 'desc' }, take: 10 }),
    (prisma as any).committeeMember.findMany({
      where: { residentId: id },
      include: { committee: true },
      orderBy: { joinedOn: 'desc' },
    }),
    userId
      ? (prisma as any).userNote.findMany({
          where: { userId },
          orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
          take: 20,
        })
      : Promise.resolve([]),
    userId
      ? (prisma as any).loginSession.findFirst({ where: { userId }, orderBy: { loggedAt: 'desc' } })
      : Promise.resolve(null),
  ]);

  const typedBills = bills as Array<{ status: string; amount: number; payment?: { amountPaid: number } | null }>;
  const outstanding = typedBills
    .filter(b => b.status === 'unpaid' || b.status === 'overdue')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = typedBills
    .filter(b => b.status === 'paid')
    .reduce((sum, b) => sum + (b.payment?.amountPaid ?? b.amount), 0);
  const typedComplaints = complaints as Array<{ status: string }>;
  const openComplaints = typedComplaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;

  const flatAny = resident.flat as any;

  // Re-derive numCars/numBikes from the live vehicles array (counters in DB can drift)
  const numCars = (vehicles as any[]).filter(v => v.vehicleType === 'car').length;
  const numBikes = (vehicles as any[]).filter(v => v.vehicleType !== 'car').length;

  return {
    resident: {
      ...transformResident(resident),
      numCars,
      numBikes,
      dateOfBirth: (resident as any).dateOfBirth ?? null,
      idProofType: (resident as any).idProofType ?? null,
      idProofNumber: (resident as any).idProofNumber ?? null,
      emergencyContactName: (resident as any).emergencyContactName ?? null,
      emergencyContactPhone: (resident as any).emergencyContactPhone ?? null,
    },
    flat: {
      id: flatAny.id,
      flatNumber: flatAny.flatNumber,
      floor: flatAny.floor,
      type: flatAny.type,
      sqFt: flatAny.sqFt,
      status: flatAny.status,
      block: flatAny.block
        ? { id: flatAny.block.id, name: flatAny.block.name, blockType: flatAny.block.blockType }
        : null,
      parkingSlots: (flatAny.parkingSlots ?? []).map((p: any) => ({
        id: p.id, slotNumber: p.slotNumber, vehicleNumber: p.vehicleNumber, vehicleType: p.vehicleType,
      })),
    },
    vehicles: transformVehicles(vehicles as any),
    familyMembers: transformFamilyMembers(familyMembers),
    billing: {
      summary: { outstanding, totalPaid, billCount: bills.length },
      recent: (bills as any[]).map(b => ({
        id: b.id, month: b.month, year: b.year, amount: b.amount, status: b.status, dueDate: b.dueDate,
        payment: b.payment
          ? { amountPaid: b.payment.amountPaid, paidOn: b.payment.paidOn, paymentMode: b.payment.paymentMode }
          : null,
      })),
    },
    complaints: {
      openCount: openComplaints,
      recent: (complaints as any[]).map(c => ({
        id: c.id, category: c.category, description: c.description,
        status: c.status, raisedOn: c.raisedOn, resolvedOn: c.resolvedOn,
      })),
    },
    recentVisitors: (recentVisitors as any[]).map(v => ({
      id: v.id, visitorName: v.visitorName, visitorType: v.visitorType,
      purpose: v.purpose, entryTime: v.entryTime, exitTime: v.exitTime,
    })),
    committeeRoles: (committeeRoles as any[]).map(m => ({
      id: m.id, committeeName: m.committee.name, designation: m.designation,
      isActive: m.isActive, joinedOn: m.joinedOn, leftOn: m.leftOn,
    })),
    adminNotes: (adminNotes as any[]).map(n => ({
      id: n.id, title: n.title, content: n.content, color: n.color,
      isPinned: n.isPinned, createdAt: n.createdAt, updatedAt: n.updatedAt,
    })),
    portalAccount: resident.user
      ? {
          userId: resident.user.id,
          username: resident.user.username,
          role: resident.user.role,
          isActive: resident.user.isActive,
          lastLogin: loginSession ? (loginSession as any).loggedAt : null,
        }
      : null,
  };
}