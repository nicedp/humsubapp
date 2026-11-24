import { z } from 'zod';

const NOTE_COLORS = ['yellow', 'blue', 'pink', 'green', 'purple', 'white'] as const;

export const createNoteSchema = z.object({
  title: z.string().min(1),
  content: z.string().default(''),
  color: z.enum(NOTE_COLORS).default('yellow'),
  isPinned: z.boolean().default(false),
  isPublic: z.boolean().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  color: z.enum(NOTE_COLORS).optional(),
  isPinned: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;