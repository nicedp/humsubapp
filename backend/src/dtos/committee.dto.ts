import { z } from 'zod';

// Accepts both date-only (YYYY-MM-DD) and full ISO datetime strings
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}/, { message: 'Must be a valid date (YYYY-MM-DD)' });

export const createCommitteeSchema = z.object({
  name: z.string().min(1, 'Committee name is required'),
  formedOn: isoDate,
  dissolvedOn: isoDate.optional().nullable(),
});

export const updateCommitteeSchema = z.object({
  name: z.string().min(1).optional(),
  formedOn: isoDate.optional(),
  dissolvedOn: isoDate.optional().nullable(),
});

export const addMemberSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  designation: z.enum([
    'president',
    'vice_president',
    'secretary',
    'joint_secretary',
    'treasurer',
    'joint_treasurer',
    'member',
    'advisor',
  ]),
  joinedOn: isoDate.optional(),
  notes: z.string().optional().nullable(),
});

export const updateMemberSchema = z.object({
  designation: z
    .enum([
      'president',
      'vice_president',
      'secretary',
      'joint_secretary',
      'treasurer',
      'joint_treasurer',
      'member',
      'advisor',
    ])
    .optional(),
  isActive: z.boolean().optional(),
  leftOn: isoDate.optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const addAchievementSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  achievedOn: isoDate,
  category: z.enum(['infrastructure', 'finance', 'community', 'legal', 'safety', 'other']),
});

export type CreateCommitteeDto = z.infer<typeof createCommitteeSchema>;
export type UpdateCommitteeDto = z.infer<typeof updateCommitteeSchema>;
export type AddMemberDto = z.infer<typeof addMemberSchema>;
export type UpdateMemberDto = z.infer<typeof updateMemberSchema>;
export type AddAchievementDto = z.infer<typeof addAchievementSchema>;