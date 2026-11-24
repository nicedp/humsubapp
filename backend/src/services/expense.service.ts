import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformExpense, transformExpenses } from '../transformers/expense.transformer';
import { CreateExpenseDto, UpdateExpenseDto, ExpenseFilterDto } from '../dtos/expense.dto';
import { PaginationParams } from '../helpers/pagination.helper';

// ── Types for bulk / import results ──────────────────────────────────────────
export interface BulkExpenseRowResult {
  index: number;
  status: 'created' | 'error';
  id?: string;
  title?: string;
  reason?: string;
}

export interface BulkExpenseResult {
  total: number;
  created: number;
  errors: number;
  rows: BulkExpenseRowResult[];
}

export interface ImportExpenseRowResult {
  row: number;
  title: string;
  status: 'imported' | 'skipped' | 'error';
  reason?: string;
}

export interface ImportExpenseResult {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
  rows: ImportExpenseRowResult[];
}

export async function getExpenses(filter: ExpenseFilterDto, pagination: PaginationParams, societyId: number = 1) {
  const where: Record<string, unknown> = { societyId };

  if (filter.category) where.category = filter.category;

  if (filter.dateFrom || filter.dateTo) {
    // Advanced date range filter — takes priority over month/year
    const range: Record<string, Date> = {};
    if (filter.dateFrom) range.gte = new Date(filter.dateFrom);
    if (filter.dateTo) {
      const end = new Date(filter.dateTo);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }
    where.paidOn = range;
  } else if (filter.month && filter.year) {
    // Filter by month + year using paidOn date range (backward compat for Finance Ledger links)
    const start = new Date(filter.year, filter.month - 1, 1);
    const end = new Date(filter.year, filter.month, 1);
    where.paidOn = { gte: start, lt: end };
  } else if (filter.year) {
    const start = new Date(filter.year, 0, 1);
    const end = new Date(filter.year + 1, 0, 1);
    where.paidOn = { gte: start, lt: end };
  }

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { paidOn: 'desc' },
    }),
    prisma.expense.count({ where }),
  ]);

  return { data: transformExpenses(expenses), total };
}

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw createError('Expense not found', 404);
  return transformExpense(expense);
}

export async function createExpense(dto: CreateExpenseDto, recordedBy: string, societyId: number = 1) {
  const expense = await prisma.expense.create({
    data: {
      societyId,
      title: dto.title,
      category: dto.category,
      amount: dto.amount,
      paidOn: new Date(dto.paidOn),
      vendor: dto.vendor,
      notes: dto.notes,
      recordedBy,
    },
  });
  return transformExpense(expense);
}

export async function updateExpense(id: string, dto: UpdateExpenseDto) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw createError('Expense not found', 404);

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.paidOn !== undefined && { paidOn: new Date(dto.paidOn) }),
      ...(dto.vendor !== undefined && { vendor: dto.vendor }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    },
  });
  return transformExpense(expense);
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) throw createError('Expense not found', 404);
  await prisma.expense.delete({ where: { id } });
  return { deleted: true };
}

// ─────────────────────────────────────────────
// Monthly expense summary — last N months
// Returns: [{ month, year, label, totalExpenses }]
// ─────────────────────────────────────────────
export async function getExpenseMonthlySummary(months: number, societyId: number = 1) {
  const now = new Date();
  const result: Array<{ month: number; year: number; label: string; totalExpenses: number }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const agg = await prisma.expense.aggregate({
      where: { societyId, paidOn: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    result.push({
      month,
      year,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      totalExpenses: Number(agg._sum.amount ?? 0),
    });
  }

  return result;
}

// ─────────────────────────────────────────────
// Category breakdown for a given year
// Returns: [{ category, total, percentage }]
// ─────────────────────────────────────────────
export async function getCategoryBreakdown(year: number, societyId: number = 1) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const rows = await prisma.expense.groupBy({
    by: ['category'],
    where: { societyId, paidOn: { gte: start, lt: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const grandTotal = rows.reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);

  return rows.map(r => ({
    category: r.category as string,
    total: Number(r._sum.amount ?? 0),
    percentage: grandTotal > 0 ? Math.round((Number(r._sum.amount ?? 0) / grandTotal) * 1000) / 10 : 0,
  }));
}

// ─────────────────────────────────────────────
// Top vendors by total spend for a given year
// Returns: [{ vendor, total, count }] sorted desc — blank vendor is grouped as "(Unspecified)"
// ─────────────────────────────────────────────
export async function getVendorSummary(year: number, societyId: number = 1) {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const rows = await prisma.expense.groupBy({
    by: ['vendor'],
    where: { societyId, paidOn: { gte: start, lt: end } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 10,
  });

  return rows.map((r) => ({
    vendor: r.vendor && r.vendor.trim() ? r.vendor.trim() : '(Unspecified)',
    total: Number(r._sum.amount ?? 0),
    count: r._count.id,
  }));
}

// ─────────────────────────────────────────────
// Year-over-year breakdown — last N years
// Returns: [{ year, categories: { [cat]: total }, grandTotal }]
// ─────────────────────────────────────────────
export async function getYearOverYear(years: number, societyId: number = 1) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const result: Array<{
    year: number;
    categories: Record<string, number>;
    grandTotal: number;
  }> = [];

  for (let i = years - 1; i >= 0; i--) {
    const year = currentYear - i;
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const rows = await prisma.expense.groupBy({
      by: ['category'],
      where: { societyId, paidOn: { gte: start, lt: end } },
      _sum: { amount: true },
    });

    const categories: Record<string, number> = {};
    let grandTotal = 0;
    for (const r of rows) {
      const amt = Number(r._sum.amount ?? 0);
      categories[r.category as string] = amt;
      grandTotal += amt;
    }

    result.push({ year, categories, grandTotal });
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bulk create — accepts up to 100 expense objects, processes individually so
// one bad row doesn't abort the rest.
// Returns: { total, created, errors, rows[] }
// ─────────────────────────────────────────────────────────────────────────────
export async function bulkCreateExpenses(
  items: CreateExpenseDto[],
  recordedBy: string,
  societyId: number = 1,
): Promise<BulkExpenseResult> {
  const result: BulkExpenseResult = {
    total: items.length,
    created: 0,
    errors: 0,
    rows: [],
  };

  for (let i = 0; i < items.length; i++) {
    const dto = items[i];
    try {
      const expense = await (prisma as any).expense.create({
        data: {
          societyId,
          title: dto.title,
          category: dto.category,
          amount: dto.amount,
          paidOn: new Date(dto.paidOn),
          vendor: dto.vendor ?? null,
          notes: dto.notes ?? null,
          recordedBy,
        },
      });
      result.created++;
      result.rows.push({ index: i + 1, status: 'created', id: expense.id, title: dto.title });
    } catch (err: unknown) {
      result.errors++;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.rows.push({ index: i + 1, status: 'error', title: dto.title, reason: msg });
    }
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSV import — parses raw CSV text (Title,Date,Amount,Category,Vendor,Notes)
// Validates each row and creates expenses individually, skipping blank lines.
// Returns: { total, imported, skipped, errors, rows[] }
// ─────────────────────────────────────────────────────────────────────────────
export async function importExpensesFromCsv(
  csvText: string,
  recordedBy: string,
  societyId: number = 1,
): Promise<ImportExpenseResult> {
  // Split into lines, strip BOM, trim whitespace
  const rawLines = csvText
    .replace(/^\uFEFF/, '') // strip UTF-8 BOM
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (rawLines.length < 2) {
    throw createError('CSV must have a header row and at least one data row', 400);
  }

  // Skip header row (index 0)
  const dataLines = rawLines.slice(1);

  const result: ImportExpenseResult = {
    total: dataLines.length,
    imported: 0,
    skipped: 0,
    errors: 0,
    rows: [],
  };

  // Fetch all active category slugs for this society to validate
  const activeCats = await (prisma as any).expenseCategory.findMany({
    where: { societyId, isActive: true },
    select: { slug: true },
  });
  const validSlugs = new Set<string>(activeCats.map((c: { slug: string }) => c.slug));

  for (let i = 0; i < dataLines.length; i++) {
    const rowNum = i + 2; // 1-indexed + header
    const line = dataLines[i];

    // Parse CSV line — naive split on comma, handles quoted fields
    const parts = parseCsvLine(line);
    const title = parts[0]?.trim() ?? '';
    const dateStr = parts[1]?.trim() ?? '';
    const amountStr = parts[2]?.trim() ?? '';
    const category = parts[3]?.trim() ?? '';
    const vendor = parts[4]?.trim() || undefined;
    const notes = parts[5]?.trim() || undefined;

    // Skip completely blank rows
    if (!title && !dateStr && !amountStr && !category) {
      result.skipped++;
      result.rows.push({ row: rowNum, title: '(blank)', status: 'skipped', reason: 'Empty row' });
      continue;
    }

    // Validate required fields
    if (!title) {
      result.errors++;
      result.rows.push({ row: rowNum, title: title || '(missing)', status: 'error', reason: 'Title is required' });
      continue;
    }

    if (!dateStr) {
      result.errors++;
      result.rows.push({ row: rowNum, title, status: 'error', reason: 'Date is required' });
      continue;
    }

    const paidOn = new Date(dateStr);
    if (isNaN(paidOn.getTime())) {
      result.errors++;
      result.rows.push({ row: rowNum, title, status: 'error', reason: `Invalid date: "${dateStr}" — use YYYY-MM-DD` });
      continue;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      result.errors++;
      result.rows.push({ row: rowNum, title, status: 'error', reason: `Invalid amount: "${amountStr}" — must be a positive number` });
      continue;
    }

    if (!category) {
      result.errors++;
      result.rows.push({ row: rowNum, title, status: 'error', reason: 'Category is required' });
      continue;
    }

    if (!validSlugs.has(category)) {
      result.errors++;
      result.rows.push({ row: rowNum, title, status: 'error', reason: `Unknown category slug: "${category}" — use one of: ${[...validSlugs].join(', ')}` });
      continue;
    }

    // Create expense
    try {
      await (prisma as any).expense.create({
        data: {
          societyId,
          title,
          category,
          amount,
          paidOn,
          vendor: vendor ?? null,
          notes: notes ?? null,
          recordedBy,
        },
      });
      result.imported++;
      result.rows.push({ row: rowNum, title, status: 'imported' });
    } catch (err: unknown) {
      result.errors++;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.rows.push({ row: rowNum, title, status: 'error', reason: msg });
    }
  }

  return result;
}

/** Naive CSV line parser that handles double-quoted fields containing commas */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}