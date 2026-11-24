import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformIncome, transformIncomes } from '../transformers/income.transformer';
import { CreateIncomeDto, UpdateIncomeDto, IncomeFilterDto } from '../dtos/income.dto';

export async function getIncomes(filter: IncomeFilterDto, societyId: number = 1) {
  const where: Record<string, unknown> = { societyId };

  if (filter.source) where.source = filter.source;

  if (filter.dateFrom || filter.dateTo) {
    const range: Record<string, Date> = {};
    if (filter.dateFrom) range.gte = new Date(filter.dateFrom);
    if (filter.dateTo) {
      const end = new Date(filter.dateTo);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
    where.receivedOn = range;
  } else if (filter.month && filter.year) {
    const start = new Date(filter.year, filter.month - 1, 1);
    const end = new Date(filter.year, filter.month, 1);
    where.receivedOn = { gte: start, lt: end };
  } else if (filter.year) {
    const start = new Date(filter.year, 0, 1);
    const end = new Date(filter.year + 1, 0, 1);
    where.receivedOn = { gte: start, lt: end };
  }

  const [records, total] = await Promise.all([
    prisma.incomeRecord.findMany({
      where,
      skip: filter.skip,
      take: filter.limit,
      orderBy: { receivedOn: 'desc' },
    }),
    prisma.incomeRecord.count({ where }),
  ]);

  return { data: transformIncomes(records), total };
}

export async function getIncomeById(id: string) {
  const record = await prisma.incomeRecord.findUnique({ where: { id } });
  if (!record) throw createError('Income record not found', 404);
  return transformIncome(record);
}

export async function createIncome(dto: CreateIncomeDto, recordedBy: string, societyId: number = 1) {
  const record = await prisma.incomeRecord.create({
    data: {
      societyId,
      title: dto.title,
      source: dto.source as any,
      amount: dto.amount,
      receivedOn: new Date(dto.receivedOn),
      payer: dto.payer,
      notes: dto.notes,
      recordedBy,
    },
  });
  return transformIncome(record);
}

export async function updateIncome(id: string, dto: UpdateIncomeDto) {
  const existing = await prisma.incomeRecord.findUnique({ where: { id } });
  if (!existing) throw createError('Income record not found', 404);

  const record = await prisma.incomeRecord.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.source !== undefined && { source: dto.source as any }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.receivedOn !== undefined && { receivedOn: new Date(dto.receivedOn) }),
      ...(dto.payer !== undefined && { payer: dto.payer }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
  });
  return transformIncome(record);
}

export async function deleteIncome(id: string) {
  const existing = await prisma.incomeRecord.findUnique({ where: { id } });
  if (!existing) throw createError('Income record not found', 404);
  await prisma.incomeRecord.delete({ where: { id } });
  return { deleted: true };
}

// Monthly income summary — used by finance service
export async function getIncomeMonthlySummary(months: number, societyId: number = 1) {
  const now = new Date();
  const result: Array<{ month: number; year: number; totalIncome: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const agg = await prisma.incomeRecord.aggregate({
      where: { societyId, receivedOn: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    result.push({ month, year, totalIncome: Number(agg._sum.amount ?? 0) });
  }

  return result;
}

// Single month income total — used by finance monthly report
export async function getIncomeForMonth(month: number, year: number, societyId: number = 1) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const rows = await prisma.incomeRecord.findMany({
    where: { societyId, receivedOn: { gte: start, lt: end } },
    orderBy: { receivedOn: 'asc' },
  });

  const grandTotal = rows.reduce((s, r) => s + r.amount, 0);
  return { records: transformIncomes(rows), grandTotal };
}