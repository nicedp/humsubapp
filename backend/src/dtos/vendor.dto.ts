import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  serviceType: z.string().min(1),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1).optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  serviceType: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createContractSchema = z.object({
  vendorId: z.string().uuid(),
  assetId: z.string().uuid().optional(),
  contractNumber: z.string().optional(),
  serviceType: z.string().min(1),
  annualCost: z.number().nonnegative(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  serviceFrequencyDays: z.number().int().positive().default(90),
  nextServiceDue: z.coerce.date().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'pending_renewal']).optional(),
  notes: z.string().optional(),
});

export const updateContractSchema = z.object({
  vendorId: z.string().uuid().optional(),
  assetId: z.string().uuid().optional(),
  contractNumber: z.string().optional(),
  serviceType: z.string().optional(),
  annualCost: z.number().nonnegative().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  serviceFrequencyDays: z.number().int().positive().optional(),
  nextServiceDue: z.coerce.date().optional(),
  status: z.enum(['active', 'expired', 'cancelled', 'pending_renewal']).optional(),
  notes: z.string().optional(),
});

export const createServiceLogSchema = z.object({
  serviceDate: z.coerce.date(),
  technicianName: z.string().optional(),
  workDone: z.string().min(1),
  serviceCost: z.number().nonnegative().optional(),
  nextServiceDue: z.coerce.date().optional(), // admin override; if null → auto-calculated
  remarks: z.string().optional(),
});

export type CreateVendorDto = z.infer<typeof createVendorSchema>;
export type UpdateVendorDto = z.infer<typeof updateVendorSchema>;
export type CreateContractDto = z.infer<typeof createContractSchema>;
export type UpdateContractDto = z.infer<typeof updateContractSchema>;
export type CreateServiceLogDto = z.infer<typeof createServiceLogSchema>;