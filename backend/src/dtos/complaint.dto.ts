import { z } from 'zod';

export const createComplaintSchema = z.object({
  flatId: z.string().uuid('Valid flat ID is required').optional(), // auto-resolved from JWT residentId if not provided
  category: z.enum(['maintenance', 'noise', 'cleanliness', 'security', 'billing', 'other']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export const updateComplaintSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  adminRemark: z.string().optional(),
  resolvedOn: z.coerce.date().optional(),
});

export type CreateComplaintDto = z.infer<typeof createComplaintSchema>;
export type UpdateComplaintDto = z.infer<typeof updateComplaintSchema>;