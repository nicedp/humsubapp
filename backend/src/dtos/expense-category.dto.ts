import { z } from 'zod';

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9_-]+$/, 'Slug must be lowercase alphanumeric with hyphens/underscores'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color e.g. #ff0000').optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateExpenseCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Color must be a valid hex color e.g. #ff0000').optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateExpenseCategoryDto = z.infer<typeof createExpenseCategorySchema>;
export type UpdateExpenseCategoryDto = z.infer<typeof updateExpenseCategorySchema>;