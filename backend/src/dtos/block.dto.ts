import { z } from 'zod';

export const createBlockSchema = z.object({
  name: z.string().min(1, 'Block name is required').max(50),
  description: z.string().max(255).nullable().optional(),
  blockType: z.enum(['flats', 'rowhouses', 'mixed']).default('flats'),
  totalFloors: z.number().int().min(1).max(20).optional().nullable(),
});

export const updateBlockSchema = createBlockSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateBlockDto = z.infer<typeof createBlockSchema>;
export type UpdateBlockDto = z.infer<typeof updateBlockSchema>;