import { Request, Response, NextFunction } from 'express';
import * as visitorService from '../services/visitor.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { createError } from '../middleware/error.middleware';
import { getVisitorsQuerySchema } from '../dtos/visitor.dto';

export async function getMyVisitorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const residentId = req.user!.residentId;
    if (!residentId) throw createError('Resident profile not found for this user', 403);
    const pagination = getPagination(req);
    const { data, total } = await visitorService.getMyVisitors(residentId, pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function logEntryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const loggedBy = req.user!.userId;
    const visitor = await visitorService.logEntry(req.body, loggedBy);
    res.status(201).json(visitor);
  } catch (err) {
    next(err);
  }
}

export async function logExitHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const visitor = await visitorService.logExit(req.params.id, req.body.exitTime);
    res.json(visitor);
  } catch (err) {
    next(err);
  }
}

export async function getVisitorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = getVisitorsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(parsed.error.errors[0].message, 400);
    const { data, total } = await visitorService.getVisitors(parsed.data, req.user!.societyId);
    res.json(paginatedResponse(data, total, { skip: parsed.data.skip, limit: parsed.data.limit }));
  } catch (err) {
    next(err);
  }
}

export async function getVisitorByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const visitor = await visitorService.getVisitorById(req.params.id);
    res.json(visitor);
  } catch (err) {
    next(err);
  }
}

export async function getTodaysVisitorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const { data, total } = await visitorService.getTodaysVisitors(pagination, req.user!.societyId);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getVisitorStatsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo   = req.query.dateTo   as string | undefined;
    const stats = await visitorService.getVisitorStats({ dateFrom, dateTo }, req.user!.societyId);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

export async function exportVisitorsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = getVisitorsQuerySchema.safeParse({ ...req.query, skip: 0, limit: 100 });
    const query  = parsed.success ? parsed.data : {};

    const filename = `visitors-export-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await visitorService.exportVisitorsCSV(query, res);
  } catch (err) {
    next(err);
  }
}