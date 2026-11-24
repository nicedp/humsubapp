import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createExpenseSchema,
  updateExpenseSchema,
  bulkCreateExpensesSchema,
  importExpensesBodySchema,
} from '../dtos/expense.dto';
import { createExpenseCategorySchema, updateExpenseCategorySchema } from '../dtos/expense-category.dto';
import * as expenseController from '../controllers/expense.controller';
import * as expenseCategoryController from '../controllers/expense-category.controller';

const router = Router();

router.use(authMiddleware);
router.use(requireRoles('admin'));

// ── Category routes (must be before /:id param routes) ──────────────────────
router.get('/categories', expenseCategoryController.listCategoriesHandler);
router.post('/categories', validate(createExpenseCategorySchema), expenseCategoryController.createCategoryHandler);
router.put('/categories/:id', validate(updateExpenseCategorySchema), expenseCategoryController.updateCategoryHandler);
router.delete('/categories/:id', expenseCategoryController.deleteCategoryHandler);

// ── Analytics static routes ──────────────────────────────────────────────────
router.get('/monthly-summary', expenseController.getExpenseMonthlySummaryHandler);
router.get('/category-breakdown', expenseController.getCategoryBreakdownHandler);
router.get('/year-over-year', expenseController.getYearOverYearHandler);
router.get('/vendor-summary', expenseController.getVendorSummaryHandler);

// ── Bulk operations (must be before /:id param routes) ───────────────────────
router.post('/bulk', validate(bulkCreateExpensesSchema), expenseController.bulkCreateExpensesHandler);
router.post('/import', validate(importExpensesBodySchema), expenseController.importExpensesHandler);

// ── Expense CRUD ─────────────────────────────────────────────────────────────
router.get('/', expenseController.getExpensesHandler);
router.post('/', validate(createExpenseSchema), expenseController.createExpenseHandler);

// Param routes
router.get('/:id', expenseController.getExpenseByIdHandler);
router.put('/:id', validate(updateExpenseSchema), expenseController.updateExpenseHandler);
router.delete('/:id', expenseController.deleteExpenseHandler);

export default router;