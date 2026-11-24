import api from './axios';

export interface Helper {
  id:             string;
  societyId:      number;
  name:           string;
  category:       string;
  phone:          string;
  alternatePhone: string | null;
  email:          string | null;
  description:    string | null;
  photoUrl:       string | null;
  isActive:       boolean;
  addedBy:        string | null;
  createdAt:      string;
  updatedAt:      string;
}

export interface HelpersResponse {
  data:  Helper[];
  total: number;
}

export interface CreateHelperPayload {
  name:           string;
  category:       string;
  phone:          string;
  alternatePhone?: string;
  email?:          string;
  description?:    string;
  isActive?:       boolean;
}

export type UpdateHelperPayload = Partial<CreateHelperPayload>;

export interface HelperFilters {
  category?: string;
  search?:   string;
  isActive?: boolean;
  skip?:     number;
  limit?:    number;
}

// ── API functions ─────────────────────────────────────────────────────────────

export const getHelpers = async (filters?: HelperFilters): Promise<HelpersResponse> => {
  const params: Record<string, string | number | boolean> = {};
  if (filters?.category)            params.category = filters.category;
  if (filters?.search)              params.search   = filters.search;
  if (filters?.isActive !== undefined) params.isActive = filters.isActive;
  if (filters?.skip  !== undefined) params.skip     = filters.skip;
  if (filters?.limit !== undefined) params.limit    = filters.limit;

  const res = await api.get<HelpersResponse>('/helpers', { params });
  return res.data;
};

export const getHelperById = async (id: string): Promise<Helper> => {
  const res = await api.get<{ data: Helper }>(`/helpers/${id}`);
  return res.data.data;
};

export const createHelper = async (payload: CreateHelperPayload): Promise<Helper> => {
  const res = await api.post<{ data: Helper }>('/helpers', payload);
  return res.data.data;
};

export const updateHelper = async (id: string, payload: UpdateHelperPayload): Promise<Helper> => {
  const res = await api.patch<{ data: Helper }>(`/helpers/${id}`, payload);
  return res.data.data;
};

export const deleteHelper = async (id: string): Promise<void> => {
  await api.delete(`/helpers/${id}`);
};

export const uploadHelperPhoto = async (id: string, file: File): Promise<Helper> => {
  const form = new FormData();
  form.append('photo', file);
  const res = await api.post<{ data: Helper }>(`/helpers/${id}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

// ── Bulk Create ───────────────────────────────────────────────────────────────

export interface BulkHelperItem {
  name:           string;
  phone:          string;
  alternatePhone?: string;
  email?:          string;
  category:        string;
  description?:    string;
  isActive?:       boolean;
}

export interface BulkHelperRowResult {
  index: number;
  status: 'created' | 'error';
  id?: string;
  name?: string;
  reason?: string;
}

export interface BulkHelperResult {
  total: number;
  created: number;
  errors: number;
  rows: BulkHelperRowResult[];
}

export const bulkCreateHelpers = async (helpers: BulkHelperItem[]): Promise<BulkHelperResult> => {
  const res = await api.post<BulkHelperResult>('/helpers/bulk', { helpers });
  return res.data;
};