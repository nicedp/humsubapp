import { Request, Response, NextFunction } from 'express';
import * as noticeService from '../services/notice.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';

export async function getAllNoticesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = req.user!.societyId;
    const pagination = getPagination(req);
    const activeOnly = req.user?.role !== 'admin';
    const { data, total } = await noticeService.getAllNotices(societyId, pagination, activeOnly);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function getNoticeByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notice = await noticeService.getNoticeById(req.user!.societyId, req.params.id);
    res.json(notice);
  } catch (err) {
    next(err);
  }
}

export async function createNoticeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const postedBy = req.user!.userId;
    const notice = await noticeService.createNotice(req.user!.societyId, req.body, postedBy);
    res.status(201).json(notice);
  } catch (err) {
    next(err);
  }
}

export async function updateNoticeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const notice = await noticeService.updateNotice(req.user!.societyId, req.params.id, req.body);
    res.json(notice);
  } catch (err) {
    next(err);
  }
}

export async function deleteNoticeHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await noticeService.deleteNotice(req.user!.societyId, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}