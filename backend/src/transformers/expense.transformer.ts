import { Expense } from '@prisma/client';

export interface ExpenseResponse {
  id: string;
  societyId: number;
  title: string;
  category: string;
  amount: number;
  paidOn: string;
  vendor: string | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export function transformExpense(expense: Expense): ExpenseResponse {
  return {
    id: expense.id,
    societyId: expense.societyId,
    title: expense.title,
    category: expense.category,
    amount: Number(expense.amount),
    paidOn: expense.paidOn.toISOString(),
    vendor: expense.vendor ?? null,
    notes: expense.notes ?? null,
    recordedBy: expense.recordedBy ?? null,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
}

export function transformExpenses(expenses: Expense[]): ExpenseResponse[] {
  return expenses.map(transformExpense);
}