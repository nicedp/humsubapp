import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['lift', 'borewell', 'water_tank', 'generator', 'other']),
  status: z.enum(['operational', 'under_maintenance', 'out_of_service']).default('operational'),
  location: z.string().optional(),
  lastServiceDate: z.string().optional(),
  nextServiceDue: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

export type CreateAssetDto = z.infer<typeof createAssetSchema>;
export type UpdateAssetDto = z.infer<typeof updateAssetSchema>;