import { Request, Response, NextFunction } from 'express';
import * as onboardingService from '../services/onboarding.service';
import { transformSociety, transformSession } from '../transformers/onboarding.transformer';
import { getSocietyId } from '../helpers/society.helper';

export async function checkSocietyUrl(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = String(req.query.slug ?? '').toLowerCase().trim();
    if (!slug || slug.length < 2) {
      return res.json({ available: false });
    }
    const available = await onboardingService.checkSocietyUrlAvailable(slug);
    res.json({ available });
  } catch (err) {
    return next(err);
  }
}

export async function registerSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await onboardingService.registerSociety(req.body);
    // In dev mode (no SMTP configured), expose setupUrl so the UI can navigate directly
    const devSetupUrl = !process.env.SMTP_HOST
      ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/setup/${result.setupToken}`
      : undefined;
    res.status(201).json({
      message: 'Society registered! Check your email for the setup link.',
      societyId: result.societyId,
      ...(devSetupUrl ? { setupUrl: devSetupUrl } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function validateToken(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const { society, session } = await onboardingService.validateToken(token);
    res.json({
      society: transformSociety(society),
      session: session ? transformSession(session) : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveStep1(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    await onboardingService.saveStep1(token, req.body);
    res.json({ message: 'Society profile saved. Proceed to Step 2.' });
  } catch (err) {
    next(err);
  }
}

export async function saveStep2(req: Request, res: Response, next: NextFunction) {
  try {
    const { token } = req.params;
    const result = await onboardingService.saveStep2(token, req.body);
    res.status(201).json({
      message: 'Admin account created. Use the token for the remaining steps.',
      token: result.token,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function saveStep3(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = getSocietyId(req);
    await onboardingService.saveStep3(societyId, req.body);
    res.json({ message: 'Billing configuration saved. Proceed to Step 4.' });
  } catch (err) {
    next(err);
  }
}

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = getSocietyId(req);
    const { society, session } = await onboardingService.getProgress(societyId);
    res.json({
      society: transformSociety(society),
      session: session ? transformSession(session) : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function activateSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const societyId = getSocietyId(req);
    await onboardingService.activateSociety(societyId);
    res.json({ message: '🎉 Society activated! Welcome to the portal.' });
  } catch (err) {
    next(err);
  }
}

export async function findAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const q = String(req.query.q ?? '').trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }
    const results = await onboardingService.findAccount(q);
    res.json({ results });
  } catch (err) {
    return next(err);
  }
}