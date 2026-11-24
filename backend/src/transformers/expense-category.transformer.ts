import { ExpenseCategory } from '@prisma/client';

export function transformExpenseCategory(cat: ExpenseCategory) {
  return {
    id: cat.id,
    societyId: cat.societyId,
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
    isDefault: cat.isDefault,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    createdAt: cat.createdAt.toISOString(),
    updatedAt: cat.updatedAt.toISOString(),
  };
}

export function transformExpenseCategories(cats: ExpenseCategory[]) {
  return cats.map(transformExpenseCategory);
}