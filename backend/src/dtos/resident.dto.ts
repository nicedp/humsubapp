import { z } from 'zod';

export const createResidentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  phone: z.string().min(10, 'Valid phone number is required'),
  whatsapp: z.string().optional(),
  flatId: z.string().uuid('Valid flat ID is required'),
  residentType: z.enum(['owner', 'tenant']),
  moveInDate: z.union([z.literal(''), z.coerce.date()]).optional().transform(v => v === '' ? undefined : v),
  numCars: z.number().int().min(0).default(0),
  numBikes: z.number().int().min(0).default(0),
  // User account fields — both optional; if one is set, both must be set
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
}).refine(
  (d) => (!d.username && !d.password) || (!!d.username && !!d.password),
  { message: 'Both username and password are required when creating a login account' }
);

export const updateResidentSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  whatsapp: z.string().optional(),
  flatId: z.string().uuid().optional(),
  residentType: z.enum(['owner', 'tenant']).optional(),
  isActive: z.boolean().optional(),
  moveOutDate: z.coerce.date().optional(),
  numCars: z.number().int().min(0).optional(),
  numBikes: z.number().int().min(0).optional(),
  // Credential management on edit:
  // - username: set to create a new login (if resident has no user) or ignored
  // - password: set to update the existing user's password (if user exists) or create new login (with username)
  username: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
}).refine(
  (d) => {
    // If username is provided, password must be too (for new account creation)
    if (d.username && !d.password) return false;
    return true;
  },
  { message: 'Password is required when setting a new username' }
);

export const updateMyProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(10).optional(),
  whatsapp: z.string().optional().nullable(),
});

export type CreateResidentDto = z.infer<typeof createResidentSchema>;
export type UpdateResidentDto = z.infer<typeof updateResidentSchema>;
export type UpdateMyProfileDto = z.infer<typeof updateMyProfileSchema>;

// ─── Bulk Create Residents ────────────────────────────────────────────────────

export const bulkCreateResidentsSchema = z.object({
  residents: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Valid email is required').optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
      phone: z.string().min(10, 'Valid phone number is required'),
      whatsapp: z.string().optional(),
      flatId: z.string().uuid('Valid flat ID is required'),
      residentType: z.enum(['owner', 'tenant']),
      moveInDate: z.union([z.literal(''), z.coerce.date()]).optional().transform(v => v === '' ? undefined : v),
      numCars: z.number().int().min(0).default(0),
      numBikes: z.number().int().min(0).default(0),
      username: z.string().min(3, 'Username must be at least 3 characters').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    }).refine(
      (d) => (!d.username && !d.password) || (!!d.username && !!d.password),
      { message: 'Both username and password are required when creating a login account' }
    )
  ).min(1).max(100),
});

export type BulkCreateResidentsDto = z.infer<typeof bulkCreateResidentsSchema>;

// ─── Vehicle DTOs ─────────────────────────────────────────────────────────────

export const createVehicleSchema = z.object({
  vehicleType: z.enum(['car', 'bike', 'scooter', 'other']),
  vehicleNumber: z.string().min(1, 'Vehicle number is required'),
  make: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
});

export const updateVehicleSchema = z.object({
  vehicleType: z.enum(['car', 'bike', 'scooter', 'other']).optional(),
  vehicleNumber: z.string().min(1).optional(),
  make: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export type CreateVehicleDto = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleSchema>;

// ─── Admin Change Resident Password ──────────────────────────────────────────

export const adminChangePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  notify: z.enum(['email', 'whatsapp', 'none']).default('none'),
});

export type AdminChangePasswordDto = z.infer<typeof adminChangePasswordSchema>;