import { Request, Response, NextFunction } from 'express';
import { parseCsv, importResidents } from '../services/import.service';
import { createError } from '../middleware/error.middleware';

export async function importResidentsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) throw createError('No CSV file uploaded', 400);

    const text = file.buffer.toString('utf-8');
    const rows = parseCsv(text);

    if (rows.length === 0) throw createError('CSV has no data rows', 400);

    const result = await importResidents(rows, req.user!.societyId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}