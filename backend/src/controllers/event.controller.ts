import { Request, Response, NextFunction } from 'express';
import * as eventService from '../services/event.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { skip, limit } = getPagination(req);
    const status = req.query.status as string | undefined;
    const result = await eventService.getEvents(skip, limit, { status }, req.user!.societyId);
    res.json(paginatedResponse(result.data, result.total, { skip, limit }));
  } catch (err) { next(err); }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.getEventById(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.createEvent(req.body, req.user!.userId, req.user!.societyId);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.updateEvent(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.deleteEvent(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── Contributions ────────────────────────────────────────────────────────────

export async function bulkAddContributions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.bulkAddContributions(
      req.params.id,
      req.body,
      req.user!.userId,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function importContributions(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.importContributions(
      req.params.id,
      req.body,
      req.user!.userId,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function addContribution(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.addContribution(
      req.params.id,
      req.body,
      (req as any).user.userId,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function deleteContribution(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.deleteContribution(req.params.id, req.params.cid);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── Event Expenses ───────────────────────────────────────────────────────────

export async function addEventExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.addEventExpense(
      req.params.id,
      req.body,
      (req as any).user.userId,
    );
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function deleteEventExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.deleteEventExpense(req.params.id, req.params.eid);
    res.json(data);
  } catch (err) { next(err); }
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function addTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.addTeamMember(req.params.id, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

export async function deleteTeamMember(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await eventService.deleteTeamMember(req.params.id, req.params.mid);
    res.json(data);
  } catch (err) { next(err); }
}