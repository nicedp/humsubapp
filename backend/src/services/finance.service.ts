import prisma from '../config/db';
import { getMonthlyTrend } from './billing.service';
import { getExpenseMonthlySummary } from './expense.service';
import { getIncomeMonthlySummary, getIncomeForMonth } from './income.service';
import { getSettings } from './settings.service';

export interface FinanceSummaryPoint {
  month: number;
  year: number;
  label: string;
  totalBilled: number;
  totalCollected: number;
  collectionRate: number;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  openingBalance: number;
  closingBalance: number;
}

export async function getMonthlySummary(months: number, societyId: number = 1): Promise<FinanceSummaryPoint[]> {
  const [billingTrend, expenseSummary, incomeSummary, settings] = await Promise.all([
    getMonthlyTrend(months, societyId),
    getExpenseMonthlySummary(months, societyId),
    getIncomeMonthlySummary(months, societyId),
    getSettings(societyId),
  ]);

  // Build key maps
  const expenseMap = new Map<string, number>();
  for (const e of expenseSummary) {
    expenseMap.set(`${e.year}-${e.month}`, e.totalExpenses);
  }
  const incomeMap = new Map<string, number>();
  for (const i of incomeSummary) {
    incomeMap.set(`${i.year}-${i.month}`, i.totalIncome);
  }

  // Build base points without OB/CB first
  const points = billingTrend.map((b) => {
    const totalExpenses = expenseMap.get(`${b.year}-${b.month}`) ?? 0;
    const totalIncome = incomeMap.get(`${b.year}-${b.month}`) ?? 0;
    const netBalance = b.totalCollected + totalIncome - totalExpenses;
    return {
      month: b.month,
      year: b.year,
      label: b.label,
      totalBilled: b.totalBilled,
      totalCollected: b.totalCollected,
      collectionRate: b.collectionRate,
      totalExpenses,
      totalIncome,
      netBalance,
      openingBalance: 0,
      closingBalance: 0,
    };
  });

  // Sort ascending by year+month to chain OB → CB correctly
  points.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);

  // Determine seed OB from settings
  const seedOb = settings.openingBalance ?? 0;
  const seedYM = settings.openingBalanceYearMonth ?? ''; // "YYYY-MM" or ""

  // Chain opening/closing balances
  let runningBalance = seedOb;
  let seedApplied = false;

  for (const pt of points) {
    const ptYM = `${pt.year}-${String(pt.month).padStart(2, '0')}`;

    if (!seedApplied) {
      // If seedYM is blank or matches / is before this point, start the chain here
      if (!seedYM || ptYM >= seedYM) {
        // If this is the exact seed month, OB = seed; otherwise OB continues the chain
        runningBalance = seedYM === ptYM ? seedOb : (seedYM ? runningBalance : seedOb);
        seedApplied = true;
      }
    }

    pt.openingBalance = runningBalance;
    pt.closingBalance = runningBalance + pt.totalCollected + pt.totalIncome - pt.totalExpenses;
    runningBalance = pt.closingBalance;
  }

  return points;
}

// ─────────────────────────────────────────────────────────────
// Monthly report data — single month/year structured report
// Returns billing KPIs + expenses by category + net balance
// ─────────────────────────────────────────────────────────────
export interface MonthlyReportData {
  month: number;
  year: number;
  monthLabel: string;
  billing: {
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    totalBills: number;
    paidBills: number;
    unpaidBills: number;
    collectionRate: number;
  };
  expenses: {
    grandTotal: number;
    byCategory: Array<{ category: string; total: number; percentage: number }>;
    items: Array<{ title: string; category: string; amount: number; paidOn: string; vendor?: string | null }>;
  };
  income: {
    grandTotal: number;
    records: Array<{ id: string; title: string; source: string; amount: number; receivedOn: string; payer?: string | null }>;
  };
  netBalance: number;
  societyName: string;
}

export async function getMonthlyReport(month: number, year: number, societyId: number = 1): Promise<MonthlyReportData> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const monthLabel = `${MONTHS_LONG[month - 1]} ${year}`;

  // Billing aggregates — MaintenanceBill uses month (Int) + year (Int)
  const [billAgg, paidAgg, unpaidAgg] = await Promise.all([
    prisma.maintenanceBill.aggregate({
      where: { month, year, flat: { societyId } },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.maintenanceBill.aggregate({
      where: { month, year, status: 'paid', flat: { societyId } },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.maintenanceBill.aggregate({
      where: {
        month,
        year,
        status: { in: ['unpaid', 'overdue'] },
        flat: { societyId },
      },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const totalBilled = Number(billAgg._sum.amount ?? 0);
  const totalCollected = Number(paidAgg._sum.amount ?? 0);
  const totalOutstanding = Number(unpaidAgg._sum.amount ?? 0);
  const totalBills = billAgg._count.id ?? 0;
  const paidBills = paidAgg._count.id ?? 0;
  const unpaidBills = unpaidAgg._count.id ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 1000) / 10 : 0;

  // Expense category breakdown for this month
  const expRows = await prisma.expense.groupBy({
    by: ['category'],
    where: { societyId, paidOn: { gte: start, lt: end } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const expGrandTotal = expRows.reduce((s: number, r: any) => s + Number(r._sum.amount ?? 0), 0);
  const byCategory = expRows.map((r: any) => ({
    category: r.category as string,
    total: Number(r._sum.amount ?? 0),
    percentage: expGrandTotal > 0 ? Math.round((Number(r._sum.amount ?? 0) / expGrandTotal) * 1000) / 10 : 0,
  }));

  // Individual expense items for this month
  const expenseItems = await prisma.expense.findMany({
    where: { societyId, paidOn: { gte: start, lt: end } },
    orderBy: { paidOn: 'asc' },
    select: { title: true, category: true, amount: true, paidOn: true, vendor: true },
  });

  // Income for this month
  const { records: incomeRecords, grandTotal: incomeTotal } = await getIncomeForMonth(month, year, societyId);

  // Society name from settings
  const nameSetting = await prisma.societySetting.findUnique({
    where: { societyId_varName: { societyId, varName: 'society_name' } },
  });
  const societyName = nameSetting?.varValue ?? 'Society';

  return {
    month,
    year,
    monthLabel,
    billing: {
      totalBilled,
      totalCollected,
      totalOutstanding,
      totalBills,
      paidBills,
      unpaidBills,
      collectionRate,
    },
    expenses: {
      grandTotal: expGrandTotal,
      byCategory,
      items: expenseItems.map((e: any) => ({
        title: e.title,
        category: e.category,
        amount: e.amount,
        paidOn: e.paidOn.toISOString(),
        vendor: e.vendor,
      })),
    },
    income: {
      grandTotal: incomeTotal,
      records: incomeRecords.map((r: any) => ({
        id: r.id,
        title: r.title,
        source: r.source,
        amount: r.amount,
        receivedOn: r.receivedOn,
        payer: r.payer,
      })),
    },
    netBalance: totalCollected + incomeTotal - expGrandTotal,
    societyName,
  };
}