import prisma from '../config/db';
import { transformDirectory } from '../transformers/directory.transformer';
import { PaginationParams } from '../helpers/pagination.helper';

/**
 * Resident directory — exposes only name, flatNumber, floor, flatType.
 * NEVER exposes phone, email, or any PII.
 * Visible to all authenticated residents (owner + tenant).
 */
export async function getDirectory(pagination: PaginationParams) {
  const where = { isActive: true };

  const [residents, total] = await Promise.all([
    prisma.resident.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      include: { flat: true },
      orderBy: [{ flat: { floor: 'asc' } }, { flat: { flatNumber: 'asc' } }],
    }),
    prisma.resident.count({ where }),
  ]);

  return { data: transformDirectory(residents), total };
}