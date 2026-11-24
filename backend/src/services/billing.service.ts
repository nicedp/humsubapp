import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformBill, transformBills } from '../transformers/billing.transformer';
import { GenerateBillsDto, RecordPaymentDto, BillFilterDto, CreateSingleBillDto, CreateBulkSingleBillsDto, UpdateBillDto, QuickPayDto } from '../dtos/billing.dto';
import { calculateMaintenanceAmount, calculateLateFee } from '../helpers/billing.helper';
import { PaginationParams } from '../helpers/pagination.helper';
import { getSettings } from './settings.service';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function generateMonthlyBills(dto: GenerateBillsDto, societyId: number = 1) {
  const settings = await getSettings(societyId);

  // When bill_vacant_flats is enabled, include all flats; otherwise only occupied ones
  const flats = await prisma.flat.findMany({
    where: settings.billVacantFlats ? { societyId } : { societyId, status: 'occupied' },
  });

  if (flats.length === 0) throw createError(settings.billVacantFlats ? 'No flats found' : 'No occupied flats to generate bills for', 400);

  // Build due date
  const dueDate = new Date(dto.year, dto.month - 1, dto.dueDayOfMonth);

  const results = await prisma.$transaction(async (tx: TxClient) => {
    const created: string[] = [];
    const skipped: string[] = [];

    for (const flat of flats) {
      // Check if bill already exists for this month/year/flat
      const existing = await tx.maintenanceBill.findUnique({
        where: { flatId_month_year: { flatId: flat.id, month: dto.month, year: dto.year } },
      });

      if (existing) {
        skipped.push(flat.flatNumber);
        continue;
      }

      const amount = calculateMaintenanceAmount(flat.sqFt, settings);

      await tx.maintenanceBill.create({
        data: {
          flatId: flat.id,
          month: dto.month,
          year: dto.year,
          amount,
          dueDate,
          status: 'unpaid',
        },
      });

      created.push(flat.flatNumber);
    }

    return { created, skipped };
  });

  return {
    month: dto.month,
    year: dto.year,
    created: results.created.length,
    skipped: results.skipped.length,
    createdFlats: results.created,
    skippedFlats: results.skipped,
  };
}

export async function getBills(filter: BillFilterDto, pagination: PaginationParams, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const where = {
    flat: { societyId },
    ...(filter.flatId && { flatId: filter.flatId }),
    ...(filter.month && { month: filter.month }),
    ...(filter.year && { year: filter.year }),
    ...(filter.status && { status: filter.status as 'unpaid' | 'paid' | 'overdue' }),
  };

  const [bills, total] = await Promise.all([
    prisma.maintenanceBill.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: {
        flat: {
          include: {
            residents: {
              where: { isActive: true },
              select: { name: true, phone: true },
              take: 1,
            },
          },
        },
        payment: true,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.maintenanceBill.count({ where }),
  ]);

  return { data: transformBills(bills, settings), total };
}

export async function getBillById(id: string, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const bill = await prisma.maintenanceBill.findUnique({
    where: { id },
    include: { flat: true, payment: true },
  });
  if (!bill) throw createError('Bill not found', 404);

  return transformBill(bill, settings);
}

export async function getMyBills(residentId: string, pagination: PaginationParams, societyId: number = 1) {
  const settings = await getSettings(societyId);

  // Find the flat for this resident
  const resident = await prisma.resident.findUnique({ where: { id: residentId } });
  if (!resident) throw createError('Resident not found', 404);

  const [bills, total] = await Promise.all([
    prisma.maintenanceBill.findMany({
      where: { flatId: resident.flatId },
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true, payment: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.maintenanceBill.count({ where: { flatId: resident.flatId } }),
  ]);

  return { data: transformBills(bills, settings), total };
}

export async function recordPayment(billId: string, dto: RecordPaymentDto, recordedBy: string, societyId: number = 1) {
  const bill = await prisma.maintenanceBill.findUnique({
    where: { id: billId },
    include: { payment: true },
  });
  if (!bill) throw createError('Bill not found', 404);
  if (bill.payment) throw createError('Payment already recorded for this bill', 409);

  const settings = await getSettings(societyId);

  await prisma.$transaction(async (tx: TxClient) => {
    await tx.payment.create({
      data: {
        billId,
        amountPaid: dto.amountPaid,
        paidOn: dto.paidOn ? new Date(dto.paidOn) : new Date(),
        paymentMode: dto.paymentMode as 'cash' | 'upi' | 'bank_transfer' | 'cheque',
        notes: dto.notes,
        recordedBy,
      },
    });

    await tx.maintenanceBill.update({
      where: { id: billId },
      data: { status: 'paid' },
    });
  });

  const updated = await prisma.maintenanceBill.findUnique({
    where: { id: billId },
    include: { flat: true, payment: true },
  });

  return transformBill(updated!, settings);
}

export async function updateOverdueBills() {
  const now = new Date();
  const result = await prisma.maintenanceBill.updateMany({
    where: {
      status: 'unpaid',
      dueDate: { lt: now },
    },
    data: { status: 'overdue' },
  });
  return { updated: result.count };
}

// ─────────────────────────────────────────────
// NEW: Single bill creation (upsert — updates if unpaid/overdue, skips if paid)
// ─────────────────────────────────────────────
export async function createSingleBill(dto: CreateSingleBillDto, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const flat = await prisma.flat.findUnique({ where: { id: dto.flatId } });
  if (!flat) throw createError('Flat not found', 404);
  if (flat.status !== 'occupied' && !settings.billVacantFlats) throw createError('Flat is not occupied. Enable "Bill Vacant Flats" in settings to raise bills for vacant flats.', 400);

  const amount = dto.amount ?? calculateMaintenanceAmount(flat.sqFt, settings);
  const dueDate = new Date(dto.dueDate);

  // Upsert: if bill already exists and is unpaid/overdue, update it; if paid, skip
  const existing = await prisma.maintenanceBill.findUnique({
    where: { flatId_month_year: { flatId: dto.flatId, month: dto.month, year: dto.year } },
    include: { flat: true, payment: true },
  });

  if (existing) {
    if (existing.status === 'paid') {
      // Return as-is — don't overwrite paid bills
      return transformBill(existing, settings);
    }
    // Update existing unpaid/overdue bill
    const updated = await prisma.maintenanceBill.update({
      where: { id: existing.id },
      data: { amount, dueDate },
      include: { flat: true, payment: true },
    });
    return transformBill(updated, settings);
  }

  const bill = await prisma.maintenanceBill.create({
    data: {
      flatId: dto.flatId,
      month: dto.month,
      year: dto.year,
      amount,
      dueDate,
      status: 'unpaid',
    },
    include: { flat: true, payment: true },
  });

  return transformBill(bill, settings);
}

// ─────────────────────────────────────────────
// Bulk single bill creation — one flat, multiple periods, one transaction
// ─────────────────────────────────────────────
export async function createBulkSingleBills(dto: CreateBulkSingleBillsDto, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const flat = await prisma.flat.findUnique({ where: { id: dto.flatId } });
  if (!flat) throw createError('Flat not found', 404);
  if (flat.status !== 'occupied' && !settings.billVacantFlats) throw createError('Flat is not occupied. Enable "Bill Vacant Flats" in settings to raise bills for vacant flats.', 400);

  const amount = dto.amount ?? calculateMaintenanceAmount(flat.sqFt, settings);
  const dueDate = new Date(dto.dueDate);

  const results = await prisma.$transaction(async (tx: TxClient) => {
    const created: Array<{ month: number; year: number }> = [];
    const updated: Array<{ month: number; year: number }> = [];
    const skipped: Array<{ month: number; year: number }> = [];

    for (const period of dto.periods) {
      const existing = await tx.maintenanceBill.findUnique({
        where: { flatId_month_year: { flatId: dto.flatId, month: period.month, year: period.year } },
      });

      if (existing) {
        if (existing.status === 'paid') {
          skipped.push(period);
          continue;
        }
        // Update unpaid/overdue
        await tx.maintenanceBill.update({
          where: { id: existing.id },
          data: { amount, dueDate },
        });
        updated.push(period);
      } else {
        await tx.maintenanceBill.create({
          data: {
            flatId: dto.flatId,
            month: period.month,
            year: period.year,
            amount,
            dueDate,
            status: 'unpaid',
          },
        });
        created.push(period);
      }
    }

    return { created, updated, skipped };
  });

  return {
    flatNumber: flat.flatNumber,
    created: results.created.length,
    updated: results.updated.length,
    skipped: results.skipped.length,
    total: dto.periods.length,
  };
}

// ─────────────────────────────────────────────
// NEW: Update a bill (due date / amount) — only if unpaid or overdue
// ─────────────────────────────────────────────
export async function updateBill(id: string, dto: UpdateBillDto, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const bill = await prisma.maintenanceBill.findUnique({ where: { id } });
  if (!bill) throw createError('Bill not found', 404);
  if (bill.status === 'paid') throw createError('Cannot edit a paid bill', 400);

  const updated = await prisma.maintenanceBill.update({
    where: { id },
    data: {
      ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
    },
    include: { flat: true, payment: true },
  });

  return transformBill(updated, settings);
}

// ─────────────────────────────────────────────
// NEW: Delete a bill — only if unpaid
// ─────────────────────────────────────────────
export async function deleteBill(id: string) {
  const bill = await prisma.maintenanceBill.findUnique({ where: { id } });
  if (!bill) throw createError('Bill not found', 404);
  if (bill.status !== 'unpaid') throw createError('Only unpaid bills can be deleted', 400);

  await prisma.maintenanceBill.delete({ where: { id } });
  return { deleted: true };
}

// ─────────────────────────────────────────────
// NEW: Billing summary (KPI aggregates) for a given month/year
// ─────────────────────────────────────────────
export async function getBillingSummary(month: number, year: number, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const bills = await prisma.maintenanceBill.findMany({
    where: { month, year, flat: { societyId } },
    include: { payment: true },
  });

  const now = new Date();
  let totalCollected = 0;
  let totalDue = 0;
  let overdueCount = 0;
  let unpaidCount = 0;
  let paidCount = 0;

  for (const bill of bills) {
    if (bill.status === 'paid') {
      totalCollected += Number(bill.amount);
      paidCount++;
    } else {
      const lateFee = calculateLateFee(bill.dueDate, settings);
      totalDue += Number(bill.amount) + lateFee;
      if (bill.status === 'overdue') overdueCount++;
      else unpaidCount++;
    }
  }

  const totalBills = bills.length;
  const collectionRate = totalBills > 0 ? Math.round((paidCount / totalBills) * 100) : 0;

  return {
    month,
    year,
    totalBills,
    paidCount,
    unpaidCount,
    overdueCount,
    totalCollected,
    totalDue,
    collectionRate,
  };
}

// ─────────────────────────────────────────────
// NEW: Floor-wise flat billing status for visual grid
// ─────────────────────────────────────────────
export async function getFloorStatus(month: number, year: number, societyId: number = 1) {
  const settings = await getSettings(societyId);

  // Get all flats for the society — societyId scoped
  const flats = await prisma.flat.findMany({
    where: { societyId },
    include: {
      block: true,
      residents: { where: { isActive: true }, select: { name: true, residentType: true } },
      maintenanceBills: {
        include: { payment: true },
      },
    },
    orderBy: [{ flatNumber: 'asc' }],
  });

  return flats.map((flat) => {
    const allBills = flat.maintenanceBills;
    const bill = allBills.find((b) => b.month === month && b.year === year) ?? null;
    const resident = flat.residents[0] ?? null;

    // Current selected month bill details
    let billStatus: 'paid' | 'unpaid' | 'overdue' | 'no_bill' = 'no_bill';
    let lateFee = 0;
    let amount = 0;
    let totalDue = 0;
    let billId: string | null = null;
    let dueDate: Date | null = null;

    if (bill) {
      billStatus = bill.status as 'paid' | 'unpaid' | 'overdue';
      amount = Number(bill.amount);
      billId = bill.id;
      dueDate = bill.dueDate;
      lateFee = bill.status === 'paid' ? 0 : calculateLateFee(bill.dueDate, settings);
      totalDue = amount + lateFee;
    }

    // Cumulative across ALL unpaid/overdue months (for the tile display)
    let cumulativeDue = 0;
    let unpaidMonths = 0;
    for (const b of allBills) {
      if (b.status === 'unpaid' || b.status === 'overdue') {
        const fee = calculateLateFee(b.dueDate, settings);
        cumulativeDue += Number(b.amount) + fee;
        unpaidMonths++;
      }
    }

    return {
      flatId: flat.id,
      flatNumber: flat.flatNumber,
      blockId: (flat as any).blockId ?? null,
      blockName: (flat as any).block?.name ?? null,
      floor: flat.floor ?? null,
      type: flat.type,
      sqFt: flat.sqFt,
      flatStatus: flat.status,
      residentName: resident?.name ?? null,
      residentType: resident?.residentType ?? null,
      billId,
      billStatus,
      amount,
      lateFee,
      totalDue,
      dueDate,
      // Cumulative totals across all unpaid months
      cumulativeDue,
      unpaidMonths,
    };
  });
}

// ─────────────────────────────────────────────
// NEW: Full billing history for a single flat (all months, newest first)
// ─────────────────────────────────────────────
export async function getFlatBillingHistory(flatId: string, societyId: number = 1) {
  const settings = await getSettings(societyId);

  // Verify flat belongs to this society
  const flat = await prisma.flat.findUnique({
    where: { id: flatId },
    include: {
      block: true,
      residents: { where: { isActive: true }, select: { name: true, residentType: true, phone: true } },
    },
  });
  if (!flat || flat.societyId !== societyId) throw createError('Flat not found', 404);

  const bills = await prisma.maintenanceBill.findMany({
    where: { flatId },
    include: { payment: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });

  let cumulativeDue = 0;
  let unpaidMonths = 0;
  let totalPaid = 0;

  const billRows = bills.map((b) => {
    const fee = b.status === 'paid' ? 0 : calculateLateFee(b.dueDate, settings);
    const due = Number(b.amount) + fee;
    if (b.status === 'paid') {
      totalPaid += Number(b.payment?.amountPaid ?? b.amount);
    } else {
      cumulativeDue += due;
      unpaidMonths++;
    }
    return {
      billId: b.id,
      month: b.month,
      year: b.year,
      amount: Number(b.amount),
      lateFee: fee,
      totalDue: due,
      status: b.status as 'paid' | 'unpaid' | 'overdue',
      dueDate: b.dueDate,
      paidOn: b.payment?.paidOn ?? null,
      paidAmount: b.payment ? Number(b.payment.amountPaid) : null,
      paymentMode: b.payment?.paymentMode ?? null,
    };
  });

  const resident = flat.residents[0] ?? null;

  return {
    flatId: flat.id,
    flatNumber: flat.flatNumber,
    blockName: (flat as any).block?.name ?? null,
    floor: flat.floor ?? null,
    type: flat.type,
    sqFt: flat.sqFt,
    residentName: resident?.name ?? null,
    residentType: resident?.residentType ?? null,
    residentPhone: resident?.phone ?? null,
    cumulativeDue,
    unpaidMonths,
    totalPaid,
    totalBills: bills.length,
    bills: billRows,
  };
}

// ─────────────────────────────────────────────
// NEW: Defaulters — flats with 2+ consecutive unpaid months
// ─────────────────────────────────────────────
export async function getDefaulters(societyId: number = 1) {
  const settings = await getSettings(societyId);

  // Get all unpaid/overdue bills ordered by flat and date
  const bills = await prisma.maintenanceBill.findMany({
    where: { status: { in: ['unpaid', 'overdue'] }, flat: { societyId } },
    include: { flat: { include: { residents: { where: { isActive: true }, select: { name: true, phone: true, email: true } } } } },
    orderBy: [{ flatId: 'asc' }, { year: 'desc' }, { month: 'desc' }],
  });

  // Group by flatId and count consecutive unpaid
  const flatMap = new Map<string, typeof bills>();
  for (const bill of bills) {
    const existing = flatMap.get(bill.flatId) ?? [];
    existing.push(bill);
    flatMap.set(bill.flatId, existing);
  }

  const defaulters: Array<{
    flatId: string;
    flatNumber: string;
    residentName: string | null;
    phone: string | null;
    unpaidMonths: number;
    totalOutstanding: number;
    bills: Array<{ month: number; year: number; amount: number; lateFee: number; totalDue: number; status: string; dueDate: Date }>;
  }> = [];

  for (const [, flatBills] of flatMap) {
    if (flatBills.length < 1) continue; // 1+ unpaid months qualifies as a defaulter

    const flat = flatBills[0].flat;
    const resident = flat.residents[0] ?? null;
    let totalOutstanding = 0;

    const billSummaries = flatBills.map((b) => {
      const lateFee = calculateLateFee(b.dueDate, settings);
      const totalDue = Number(b.amount) + lateFee;
      totalOutstanding += totalDue;
      return {
        month: b.month,
        year: b.year,
        amount: Number(b.amount),
        lateFee,
        totalDue,
        status: b.status,
        dueDate: b.dueDate,
      };
    });

    defaulters.push({
      flatId: flat.id,
      flatNumber: flat.flatNumber,
      residentName: resident?.name ?? null,
      phone: resident?.phone ?? null,
      unpaidMonths: flatBills.length,
      totalOutstanding,
      bills: billSummaries,
    });
  }

  // Sort by worst defaulters first
  defaulters.sort((a, b) => b.unpaidMonths - a.unpaidMonths);

  return defaulters;
}

// ─────────────────────────────────────────────
// Quick Pay — find-or-create bill for each period, then record payment atomically
// Handles both "advance payment" (no bill yet) and "quick pay" (existing unpaid/overdue)
// Already-paid periods are skipped gracefully
// ─────────────────────────────────────────────
export async function quickPay(dto: QuickPayDto, recordedBy: string, societyId: number = 1) {
  const settings = await getSettings(societyId);

  const flat = await prisma.flat.findUnique({ where: { id: dto.flatId } });
  if (!flat) throw createError('Flat not found', 404);

  const perPeriodAmount = dto.amountPaid ?? calculateMaintenanceAmount(flat.sqFt, settings);
  const paidOn = dto.paidOn ? new Date(dto.paidOn) : new Date();
  const paymentMode = dto.paymentMode as 'cash' | 'upi' | 'bank_transfer' | 'cheque';

  const rows: Array<{
    month: number;
    year: number;
    status: 'paid' | 'skipped' | 'already_paid';
    billId: string;
    amountPaid: number;
  }> = [];

  await prisma.$transaction(async (tx: TxClient) => {
    for (const period of dto.periods) {
      // Find or create the bill
      let bill = await tx.maintenanceBill.findUnique({
        where: { flatId_month_year: { flatId: dto.flatId, month: period.month, year: period.year } },
        include: { payment: true },
      });

      if (bill?.status === 'paid') {
        // Already paid — skip silently
        rows.push({ month: period.month, year: period.year, status: 'already_paid', billId: bill.id, amountPaid: 0 });
        continue;
      }

      if (!bill) {
        // Create a new bill (advance payment case)
        // Due date: 10th of the billing month (default grace)
        const dueDate = new Date(period.year, period.month - 1, 10); // default due: 10th of month
        bill = await tx.maintenanceBill.create({
          data: {
            flatId: dto.flatId,
            month: period.month,
            year: period.year,
            amount: perPeriodAmount,
            dueDate,
            status: 'unpaid',
          },
          include: { payment: true },
        });
      }

      // Record payment and mark bill paid
      await tx.payment.create({
        data: {
          billId: bill.id,
          amountPaid: perPeriodAmount,
          paidOn,
          paymentMode,
          notes: dto.notes,
          recordedBy,
        },
      });

      await tx.maintenanceBill.update({
        where: { id: bill.id },
        data: { status: 'paid' },
      });

      rows.push({ month: period.month, year: period.year, status: 'paid', billId: bill.id, amountPaid: perPeriodAmount });
    }
  });

  const paid = rows.filter((r) => r.status === 'paid').length;
  const skipped = rows.filter((r) => r.status === 'already_paid').length;

  return {
    flatNumber: flat.flatNumber,
    totalPeriods: dto.periods.length,
    paid,
    skipped,
    totalAmountPaid: paid * perPeriodAmount,
    rows,
  };
}

// ─────────────────────────────────────────────
// NEW: Monthly revenue trend — last N months
// Returns collected, totalBilled, collectionRate per month
// ─────────────────────────────────────────────
export async function getMonthlyTrend(months: number, societyId: number = 1) {
  const now = new Date();
  const result: Array<{
    month: number;
    year: number;
    label: string;
    totalBilled: number;
    totalCollected: number;
    collectionRate: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const bills = await prisma.maintenanceBill.findMany({
      where: { month, year, flat: { societyId } },
      select: { amount: true, status: true },
    });

    const totalBills = bills.length;
    const paidBills = bills.filter((b) => b.status === 'paid');
    const totalBilled = bills.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalCollected = paidBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const collectionRate = totalBills > 0 ? Math.round((paidBills.length / totalBills) * 100) : 0;

    result.push({
      month,
      year,
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      totalBilled,
      totalCollected,
      collectionRate,
    });
  }

  return result;
}