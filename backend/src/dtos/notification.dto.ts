import { z } from 'zod';

export const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
});

export type MarkReadDto = z.infer<typeof markReadSchema>;

export const notifyAdminSchema = z.object({
  message: z.string().min(1).max(500),
});

export type NotifyAdminDto = z.infer<typeof notifyAdminSchema>;