import { z } from 'zod';

export const createStaffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  shift: z.string().optional(),
  joinDate: z.coerce.date().optional(),
  // User account (for security guards) — omit or leave empty to skip login creation
  username: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(3).optional()
  ),
  password: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().min(8).optional()
  ),
});

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.string().optional(),
  phone: z.string().optional(),
  shift: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateStaffDto = z.infer<typeof createStaffSchema>;
export type UpdateStaffDto = z.infer<typeof updateStaffSchema>;

// ─── Bulk Create Staff ────────────────────────────────────────────────────────

export const bulkCreateStaffSchema = z.object({
  staff: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      role: z.string().min(1, 'Role is required'),
      phone: z.string().optional(),
      shift: z.string().optional(),
      joinDate: z.coerce.date().optional(),
      username: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.string().min(3).optional()
      ),
      password: z.preprocess(
        (val) => (val === '' ? undefined : val),
        z.string().min(8).optional()
      ),
    })
  ).min(1).max(100),
});

export type BulkCreateStaffDto = z.infer<typeof bulkCreateStaffSchema>;