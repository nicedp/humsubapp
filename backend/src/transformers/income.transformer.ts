import { IncomeRecord } from '@prisma/client';

export function transformIncome(r: IncomeRecord) {
  return {
    id: r.id,
    title: r.title,
    source: r.source,
    amount: r.amount,
    receivedOn: r.receivedOn.toISOString(),
    payer: r.payer ?? null,
    notes: r.notes ?? null,
    recordedBy: r.recordedBy ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function transformIncomes(records: IncomeRecord[]) {
  return records.map(transformIncome);
}