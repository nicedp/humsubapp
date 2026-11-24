import { z } from 'zod';

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  amount: z.number().positive(),
  paidOn: z.string().min(1), // ISO date string
  vendor: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateExpenseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  amount: z.number().positive().optional(),
  paidOn: z.string().min(1).optional(),
  vendor: z.string().max(200).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const expenseFilterSchema = z.object({
  category: z.string().min(1).max(100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  // Advanced date range — takes priority over month/year when provided
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const expenseMonthlySummaryQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
});

export const expenseCategoryBreakdownQuerySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100).default(new Date().getFullYear()),
});

export const expenseYearOverYearQuerySchema = z.object({
  years: z.coerce.number().int().min(1).max(5).default(3),
});

// ── Bulk create (max 100 rows per request) ────────────────────────────────────
export const bulkCreateExpensesSchema = z.object({
  expenses: z
    .array(createExpenseSchema)
    .min(1, 'At least one expense is required')
    .max(100, 'Maximum 100 expenses per bulk request'),
});

// ── CSV import — raw text body ─────────────────────────────────────────────────
export const importExpensesBodySchema = z.object({
  csv: z.string().min(1, 'CSV content is required'),
});

export type CreateExpenseDto = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDto = z.infer<typeof updateExpenseSchema>;
export type ExpenseFilterDto = z.infer<typeof expenseFilterSchema>;
export type BulkCreateExpensesDto = z.infer<typeof bulkCreateExpensesSchema>;