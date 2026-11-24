import { Request, Response, NextFunction } from 'express';
import * as incomeService from '../services/income.service';
import { validate } from '../middleware/validate.middleware';
import { createIncomeSchema, updateIncomeSchema, incomeFilterSchema } from '../dtos/income.dto';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const filter = incomeFilterSchema.parse(req.query);
    const { data, total } = await incomeService.getIncomes(filter, req.user!.societyId);
    res.json(paginatedResponse(data, total, { skip: filter.skip, limit: filter.limit }));
  } catch (err) { next(err) }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await incomeService.getIncomeById(req.params.id);
    res.json(record);
  } catch (err) { next(err) }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = createIncomeSchema.parse(req.body);
    const record = await incomeService.createIncome(dto, req.user!.userId, req.user!.societyId);
    res.status(201).json(record);
  } catch (err) { next(err) }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const dto = updateIncomeSchema.parse(req.body);
    const record = await incomeService.updateIncome(req.params.id, dto);
    res.json(record);
  } catch (err) { next(err) }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await incomeService.deleteIncome(req.params.id);
    res.json(result);
  } catch (err) { next(err) }
}