import { z } from 'zod';

export const createEventSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  eventDate: z.coerce.date(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
  budgetTarget: z.number().min(0).default(0),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  eventDate: z.coerce.date().optional(),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']).optional(),
  budgetTarget: z.number().min(0).optional(),
});

export const createContributionSchema = z.object({
  contributorName: z.string().min(1),
  flatId: z.string().uuid().optional(),
  amount: z.number().positive(),
  paymentMode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']).default('cash'),
  paidOn: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const bulkContributionSchema = z.object({
  contributions: z.array(createContributionSchema).min(1).max(200),
});

export const importContributionSchema = z.object({
  csv: z.string().min(1),
});

export const createEventExpenseSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  amount: z.number().positive(),
  paidOn: z.coerce.date().optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

export const addTeamMemberSchema = z.object({
  residentId: z.string().uuid(),
  role: z.string().min(1),
  notes: z.string().optional(),
});

export type CreateEventDto = z.infer<typeof createEventSchema>;
export type UpdateEventDto = z.infer<typeof updateEventSchema>;
export type CreateContributionDto = z.infer<typeof createContributionSchema>;
export type BulkContributionDto = z.infer<typeof bulkContributionSchema>;
export type ImportContributionDto = z.infer<typeof importContributionSchema>;
export type CreateEventExpenseDto = z.infer<typeof createEventExpenseSchema>;
export type AddTeamMemberDto = z.infer<typeof addTeamMemberSchema>;