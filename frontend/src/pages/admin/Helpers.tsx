import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  getHelpers, createHelper, updateHelper, deleteHelper, uploadHelperPhoto,
  type Helper, type CreateHelperPayload,
} from '../../api/helpers';
import HelperCard from '../../components/HelperCard';
import {
  HELPER_CATEGORIES,
  HELPER_CATEGORY_LABELS,
  HELPER_CATEGORY_ICONS,
} from '../../constants/labels';

// ─── Form shape ───────────────────────────────────────────────────────────────
interface HelperForm {
  name:           string;
  category:       string;
  phone:          string;
  alternatePhone: string;
  email:          string;
  description:    string;
  isActive:       boolean;
}

const EMPTY_FORM: HelperForm = {
  name:           '',
  category:       HELPER_CATEGORIES[0] ?? 'plumber',
  phone:          '',
  alternatePhone: '',
  email:          '',
  description:    '',
  isActive:       true,
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminHelpers: React.FC = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  // ── Filters ────────────────────────────────────────────────────────────────
  const [search,        setSearch]        = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showInactive,  setShowInactive]  = useState(false);
  const [skip, setSkip] = useState(0);
  const LIMIT = 20;

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editHelper,  setEditHelper]  = useState<Helper | null>(null);
  const [form,        setForm]        = useState<HelperForm>(EMPTY_FORM);
  const [formError,   setFormError]   = useState('');

  // ── Photo upload state ─────────────────────────────────────────────────────
  const [photoUploadId,    setPhotoUploadId]    = useState<string | null>(null);
  const [photoUploading,   setPhotoUploading]   = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirm ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Helper | null>(null);

  // ─── Query ─────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['helpers', { search, categoryFilter, showInactive, skip }],
    queryFn:  () => getHelpers({
      search:   search || undefined,
      category: categoryFilter || undefined,
      isActive: showInactive ? undefined : true,
      skip,
      limit: LIMIT,
    }),
  });

  const helpers = data?.data ?? [];
  const total   = data?.total ?? 0;

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: createHelper,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['helpers'] }); closeModal(); },
    onError:    (e: Error) => setFormError(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateHelperPayload> }) =>
      updateHelper(id, payload),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['helpers'] }); closeModal(); },
    onError:    (e: Error) => setFormError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHelper,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['helpers'] }); setDeleteTarget(null); },
  });

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditHelper(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (h: Helper) => {
    setEditHelper(h);
    setForm({
      name:           h.name,
      category:       h.category,
      phone:          h.phone,
      alternatePhone: h.alternatePhone ?? '',
      email:          h.email          ?? '',
      description:    h.description    ?? '',
      isActive:       h.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditHelper(null);
    setForm(EMPTY_FORM);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim())  { setFormError('Name is required'); return; }
    if (!form.phone.trim()) { setFormError('Phone is required'); return; }

    const payload: CreateHelperPayload = {
      name:           form.name.trim(),
      category:       form.category,
      phone:          form.phone.trim(),
      alternatePhone: form.alternatePhone.trim() || undefined,
      email:          form.email.trim()          || undefined,
      description:    form.description.trim()    || undefined,
      isActive:       form.isActive,
    };

    if (editHelper) {
      updateMutation.mutate({ id: editHelper.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handlePhotoClick = (h: Helper) => {
    setPhotoUploadId(h.id);
    photoInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoUploadId) return;
    setPhotoUploading(true);
    try {
      await uploadHelperPhoto(photoUploadId, file);
      qc.invalidateQueries({ queryKey: ['helpers'] });
    } catch {
      // silent — could show a toast
    } finally {
      setPhotoUploading(false);
      setPhotoUploadId(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(skip / LIMIT) + 1;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Hidden photo input */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={photoInputRef}
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔧 Society Helpers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Plumbers, electricians, cleaning staff and more — one click away.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/helper-bulk-entry')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
            ⚡ Bulk Entry
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add Helper
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white border rounded-xl p-4">
        <input
          type="text"
          placeholder="Search name or phone…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSkip(0); }}
          className="border rounded-lg px-3 py-1.5 text-sm w-56 focus:ring-2 focus:ring-indigo-300 outline-none"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setSkip(0); }}
          className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
        >
          <option value="">All Categories</option>
          {HELPER_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {HELPER_CATEGORY_ICONS[cat]} {HELPER_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => { setShowInactive(e.target.checked); setSkip(0); }}
            className="rounded"
          />
          Show inactive
        </label>
        <span className="ml-auto text-xs text-gray-400">{total} helper{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Category quick-filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setCategoryFilter(''); setSkip(0); }}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !categoryFilter
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
          }`}
        >
          All
        </button>
        {HELPER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategoryFilter(cat); setSkip(0); }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              categoryFilter === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}
          >
            {HELPER_CATEGORY_ICONS[cat]} {HELPER_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading helpers…</div>
      ) : helpers.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-5xl mb-3">🔧</p>
          <p className="font-semibold text-gray-700">No helpers found</p>
          <p className="text-sm text-gray-400 mt-1">Add plumbers, electricians and more to the directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {helpers.map((h) => (
            <div key={h.id} className="relative group">
              <HelperCard
                helper={h}
                onEdit={openEdit}
                onDelete={(helper) => setDeleteTarget(helper)}
              />
              {/* Photo upload overlay */}
              <button
                onClick={() => handlePhotoClick(h)}
                disabled={photoUploading}
                title="Change photo"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded-lg p-1 text-xs shadow hover:bg-gray-50"
              >
                {photoUploading && photoUploadId === h.id ? '⏳' : '📷'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setSkip(skip - LIMIT)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setSkip(skip + LIMIT)}
            className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editHelper ? '✏️ Edit Helper' : '+ New Helper'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {HELPER_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`text-xs py-2 px-1 rounded-lg border text-center transition-colors ${
                          form.category === cat
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        <div className="text-base mb-0.5">{HELPER_CATEGORY_ICONS[cat]}</div>
                        <div className="truncate">{HELPER_CATEGORY_LABELS[cat]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Enter Mobile Number"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt. Phone</label>
                    <input
                      type="tel"
                      value={form.alternatePhone}
                      onChange={(e) => setForm({ ...form, alternatePhone: e.target.value })}
                      placeholder="Optional"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="helper@example.com"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description / Notes</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Any special notes, working hours, area served…"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none resize-none"
                  />
                </div>

                {/* Active */}
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active (visible to residents)
                </label>

                {formError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Saving…'
                      : editHelper ? 'Save Changes' : 'Add Helper'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Helper</h2>
            <p className="text-sm text-gray-600 mb-6">
              Remove <strong>{deleteTarget.name}</strong> from the directory? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHelpers;