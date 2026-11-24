import { z } from 'zod';

const HELPER_CATEGORIES = [
  'electrician', 'plumber', 'carpenter', 'ac_service',
  'motor_binding', 'generator_service', 'painting',
  'pest_control', 'housekeeping', 'security_service', 'other',
] as const;

export const createHelperSchema = z.object({
  name:           z.string().min(1, 'Name is required'),
  phone:          z.string().min(1, 'Phone is required'),
  alternatePhone: z.string().optional(),
  email:          z.string().email('Invalid email').optional(),
  category:       z.enum(HELPER_CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  description:    z.string().optional(),
  isActive:       z.boolean().optional(),
});

export const updateHelperSchema = createHelperSchema.partial();

export const getHelpersQuerySchema = z.object({
  category: z.enum(HELPER_CATEGORIES).optional(),
  search:   z.string().optional(),
  isActive: z.enum(['true', 'false']).optional(),
  skip:     z.coerce.number().int().min(0).default(0),
  limit:    z.coerce.number().int().min(1).max(100).default(50),
});

export type CreateHelperDto     = z.infer<typeof createHelperSchema>;
export type UpdateHelperDto     = z.infer<typeof updateHelperSchema>;
export type GetHelpersQueryDto  = z.infer<typeof getHelpersQuerySchema>;

// ─── Bulk Create Helpers ──────────────────────────────────────────────────────

export const bulkCreateHelpersSchema = z.object({
  helpers: z.array(
    z.object({
      name:           z.string().min(1, 'Name is required'),
      phone:          z.string().min(1, 'Phone is required'),
      alternatePhone: z.string().optional(),
      email:          z.string().email('Invalid email').optional(),
      category:       z.enum(HELPER_CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
      description:    z.string().optional(),
      isActive:       z.boolean().optional(),
    })
  ).min(1).max(100),
});

export type BulkCreateHelpersDto = z.infer<typeof bulkCreateHelpersSchema>;