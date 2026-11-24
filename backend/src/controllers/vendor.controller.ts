import { Request, Response, NextFunction } from 'express';
import * as vendorService from '../services/vendor.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

// ─── Vendors ──────────────────────────────────────────────────────────────────

export async function listVendors(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, limit } = getPagination(req);
    const result = await vendorService.getVendors(skip, limit, req.user!.societyId);
    res.json(paginatedResponse(result.data, result.total, { skip, limit }));
  } catch (err) { next(err); }
}

export async function getVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.getVendorById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.createVendor(req.body, req.user!.societyId);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.updateVendor(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteVendor(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.deleteVendor(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function listContracts(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, limit } = getPagination(req);
    const filters = {
      status: req.query.status as string | undefined,
      dueStatus: req.query.dueStatus as string | undefined,
    };
    const result = await vendorService.getContracts(skip, limit, filters, req.user!.societyId);
    res.json(paginatedResponse(result.data, result.total, { skip, limit }));
  } catch (err) { next(err); }
}

export async function getContract(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.getContractById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createContract(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.createContract(req.body, req.user!.societyId);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateContract(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.updateContract(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteContract(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.deleteContract(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── Service Logs ─────────────────────────────────────────────────────────────

export async function addServiceLog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.addServiceLog(
      req.params.id,
      req.body,
      (req as any).user.userId,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function deleteServiceLog(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await vendorService.deleteServiceLog(req.params.id, req.params.lid);
    res.json(data);
  } catch (err) { next(err); }
}