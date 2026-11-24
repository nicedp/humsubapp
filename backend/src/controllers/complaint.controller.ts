import { Request, Response, NextFunction } from 'express';
import * as complaintService from '../services/complaint.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllComplaintsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const flatId = req.query.flatId as string | undefined;
    const status = req.query.status as string | undefined;
    const { data, total } = await complaintService.getAllComplaints(flatId, status, pagination, req.user!.societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getComplaintByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    // OWASP A01: Pass residentId for non-admin callers — service enforces flat ownership check
    const residentId = req.user!.role !== 'admin' ? req.user!.residentId ?? undefined : undefined;
    const complaint = await complaintService.getComplaintById(req.params.id, residentId);
    res.json(complaint);
  } catch (err) {
    next(err);
  }
}

export async function createComplaintHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const raisedBy = req.user!.userId;
    const residentId = req.user!.residentId;

    // OWASP A01: Always resolve flatId from resident's JWT-linked profile — NEVER trust body flatId for residents
    let enforcedFlatId: string | undefined;
    if (residentId) {
      const resident = await (await import('../config/db')).default.resident.findUnique({
        where: { id: residentId },
        select: { flatId: true },
      });
      if (!resident) {
        res.status(403).json({ message: 'Resident profile not found' });
        return;
      }
      enforcedFlatId = resident.flatId;
    }

    if (!enforcedFlatId && !req.body.flatId) {
      res.status(400).json({ message: 'flatId is required' });
      return;
    }

    const complaint = await complaintService.createComplaint(req.body, raisedBy, enforcedFlatId);
    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const complaint = await complaintService.updateComplaint(req.params.id, req.body);
    res.json(complaint);
  } catch (err) {
    next(err);
  }
}

export async function getMyComplaintsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const residentId = req.user!.residentId;
    if (!residentId) {
      res.status(403).json({ message: 'Not a resident account' });
      return;
    }
    const { data, total } = await complaintService.getMyComplaints(residentId, pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}