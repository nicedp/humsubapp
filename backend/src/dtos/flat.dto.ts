import { z } from 'zod';

const FLAT_TYPES = ['flat', 'single', 'duplex', 'triplex', 'bungalow', 'penthouse'] as const;
// Types that require a floor number
const FLOOR_TYPES = new Set(['flat', 'penthouse']);

export const createFlatSchema = z
  .object({
    flatNumber: z.string().min(1, 'Flat number is required'),
    blockId: z.string().uuid('Invalid block ID').optional().nullable(),
    floor: z.number().int().min(0).max(50).optional().nullable(),
    type: z.enum(FLAT_TYPES).default('flat'),
    sqFt: z.number().positive('Square footage must be positive'),
    status: z.enum(['occupied', 'vacant']).default('vacant'),
  })
  .refine(
    (data) => {
      if (FLOOR_TYPES.has(data.type) && (data.floor === undefined || data.floor === null)) {
        return false;
      }
      return true;
    },
    { message: 'Floor number is required for flat and penthouse types', path: ['floor'] }
  );

export const updateFlatSchema = z
  .object({
    flatNumber: z.string().min(1).optional(),
    blockId: z.string().uuid().optional().nullable(),
    floor: z.number().int().min(0).max(50).optional().nullable(),
    type: z.enum(FLAT_TYPES).optional(),
    sqFt: z.number().positive().optional(),
    status: z.enum(['occupied', 'vacant']).optional(),
  });

// Bulk create: array of flat objects (reuses createFlatSchema items, max 500)
export const bulkCreateFlatsSchema = z
  .array(createFlatSchema)
  .min(1, 'At least one flat is required')
  .max(500, 'Cannot create more than 500 flats at once');

export type CreateFlatDto = z.infer<typeof createFlatSchema>;
export type UpdateFlatDto = z.infer<typeof updateFlatSchema>;
export type BulkCreateFlatsDto = z.infer<typeof bulkCreateFlatsSchema>;