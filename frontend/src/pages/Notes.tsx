
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { notesApi, UserNote } from '../api/notes'

const NOTE_COLORS: Record<string, { bg: string; border: string; title: string }> = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-800'   },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   title: 'text-pink-800'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-800'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800' },
  white:  { bg: 'bg-white',     border: 'border-gray-200',   title: 'text-gray-800'   },
}
const COLOR_PICKERS = ['yellow', 'blue', 'pink', 'green', 'purple', 'white'] as const
const COLOR_DOTS: Record<string, string> = {
  yellow: 'bg-yellow-400',
  blue:   'bg-blue-400',
  pink:   'bg-pink-400',
  green:  'bg-green-400',
  purple: 'bg-purple-400',
  white:  'bg-gray-300',
}

const noteSchema = z.object({
  title: z.string().min(1, 'Title required'),
  content: z.string().optional(),
  color: z.enum(['yellow', 'blue', 'pink', 'green', 'purple', 'white']).default('yellow'),
  isPinned: z.boolean().default(false),
  isPublic: z.boolean().default(false),
})
type NoteForm = z.infer<typeof noteSchema>

function NoteCard({
  note,
  isOwn,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePublic,
}: {
  note: UserNote
  isOwn: boolean
  onEdit?: (note: UserNote) => void
  onDelete?: (id: string) => void
  onTogglePin?: (note: UserNote) => void
  onTogglePublic?: (note: UserNote) => void
}) {
  const colors = NOTE_COLORS[note.color] ?? NOTE_COLORS.yellow

  return (
    <div className={`rounded-2xl border p-4 shadow-sm relative ${colors.bg} ${colors.border}`}>
      {note.isPinned && (
        <span className="absolute top-3 right-3 text-sm" title="Pinned">📌</span>
      )}
      <h3 className={`font-bold text-sm pr-6 ${colors.title}`}>{note.title}</h3>
      {note.content && <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.content}</p>}
      <div className="flex items-center gap-2 mt-3">
        {note.isPublic && (
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">🌐 Public</span>
        )}
        {!isOwn && note.authorUsername && (
          <span className="text-xs text-gray-400">by {note.authorUsername}</span>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {new Date(note.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
        </span>
      </div>
      {isOwn && (
        <div className="flex gap-1 mt-3 pt-2 border-t border-black/5">
          <button onClick={() => onEdit?.(note)}
            className="flex-1 text-xs text-gray-500 hover:text-gray-700 py-1 rounded-lg hover:bg-black/5">
            ✏️ Edit
          </button>
          <button onClick={() => onTogglePin?.(note)}
            className="flex-1 text-xs text-gray-500 hover:text-gray-700 py-1 rounded-lg hover:bg-black/5">
            {note.isPinned ? '📌 Unpin' : '📍 Pin'}
          </button>
          <button onClick={() => onTogglePublic?.(note)}
            className="flex-1 text-xs text-gray-500 hover:text-gray-700 py-1 rounded-lg hover:bg-black/5">
            {note.isPublic ? '🔒 Private' : '🌐 Public'}
          </button>
          <button onClick={() => onDelete?.(note.id)}
            className="flex-1 text-xs text-red-400 hover:text-red-600 py-1 rounded-lg hover:bg-red-50">
            🗑️
          </button>
        </div>
      )}
    </div>
  )
}

export default function Notes() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editNote, setEditNote] = useState<UserNote | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => notesApi.list(),
  })

  const myNotes = data?.myNotes ?? []
  const publicNotes = (data?.publicNotes ?? []).filter(n => !myNotes.find(m => m.id === n.id))

  const pinnedNotes = myNotes.filter(n => n.isPinned)
  const unpinnedNotes = myNotes.filter(n => !n.isPinned)

  const form = useForm<NoteForm>({
    resolver: zodResolver(noteSchema),
    defaultValues: { color: 'yellow', isPinned: false, isPublic: false },
  })

  const selectedColor = form.watch('color')

  const resetForm = () => {
    form.reset({ color: 'yellow', isPinned: false, isPublic: false })
    setEditNote(null)
    setShowForm(false)
  }

  const createMut = useMutation({
    mutationFn: (d: NoteForm) => notesApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note added!'); resetForm() },
    onError: () => toast.error('Failed to create note'),
  })

  const updateMut = useMutation({
    mutationFn: (d: NoteForm) => notesApi.update(editNote!.id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note updated!'); resetForm() },
    onError: () => toast.error('Failed to update note'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Note deleted') },
    onError: () => toast.error('Failed to delete note'),
  })

  const togglePinMut = useMutation({
    mutationFn: (note: UserNote) => notesApi.update(note.id, { isPinned: !note.isPinned }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    onError: () => toast.error('Failed to update'),
  })

  const togglePublicMut = useMutation({
    mutationFn: (note: UserNote) => notesApi.update(note.id, { isPublic: !note.isPublic }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); toast.success('Visibility updated') },
    onError: () => toast.error('Failed to update'),
  })

  const openEdit = (note: UserNote) => {
    setEditNote(note)
    form.reset({
      title: note.title,
      content: note.content,
      color: note.color,
      isPinned: note.isPinned,
      isPublic: note.isPublic,
    })
    setShowForm(true)
  }

  const onSubmit = (d: NoteForm) => {
    if (editNote) updateMut.mutate(d)
    else createMut.mutate(d)
  }

  const isPending = createMut.isPending || updateMut.isPending

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 My Notes</h1>
          <p className="text-sm text-gray-500 mt-1">Personal notes and public society board</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
          + New Note
        </button>
      </div>

      {/* Note form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editNote ? 'Edit Note' : 'New Note'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input {...form.register('title')} placeholder="Note title"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-300 focus:outline-none" />
                {form.formState.errors.title && <p className="text-red-500 text-xs mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea {...form.register('content')} rows={4} placeholder="Write your note here..."
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-300 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLOR_PICKERS.map(c => (
                    <button key={c} type="button" onClick={() => form.setValue('color', c)}
                      className={`w-7 h-7 rounded-full ${COLOR_DOTS[c]} border-2 transition-all ${selectedColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                      title={c} />
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...form.register('isPinned')} type="checkbox"
                    className="w-4 h-4 rounded accent-yellow-500" />
                  <span className="text-sm text-gray-700">📌 Pin this note</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input {...form.register('isPublic')} type="checkbox"
                    className="w-4 h-4 rounded accent-blue-500" />
                  <span className="text-sm text-gray-700">🌐 Share publicly</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isPending}

                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">
                  {isPending ? 'Saving...' : editNote ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading notes...</div>
      ) : (
        <div className="space-y-8">
          {/* ── My Notes ── */}
          <section>
            <h2 className="text-lg font-bold text-gray-700 mb-4">📌 My Notes ({myNotes.length})</h2>
            {myNotes.length === 0 ? (
              <div className="p-12 text-center bg-yellow-50 rounded-2xl border border-yellow-100">
                <p className="text-5xl mb-3">📝</p>
                <p className="font-semibold text-gray-700">No notes yet</p>
                <p className="text-sm text-gray-400 mt-1">Click "+ New Note" to get started</p>
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    {pinnedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isOwn={true}
                        onEdit={openEdit}
                        onDelete={id => deleteMut.mutate(id)}
                        onTogglePin={n => togglePinMut.mutate(n)}
                        onTogglePublic={n => togglePublicMut.mutate(n)}
                      />
                    ))}
                  </div>
                )}
                {unpinnedNotes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {unpinnedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        isOwn={true}
                        onEdit={openEdit}
                        onDelete={id => deleteMut.mutate(id)}
                        onTogglePin={n => togglePinMut.mutate(n)}
                        onTogglePublic={n => togglePublicMut.mutate(n)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── Public Board ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-bold text-gray-700">🌐 Society Board</h2>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                Notes shared by all members
              </span>
            </div>
            {publicNotes.length === 0 ? (
              <div className="p-12 text-center bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-5xl mb-3">🌐</p>
                <p className="font-semibold text-gray-700">No public notes yet</p>
                <p className="text-sm text-gray-400 mt-1">Be the first to share a note with the society</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {publicNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    isOwn={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
