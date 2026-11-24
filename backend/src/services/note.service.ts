import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { transformNote, transformNotes } from '../transformers/note.transformer';
import { CreateNoteDto, UpdateNoteDto } from '../dtos/note.dto';

// GET /api/v1/notes
// Returns: myNotes (own notes) + publicNotes (other users' public notes in society)
export async function getNotes(userId: string, societyId: number = 1) {
  const [myNotes, publicNotes] = await Promise.all([
    // All notes owned by this user
    prisma.userNote.findMany({
      where: { userId },
      include: { user: { select: { username: true } } },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    }),
    // Public notes from OTHER users in the same society
    prisma.userNote.findMany({
      where: {
        societyId,
        isPublic: true,
        NOT: { userId },
      },
      include: { user: { select: { username: true } } },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    }),
  ]);

  return {
    myNotes: transformNotes(myNotes),
    publicNotes: transformNotes(publicNotes),
  };
}

export async function createNote(dto: CreateNoteDto, userId: string, societyId: number = 1) {
  const note = await prisma.userNote.create({
    data: {
      userId,
      societyId,
      title: dto.title,
      content: dto.content ?? '',
      color: dto.color ?? 'yellow',
      isPinned: dto.isPinned ?? false,
      isPublic: dto.isPublic ?? false,
    },
    include: { user: { select: { username: true } } },
  });
  return transformNote(note);
}

export async function updateNote(id: string, dto: UpdateNoteDto, userId: string) {
  const existing = await prisma.userNote.findUnique({ where: { id } });
  if (!existing) throw createError('Note not found', 404);
  if (existing.userId !== userId) throw createError('Forbidden — not your note', 403);

  const note = await prisma.userNote.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
    },
    include: { user: { select: { username: true } } },
  });
  return transformNote(note);
}

export async function deleteNote(id: string, userId: string) {
  const existing = await prisma.userNote.findUnique({ where: { id } });
  if (!existing) throw createError('Note not found', 404);
  if (existing.userId !== userId) throw createError('Forbidden — not your note', 403);
  await prisma.userNote.delete({ where: { id } });
  return { deleted: true };
}