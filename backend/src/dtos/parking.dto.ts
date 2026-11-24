import { z } from 'zod';

export const createParkingSlotSchema = z.object({
  slotNumber: z.string().min(1, 'Slot number is required'),
  flatId: z.string().uuid().optional(),
  vehicleNumber: z.string().optional(),
  vehicleType: z.string().optional(),
});

export const updateParkingSlotSchema = z.object({
  flatId: z.string().uuid().nullable().optional(),
  vehicleNumber: z.string().nullable().optional(),
  vehicleType: z.string().nullable().optional(),
  isOccupied: z.boolean().optional(),
});

export type CreateParkingSlotDto = z.infer<typeof createParkingSlotSchema>;
export type UpdateParkingSlotDto = z.infer<typeof updateParkingSlotSchema>;