import { Request } from 'express';

export interface PaginationParams {
  skip: number;
  limit: number;
}

/**
 * Extracts skip/limit pagination params from query string.
 * Defaults: skip=0, limit=20. Max limit capped at 100.
 */
export function getPagination(req: Request): PaginationParams {
  const skip = Math.max(0, parseInt((req.query.skip as string) ?? '0', 10) || 0);
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? '20', 10) || 20));
  return { skip, limit };
}

/**
 * Builds a standard paginated response envelope.
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams
): { data: T[]; total: number; skip: number; limit: number } {
  return {
    data,
    total,
    skip: params.skip,
    limit: params.limit,
  };
}