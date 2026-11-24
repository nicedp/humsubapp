import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { getPagination, paginatedResponse } from '../helpers/pagination.helper';
import { notifyAdminSchema } from '../dtos/notification.dto';
import { getSocietyId } from '../helpers/society.helper';

export async function getMyNotificationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = getPagination(req);
    const userId = req.user!.userId;
    const { data, total } = await notificationService.getMyNotifications(userId, pagination);
    res.json(paginatedResponse(data, total, pagination));
  } catch (err) {
    next(err);
  }
}

export async function markAsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const notification = await notificationService.markAsRead(req.params.id, userId);
    res.json(notification);
  } catch (err) {
    next(err);
  }
}

export async function markAllAsReadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.markAllAsRead(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCountHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const result = await notificationService.getUnreadCount(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteNotificationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    await notificationService.deleteNotification(req.params.id, userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function notifyAdminHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = notifyAdminSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid request', errors: parsed.error.errors });
      return;
    }
    const result = await notificationService.notifyAdmin(
      parsed.data.message,
      req.user!.userId,
      getSocietyId(req),
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}