import { Request, Response, NextFunction } from 'express';
import * as settingsService from '../services/settings.service';

export async function getSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.getSettings(req.user!.societyId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettingsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await settingsService.updateSettings(req.body, req.user!.societyId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function generateAccountNumberHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const accountNumber = await settingsService.generateSocietyAccountNumber(req.user!.societyId);
    res.json({ accountNumber });
  } catch (err) {
    next(err);
  }
}