import { Request, Response, NextFunction } from 'express';
import * as residentService from '../services/resident.service';
import { ResidentFilters } from '../services/resident.service';
import { bulkCreateResidentsSchema, adminChangePasswordSchema } from '../dtos/resident.dto';
import { createError } from '../middleware/error.middleware';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { getSocietyId } from '../helpers/society.helper';

// ─── My Profile Handlers (resident self-service) ──────────────────────────────

export async function getMyProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = (req as unknown as { user: { residentId?: string } }).user?.residentId;
    if (!residentId) return next({ statusCode: 403, message: 'No resident profile linked to this account' });
    const profile = await residentService.getMyProfile(residentId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = (req as unknown as { user: { residentId?: string } }).user?.residentId;
    if (!residentId) return next({ statusCode: 403, message: 'No resident profile linked to this account' });
    const profile = await residentService.updateMyProfile(residentId, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

export async function getMyVehiclesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = (req as unknown as { user: { residentId?: string } }).user?.residentId;
    if (!residentId) return next({ statusCode: 403, message: 'No resident profile linked to this account' });
    const vehicles = await residentService.getVehiclesByResident(residentId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

export async function getAllResidentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const societyId = req.user!.societyId;

    const filters: ResidentFilters = {};
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.residentType === 'owner' || req.query.residentType === 'tenant') filters.residentType = req.query.residentType;
    if (req.query.isActive === 'true') filters.isActive = true;
    if (req.query.isActive === 'false') filters.isActive = false;
    if (req.query.flatId) filters.flatId = req.query.flatId as string;

    const { data, total } = await residentService.getAllResidents(pagination, filters, societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getResidentByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resident = await residentService.getResidentById(req.params.id);
    res.json(resident);
  } catch (err) {
    next(err);
  }
}

export async function createResidentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resident = await residentService.createResident(req.body);
    res.status(201).json(resident);
  } catch (err) {
    next(err);
  }
}

export async function updateResidentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const resident = await residentService.updateResident(req.params.id, req.body);
    res.json(resident);
  } catch (err) {
    next(err);
  }
}

export async function deleteResidentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await residentService.deleteResident(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// ─── Vehicle Handlers ─────────────────────────────────────────────────────────

export async function getVehiclesByResidentHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicles = await residentService.getVehiclesByResident(req.params.residentId);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
}

export async function getVehicleByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await residentService.getVehicleById(req.params.residentId, req.params.vehicleId);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function addVehicleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await residentService.addVehicle(req.params.residentId, req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function updateVehicleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await residentService.updateVehicle(req.params.residentId, req.params.vehicleId, req.body);
    res.json(vehicle);
  } catch (err) {
    next(err);
  }
}

export async function deleteVehicleHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await residentService.deleteVehicle(req.params.residentId, req.params.vehicleId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function bulkCreateResidentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = bulkCreateResidentsSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const result = await residentService.bulkCreateResidents(parsed.data, req.user!.societyId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
// ─── Profile Handler ──────────────────────────────────────────────────────────

export async function getResidentProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await residentService.getResidentProfile(req.params.id, getSocietyId(req));
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

// ─── Admin Change Resident Password Handler ───────────────────────────────────

export async function adminChangeResidentPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = adminChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const result = await residentService.adminChangeResidentPassword(
      req.params.id,
      parsed.data.newPassword,
      parsed.data.notify,
      getSocietyId(req)
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}