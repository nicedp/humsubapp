import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'security'], {
    errorMap: () => ({ message: 'Role must be admin or security' }),
  }),
});

export const updateUserSchema = z.object({
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  role: z.enum(['admin', 'security']).optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;