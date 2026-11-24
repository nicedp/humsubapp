import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import {
  transformEvent,
  transformEvents,
  transformContribution,
  transformEventExpense,
  transformTeamMember,
} from '../transformers/event.transformer';
import {
  CreateEventDto,
  UpdateEventDto,
  CreateContributionDto,
  BulkContributionDto,
  ImportContributionDto,
  CreateEventExpenseDto,
  AddTeamMemberDto,
} from '../dtos/event.dto';

// ─── CSV helper ───────────────────────────────────────────────────────────────

/** Parse a single CSV line respecting double-quoted fields that contain commas */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

const EVENT_INCLUDE = {
  contributions: { include: { flat: true }, orderBy: { paidOn: 'desc' as const } },
  expenses: { orderBy: { paidOn: 'desc' as const } },
  teamMembers: { include: { resident: true } },
};

// ─── Events CRUD ──────────────────────────────────────────────────────────────

export async function getEvents(skip = 0, limit = 50, filters: { status?: string } = {}, societyId: number = 1) {
  const where: any = { societyId };
  if (filters.status) where.status = filters.status;
  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { eventDate: 'desc' },
      include: EVENT_INCLUDE,
    }),
    prisma.event.count({ where }),
  ]);
  return { data: transformEvents(events), total };
}

export async function getEventById(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: EVENT_INCLUDE,
  });
  if (!event) throw createError('Event not found', 404);
  return transformEvent(event);
}

export async function createEvent(dto: CreateEventDto, createdBy: string, societyId: number = 1) {
  const event = await prisma.event.create({
    data: {
      societyId,
      name: dto.name,
      description: dto.description,
      eventDate: new Date(dto.eventDate),
      status: (dto.status as any) ?? 'planning',
      budgetTarget: dto.budgetTarget,
      createdBy,
    },
    include: EVENT_INCLUDE,
  });
  return transformEvent(event);
}

export async function updateEvent(id: string, dto: UpdateEventDto) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw createError('Event not found', 404);

  const event = await prisma.event.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.eventDate !== undefined && { eventDate: new Date(dto.eventDate) }),
      ...(dto.status !== undefined && { status: dto.status as any }),
      ...(dto.budgetTarget !== undefined && { budgetTarget: dto.budgetTarget }),
    },
    include: EVENT_INCLUDE,
  });
  return transformEvent(event);
}

export async function deleteEvent(id: string) {
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) throw createError('Event not found', 404);
  await prisma.event.delete({ where: { id } });
  return { deleted: true };
}

// ─── Contributions ────────────────────────────────────────────────────────────

export async function addContribution(eventId: string, dto: CreateContributionDto, recordedBy: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Event not found', 404);

  const contribution = await prisma.eventContribution.create({
    data: {
      eventId,
      contributorName: dto.contributorName,
      flatId: dto.flatId,
      amount: dto.amount,
      paymentMode: dto.paymentMode as any,
      paidOn: dto.paidOn ? new Date(dto.paidOn) : new Date(),
      notes: dto.notes,
      recordedBy,
    },
    include: { flat: true },
  });
  return transformContribution(contribution);
}

export async function deleteContribution(eventId: string, contributionId: string) {
  const c = await prisma.eventContribution.findUnique({ where: { id: contributionId } });
  if (!c || c.eventId !== eventId) throw createError('Contribution not found', 404);
  await prisma.eventContribution.delete({ where: { id: contributionId } });
  return { deleted: true };
}

// ─── Event Expenses ───────────────────────────────────────────────────────────

export async function addEventExpense(eventId: string, dto: CreateEventExpenseDto, recordedBy: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Event not found', 404);

  const expense = await prisma.eventExpense.create({
    data: {
      eventId,
      title: dto.title,
      category: dto.category,
      amount: dto.amount,
      paidOn: dto.paidOn ? new Date(dto.paidOn) : new Date(),
      vendor: dto.vendor,
      notes: dto.notes,
      recordedBy,
    },
  });
  return transformEventExpense(expense);
}

export async function deleteEventExpense(eventId: string, expenseId: string) {
  const e = await prisma.eventExpense.findUnique({ where: { id: expenseId } });
  if (!e || e.eventId !== eventId) throw createError('Event expense not found', 404);
  await prisma.eventExpense.delete({ where: { id: expenseId } });
  return { deleted: true };
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function addTeamMember(eventId: string, dto: AddTeamMemberDto) {
  const event = await (prisma as any).event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Event not found', 404);

  const resident = await prisma.resident.findUnique({ where: { id: dto.residentId } });
  if (!resident) throw createError('Resident not found', 404);

  // Check for duplicate
  const existing = await prisma.eventTeamMember.findUnique({
    where: { eventId_residentId: { eventId, residentId: dto.residentId } },
  });
  if (existing) throw createError('Resident is already in the team', 409);

  const member = await prisma.eventTeamMember.create({
    data: { eventId, residentId: dto.residentId, role: dto.role, notes: dto.notes },
    include: { resident: true },
  });
  return transformTeamMember(member);
}

export async function deleteTeamMember(eventId: string, memberId: string) {
  const m = await prisma.eventTeamMember.findUnique({ where: { id: memberId } });
  if (!m || m.eventId !== eventId) throw createError('Team member not found', 404);
  await prisma.eventTeamMember.delete({ where: { id: memberId } });
  return { deleted: true };
}

// ─── Bulk Contributions ───────────────────────────────────────────────────────

export async function bulkAddContributions(
  eventId: string,
  dto: BulkContributionDto,
  recordedBy: string,
) {
  const event = await (prisma as any).event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Event not found', 404);

  const rows: Array<{ index: number; status: 'created' | 'error'; id?: string; contributorName?: string; reason?: string }> = [];
  let created = 0;

  for (let i = 0; i < dto.contributions.length; i++) {
    const item = dto.contributions[i];
    try {
      const contribution = await (prisma as any).eventContribution.create({
        data: {
          eventId,
          contributorName: item.contributorName,
          flatId: item.flatId ?? null,
          amount: item.amount,
          paymentMode: item.paymentMode ?? 'cash',
          paidOn: item.paidOn ? new Date(item.paidOn) : new Date(),
          notes: item.notes ?? null,
          recordedBy,
        },
        include: { flat: true },
      });
      rows.push({ index: i, status: 'created', id: contribution.id, contributorName: contribution.contributorName });
      created++;
    } catch (err: any) {
      rows.push({ index: i, status: 'error', contributorName: item.contributorName, reason: err?.message ?? 'Unknown error' });
    }
  }

  return { total: dto.contributions.length, created, errors: dto.contributions.length - created, rows };
}

// ─── CSV Import Contributions ─────────────────────────────────────────────────

const VALID_PAYMENT_MODES = new Set(['cash', 'upi', 'bank_transfer', 'cheque']);

export async function importContributions(
  eventId: string,
  dto: ImportContributionDto,
  recordedBy: string,
) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw createError('Event not found', 404);

  const lines = dto.csv.split('\n').map(l => l.trimEnd());
  // Skip header row
  const dataLines = lines.slice(1);

  const rows: Array<{
    row: number;
    contributorName: string;
    status: 'imported' | 'skipped' | 'error';
    reason?: string;
  }> = [];

  let imported = 0;
  let skipped = 0;

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim()) {
      // blank line — silently skip
      skipped++;
      rows.push({ row: i + 2, contributorName: '', status: 'skipped', reason: 'Blank row' });
      continue;
    }

    const fields = parseCsvLine(line);
    // Expected columns: contributorName, amount, paymentMode, paidOn, notes
    const [rawName, rawAmount, rawMode, rawDate, rawNotes] = fields;

    const contributorName = rawName?.trim() ?? '';
    if (!contributorName) {
      rows.push({ row: i + 2, contributorName: '', status: 'error', reason: 'contributorName is required' });
      continue;
    }

    const amount = parseFloat(rawAmount ?? '');
    if (isNaN(amount) || amount <= 0) {
      rows.push({ row: i + 2, contributorName, status: 'error', reason: 'amount must be a positive number' });
      continue;
    }

    const paymentMode = rawMode?.trim().toLowerCase() || 'cash';
    if (!VALID_PAYMENT_MODES.has(paymentMode)) {
      rows.push({ row: i + 2, contributorName, status: 'error', reason: `Invalid paymentMode "${paymentMode}". Allowed: cash, upi, bank_transfer, cheque` });
      continue;
    }

    let paidOn: Date = new Date();
    if (rawDate?.trim()) {
      const parsed = new Date(rawDate.trim());
      if (isNaN(parsed.getTime())) {
        rows.push({ row: i + 2, contributorName, status: 'error', reason: `Invalid date "${rawDate.trim()}"` });
        continue;
      }
      paidOn = parsed;
    }

    const notes = rawNotes?.trim() || null;

    try {
      await (prisma as any).eventContribution.create({
        data: {
          eventId,
          contributorName,
          amount,
          paymentMode,
          paidOn,
          notes,
          recordedBy,
        },
      });
      rows.push({ row: i + 2, contributorName, status: 'imported' });
      imported++;
    } catch (err: any) {
      rows.push({ row: i + 2, contributorName, status: 'error', reason: err?.message ?? 'DB error' });
    }
  }

  return {
    total: dataLines.length,
    imported,
    skipped,
    errors: dataLines.length - imported - skipped,
    rows,
  };
}