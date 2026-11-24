import { Request, Response, NextFunction } from 'express';
import * as expenseService from '../services/expense.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import {
  expenseFilterSchema,
  expenseMonthlySummaryQuerySchema,
  expenseCategoryBreakdownQuerySchema,
  expenseYearOverYearQuerySchema,
  bulkCreateExpensesSchema,
  importExpensesBodySchema,
} from '../dtos/expense.dto';
import { z } from 'zod';

const vendorSummaryQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional().default(new Date().getFullYear()),
});

export async function getExpensesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const filter = expenseFilterSchema.parse(req.query);
    const { data, total } = await expenseService.getExpenses(filter, pagination, req.user!.societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getExpenseByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

export async function createExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const recordedBy = req.user!.userId;
    const expense = await expenseService.createExpense(req.body, recordedBy, req.user!.societyId);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

export async function updateExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

export async function deleteExpenseHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await expenseService.deleteExpense(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getExpenseMonthlySummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { months } = expenseMonthlySummaryQuerySchema.parse(req.query);
    const data = await expenseService.getExpenseMonthlySummary(months, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBreakdownHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { year } = expenseCategoryBreakdownQuerySchema.parse(req.query);
    const data = await expenseService.getCategoryBreakdown(year, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getYearOverYearHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { years } = expenseYearOverYearQuerySchema.parse(req.query);
    const data = await expenseService.getYearOverYear(years, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateExpensesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { expenses } = bulkCreateExpensesSchema.parse(req.body);
    const recordedBy = req.user!.userId;
    const result = await expenseService.bulkCreateExpenses(expenses, recordedBy, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function importExpensesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { csv } = importExpensesBodySchema.parse(req.body);
    const recordedBy = req.user!.userId;
    const result = await expenseService.importExpensesFromCsv(csv, recordedBy, req.user!.societyId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getVendorSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { year } = vendorSummaryQuerySchema.parse(req.query);
    const data = await expenseService.getVendorSummary(year, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}