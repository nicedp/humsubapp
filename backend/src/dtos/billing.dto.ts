import { z } from 'zod';

export const generateBillsSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  dueDayOfMonth: z.number().int().min(1).max(28).default(10),
});

export const recordPaymentSchema = z.object({
  amountPaid: z.number().positive('Amount must be positive'),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  paidOn: z.string().optional(),
  notes: z.string().optional(),
  lateFeeCharged: z.number().min(0).optional(),
});

export const billFilterSchema = z.object({
  flatId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).optional(),
  status: z.enum(['unpaid', 'paid', 'overdue']).optional(),
});

export const createSingleBillSchema = z.object({
  flatId: z.string().uuid(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  dueDate: z.string(), // full ISO date string e.g. "2026-06-15"
  amount: z.number().positive().optional(), // if omitted, auto-calculated from settings
});

// Bulk single bill creation — one flat, multiple periods in one transaction
export const createBulkSingleBillsSchema = z.object({
  flatId: z.string().uuid(),
  periods: z.array(z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
  })).min(1, 'At least one period required'),
  dueDate: z.string(),
  amount: z.number().positive().optional(),
});

export const updateBillSchema = z.object({
  dueDate: z.string().optional(),
  amount: z.number().positive().optional(),
});

// Quick Pay — find-or-create bill for each period, then record payment atomically
// Used for both "advance payment" (no_bill flats) and "quick pay" (existing unpaid/overdue)
export const quickPaySchema = z.object({
  flatId: z.string().uuid(),
  periods: z.array(z.object({
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2020).max(2100),
  })).min(1, 'At least one period required').max(24, 'Max 24 periods at once'),
  amountPaid: z.number().positive().optional(), // per-period amount; auto-calculated if omitted
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']),
  paidOn: z.string().optional(),
  notes: z.string().optional(),
});

export const billingSummaryQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020),
});

export type GenerateBillsDto = z.infer<typeof generateBillsSchema>;
export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
export type BillFilterDto = z.infer<typeof billFilterSchema>;
export type CreateSingleBillDto = z.infer<typeof createSingleBillSchema>;
export type CreateBulkSingleBillsDto = z.infer<typeof createBulkSingleBillsSchema>;
export type UpdateBillDto = z.infer<typeof updateBillSchema>;
export type BillingSummaryQueryDto = z.infer<typeof billingSummaryQuerySchema>;
export type QuickPayDto = z.infer<typeof quickPaySchema>;