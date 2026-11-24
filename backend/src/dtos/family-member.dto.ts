import { z } from 'zod'

export const createFamilyMemberSchema = z.object({
  name: z.string().min(1).max(100),
  relation: z.enum(['spouse', 'child', 'parent', 'sibling', 'other']),
  phone: z.string().max(20).optional().nullable(),
  dateOfBirth: z.string().datetime({ offset: true }).optional().nullable(),
  isEmergency: z.boolean().optional().default(false),
})

export const updateFamilyMemberSchema = createFamilyMemberSchema.partial()

export type CreateFamilyMemberDto = z.infer<typeof createFamilyMemberSchema>
export type UpdateFamilyMemberDto = z.infer<typeof updateFamilyMemberSchema>