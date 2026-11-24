import { Response } from 'express';
import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformVisitor, transformVisitors } from '../transformers/visitor.transformer';
import { LogVisitorEntryDto, GetVisitorsQueryDto } from '../dtos/visitor.dto';
import { PaginationParams } from '../helpers/pagination.helper';

// ─── Helper ────────────────────────────────────────────────────────────────────

function buildVisitorWhere(query: Partial<GetVisitorsQueryDto>): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (query.flatId)      where['flatId']      = query.flatId;
  if (query.visitorType) where['visitorType'] = query.visitorType;

  if (query.hasExit === 'true')  where['exitTime'] = { not: null };
  if (query.hasExit === 'false') where['exitTime'] = null;

  if (query.dateFrom || query.dateTo) {
    where['entryTime'] = {
      ...(query.dateFrom ? { gte: query.dateFrom } : {}),
      ...(query.dateTo   ? { lte: new Date(new Date(query.dateTo).setHours(23, 59, 59, 999)) } : {}),
    };
  }

  if (query.search) {
    where['OR'] = [
      { visitorName: { contains: query.search, mode: 'insensitive' } },
      { flat: { flatNumber: { contains: query.search, mode: 'insensitive' } } },
      { purpose: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  return where;
}

// ─── Public functions ──────────────────────────────────────────────────────────

export async function getMyVisitors(residentId: string, pagination: PaginationParams) {
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  const where = { flatId: resident.flatId };
  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      skip:    pagination.skip,
      take:    pagination.limit,
      include: { flat: true },
      orderBy: { entryTime: 'desc' },
    }),
    prisma.visitor.count({ where }),
  ]);

  return { data: transformVisitors(visitors as any[]), total };
}

export async function logEntry(dto: LogVisitorEntryDto, loggedBy: string) {
  const flat = await prisma.flat.findUnique({ where: { id: dto.flatId } });
  if (!flat) throw createError('Flat not found', 404);

  const visitor = await (prisma.visitor.create as any)({
    data: {
      flatId:        dto.flatId,
      visitorName:   dto.visitorName,
      phone:         dto.phone ?? null,
      vehicleNumber: dto.vehicleNumber ?? null,
      visitorType:   dto.visitorType,
      purpose:       dto.purpose ?? null,
      loggedBy,
    },
    include: { flat: true },
  });

  // Create notification for residents of the flat
  const residents = await prisma.resident.findMany({
    where: { flatId: dto.flatId, isActive: true },
    include: { user: true },
  });

  const typeLabel: Record<string, string> = {
    guest: 'Guest', delivery: 'Delivery', milkman: 'Milkman',
    service: 'Service', plumber: 'Plumber', electrician: 'Electrician',
    dth: 'DTH', broadband: 'Broadband', solar: 'Solar', gas: 'Gas',
    cab: 'Cab', courier: 'Courier', other: 'Visitor',
  };
  const visitorLabel = typeLabel[dto.visitorType] ?? 'Visitor';

  const notificationData: { userId: string; flatId: string; message: string }[] = [];
  for (const r of residents) {
    if (r.user) {
      notificationData.push({
        userId:  r.user.id,
        flatId:  dto.flatId,
        message: `${visitorLabel} "${dto.visitorName}" has arrived at flat ${flat.flatNumber}${dto.purpose ? ` — ${dto.purpose}` : ''}.`,
      });
    }
  }

  if (notificationData.length > 0) {
    await prisma.notification.createMany({ data: notificationData });
  }

  return transformVisitor(visitor);
}

export async function logExit(visitorId: string, exitTime?: string) {
  const visitor = await prisma.visitor.findUnique({ where: { id: visitorId } });
  if (!visitor) throw createError('Visitor record not found', 404);
  if (visitor.exitTime) throw createError('Exit already recorded', 409);

  const updated = await prisma.visitor.update({
    where:   { id: visitorId },
    data:    { exitTime: exitTime ? new Date(exitTime) : new Date() },
    include: { flat: true },
  });

  return transformVisitor(updated as any);
}

export async function getVisitors(query: GetVisitorsQueryDto, societyId: number = 1) {
  const where = { ...buildVisitorWhere(query), flat: { societyId } };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      skip:    query.skip,
      take:    query.limit,
      include: { flat: true },
      orderBy: { entryTime: 'desc' },
    }),
    prisma.visitor.count({ where }),
  ]);

  return { data: transformVisitors(visitors as any[]), total };
}

export async function getVisitorById(id: string) {
  const visitor = await prisma.visitor.findUnique({
    where:   { id },
    include: { flat: true },
  });
  if (!visitor) throw createError('Visitor record not found', 404);
  return transformVisitor(visitor as any);
}

export async function getTodaysVisitors(pagination: PaginationParams, societyId: number = 1) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const where = { entryTime: { gte: startOfDay, lte: endOfDay }, flat: { societyId } };

  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where,
      skip:    pagination.skip,
      take:    pagination.limit,
      include: { flat: true },
      orderBy: { entryTime: 'desc' },
    }),
    prisma.visitor.count({ where }),
  ]);

  return { data: transformVisitors(visitors as any[]), total };
}

export async function getVisitorStats(
  query: { dateFrom?: string; dateTo?: string },
  societyId: number,
) {
  const baseWhere: Record<string, unknown> = {
    flat: { societyId },
  };
  if (query.dateFrom || query.dateTo) {
    baseWhere['entryTime'] = {
      ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
      ...(query.dateTo   ? { lte: new Date(new Date(query.dateTo).setHours(23, 59, 59, 999)) } : {}),
    };
  }

  // OWASP A03: Use Prisma groupBy instead of raw SQL with broken date filter
  // This correctly applies date filters, societyId scoping and avoids SQL injection risks
  // Note: cast to `any` because Prisma types don't include `visitorType` until `prisma generate` runs
  const grouped = await (prisma.visitor.groupBy as any)({
    by: ['visitorType'],
    where: baseWhere,
    _count: { id: true },
  }) as { visitorType: string | null; _count: { id: number } }[];

  const stats: Record<string, number> = {};
  for (const g of grouped) {
    if (g.visitorType) {
      stats[g.visitorType] = g._count.id;
    }
  }

  const totalInside = await prisma.visitor.count({
    where: { ...baseWhere, exitTime: null } as any,
  });

  return { byType: stats, totalInside };
}

export async function exportVisitorsCSV(query: Partial<GetVisitorsQueryDto>, res: Response): Promise<void> {
  const where = buildVisitorWhere(query);

  const PAGE = 500;
  let skip   = 0;
  let first  = true;

  const header = 'id,visitorName,visitorType,purpose,phone,vehicleNumber,flatNumber,entryTime,exitTime,loggedBy\n';
  res.write(header);

  const esc = (s: string | null | undefined) => `"${(s ?? '').replace(/"/g, '""')}"`;

  while (true) {
    const batch = await prisma.visitor.findMany({
      where,
      skip,
      take:    PAGE,
      include: { flat: true },
      orderBy: { entryTime: 'desc' },
    }) as any[];

    if (batch.length === 0) break;

    const lines = batch.map((v: any) => [
      esc(v.id),
      esc(v.visitorName),
      esc(v.visitorType ?? 'other'),
      esc(v.purpose),
      esc(v.phone),
      esc(v.vehicleNumber),
      esc(v.flat?.flatNumber),
      v.entryTime.toISOString(),
      v.exitTime ? v.exitTime.toISOString() : '',
      esc(v.loggedBy),
    ].join(',')).join('\n');

    res.write((first ? '' : '\n') + lines);
    first = false;
    skip += PAGE;

    if (batch.length < PAGE) break;
  }

  res.end();
}