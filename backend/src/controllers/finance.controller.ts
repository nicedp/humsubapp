import { Request, Response, NextFunction } from 'express';
import { getMonthlySummary, getMonthlyReport } from '../services/finance.service';
import { z } from 'zod';

const monthlyReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

export async function getFinanceSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months as string) || 12, 1), 36);
    const data = await getMonthlySummary(months, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function getMonthlyReportHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { month, year } = monthlyReportQuerySchema.parse(req.query);
    const data = await getMonthlyReport(month, year, req.user!.societyId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}