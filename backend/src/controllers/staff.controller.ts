import { Request, Response, NextFunction } from 'express';
import * as staffService from '../services/staff.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { bulkCreateStaffSchema } from '../dtos/staff.dto';
import { createError } from '../middleware/error.middleware';

export async function getAllStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const role = req.query.role as string | undefined;
    const search = req.query.search as string | undefined;
    const isActiveParam = req.query.isActive as string | undefined;
    const isActive = isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;
    const pagination = getPagination(req);
    const { data, total } = await staffService.getAllStaff(societyId, role, isActive, search, pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getStaffByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.getStaffById(req.user!.societyId, req.params.id);
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

export async function createStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.createStaff(req.user!.societyId, req.body);
    res.status(201).json(staff);
  } catch (err) {
    next(err);
  }
}

export async function updateStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const staff = await staffService.updateStaff(req.user!.societyId, req.params.id, req.body);
    res.json(staff);
  } catch (err) {
    next(err);
  }
}

export async function deleteStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await staffService.deleteStaff(req.user!.societyId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateStaffHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkCreateStaffSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const result = await staffService.bulkCreateStaff(req.user!.societyId, parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}