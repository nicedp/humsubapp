// Note: Prisma type imports show VS Code errors due to no local node_modules.
// Docker build is authoritative.

export function transformNote(note: any) {
  return {
    id: note.id,
    userId: note.userId,
    societyId: note.societyId,
    title: note.title,
    content: note.content,
    color: note.color,
    isPinned: note.isPinned,
    isPublic: note.isPublic,
    // Include author info for public notes (populated by service via include)
    authorUsername: note.user?.username ?? null,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt,
  };
}

export function transformNotes(notes: any[]) {
  return notes.map(transformNote);
}