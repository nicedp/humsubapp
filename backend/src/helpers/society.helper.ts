import { Request } from 'express';

/**
 * T12: OWASP A01 — Multi-tenant societyId extraction helper.
 *
 * In the current single-society deployment, societyId is always 1.
 * When multi-society support is added, societyId will come from the JWT payload.
 * This helper centralises that logic so all services can be updated in one place.
 *
 * Usage in controllers:
 *   const societyId = getSocietyId(req);
 *   await someService.doSomething(societyId, ...);
 */
export function getSocietyId(req: Request): number {
  // JWT payload carries societyId once multi-tenancy is fully activated.
  // Falls back to 1 for backwards compatibility in single-society deployments.
  return (req.user as any)?.societyId ?? 1;
}