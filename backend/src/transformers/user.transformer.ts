import { User } from '@prisma/client';

export function userTransformer(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    isActive: user.isActive,
    residentId: user.residentId ?? null,
    staffId: user.staffId ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}