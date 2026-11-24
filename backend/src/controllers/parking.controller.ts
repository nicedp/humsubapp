import { Request, Response, NextFunction } from 'express';
import * as parkingService from '../services/parking.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllParkingSlotsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const pagination = getPagination(req);

    const { isOccupied, search } = req.query as Record<string, string | undefined>;
    const filters: { isOccupied?: boolean; search?: string } = {};
    if (isOccupied === 'true') filters.isOccupied = true;
    else if (isOccupied === 'false') filters.isOccupied = false;
    if (search) filters.search = search;

    const { data, total } = await parkingService.getAllParkingSlots(societyId, pagination, filters);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getParkingSlotByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const slot = await parkingService.getParkingSlotById(req.user!.societyId, req.params.id);
    res.json(slot);
  } catch (err) {
    next(err);
  }
}

export async function createParkingSlotHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const slot = await parkingService.createParkingSlot(req.user!.societyId, req.body);
    res.status(201).json(slot);
  } catch (err) {
    next(err);
  }
}

export async function updateParkingSlotHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const slot = await parkingService.updateParkingSlot(req.user!.societyId, req.params.id, req.body);
    res.json(slot);
  } catch (err) {
    next(err);
  }
}

export async function deleteParkingSlotHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await parkingService.deleteParkingSlot(req.user!.societyId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}