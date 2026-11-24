import { Request, Response, NextFunction } from 'express';
import { getAlertSummary } from '../services/alert.service';
import { getSocietyId } from '../helpers/society.helper';

export async function getAlertSummaryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = getSocietyId(req);
    const adminUserId = req.user!.userId;
    const summary = await getAlertSummary(societyId, adminUserId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
}