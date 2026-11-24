import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  expiresOn: z.coerce.date().optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();

export type CreateNoticeDto = z.infer<typeof createNoticeSchema>;
export type UpdateNoticeDto = z.infer<typeof updateNoticeSchema>;