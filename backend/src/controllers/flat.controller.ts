import { Request, Response, NextFunction } from 'express';
import * as flatService from '../services/flat.service';
import { FlatFilters } from '../services/flat.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllFlatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const pagination = getPagination(req);

    const filters: FlatFilters = {};
    if (req.query.status === 'occupied' || req.query.status === 'vacant') filters.status = req.query.status;
    if (req.query.floor) filters.floor = parseInt(req.query.floor as string, 10);
    if (req.query.type) filters.type = req.query.type as string;
    if (req.query.blockId) filters.blockId = req.query.blockId as string;
    if (req.query.search) filters.search = req.query.search as string;

    const { data, total } = await flatService.getAllFlats(societyId, pagination, filters);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getFlatByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const flat = await flatService.getFlatById(req.user!.societyId, req.params.id);
    res.json(flat);
  } catch (err) {
    next(err);
  }
}

export async function createFlatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const flat = await flatService.createFlat(req.user!.societyId, req.body);
    res.status(201).json(flat);
  } catch (err) {
    next(err);
  }
}

export async function updateFlatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const flat = await flatService.updateFlat(req.user!.societyId, req.params.id, req.body);
    res.json(flat);
  } catch (err) {
    next(err);
  }
}

export async function deleteFlatHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await flatService.deleteFlat(req.user!.societyId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateFlatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await flatService.bulkCreateFlats(req.user!.societyId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}