import { Request, Response, NextFunction } from 'express';
import * as expenseCategoryService from '../services/expense-category.service';

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await expenseCategoryService.listCategories(req.user!.societyId);
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await expenseCategoryService.createCategory(req.body, req.user!.societyId);
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

export async function updateCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid category id' });
      return;
    }
    const category = await expenseCategoryService.updateCategory(id, req.body);
    res.json(category);
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid category id' });
      return;
    }
    const result = await expenseCategoryService.deleteCategory(id, req.user!.societyId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}