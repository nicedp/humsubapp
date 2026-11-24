import { z } from 'zod';

export const createIncomeSchema = z.object({
  title: z.string().min(1).max(200),
  source: z.enum(['sponsorship', 'advertisement', 'event', 'rental', 'donation', 'other']),
  amount: z.number().positive(),
  receivedOn: z.string().min(1), // ISO date string
  payer: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const incomeFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  source: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  skip: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateIncomeDto = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeDto = z.infer<typeof updateIncomeSchema>;
export type IncomeFilterDto = z.infer<typeof incomeFilterSchema>;