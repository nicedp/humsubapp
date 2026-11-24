import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import {
  transformExpenseCategory,
  transformExpenseCategories,
} from '../transformers/expense-category.transformer';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
} from '../dtos/expense-category.dto';

export async function listCategories(societyId: number = 1) {
  const cats = await prisma.expenseCategory.findMany({
    where: { societyId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return transformExpenseCategories(cats);
}

export async function listActiveCategories(societyId: number = 1) {
  const cats = await prisma.expenseCategory.findMany({
    where: { societyId, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
  return transformExpenseCategories(cats);
}

export async function createCategory(dto: CreateExpenseCategoryDto, societyId: number = 1) {
  // Check slug uniqueness
  const existing = await prisma.expenseCategory.findUnique({
    where: { societyId_slug: { societyId, slug: dto.slug } },
  });
  if (existing) throw createError(`Category slug '${dto.slug}' already exists`, 409);

  const cat = await prisma.expenseCategory.create({
    data: {
      societyId,
      name: dto.name,
      slug: dto.slug,
      color: dto.color ?? null,
      isDefault: false,
      sortOrder: dto.sortOrder ?? 0,
      isActive: true,
    },
  });
  return transformExpenseCategory(cat);
}

export async function updateCategory(id: number, dto: UpdateExpenseCategoryDto) {
  const existing = await prisma.expenseCategory.findUnique({ where: { id } });
  if (!existing) throw createError('Expense category not found', 404);

  const cat = await prisma.expenseCategory.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.color !== undefined && { color: dto.color }),
      ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
    },
  });
  return transformExpenseCategory(cat);
}

export async function deleteCategory(id: number, societyId: number = 1) {
  const existing = await prisma.expenseCategory.findUnique({ where: { id } });
  if (!existing) throw createError('Expense category not found', 404);

  // Prevent deleting categories that are in use
  const usageCount = await prisma.expense.count({
    where: { societyId, category: existing.slug },
  });
  if (usageCount > 0) {
    throw createError(
      `Cannot delete category '${existing.name}' — it is used by ${usageCount} expense(s). Deactivate it instead.`,
      409
    );
  }

  await prisma.expenseCategory.delete({ where: { id } });
  return { deleted: true };
}