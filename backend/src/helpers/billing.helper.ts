import { daysSince } from '../utils/date.utils';

interface BillingSettings {
  ratePerSqft: number;
  fixedCharge: number;
  lateFeeGraceDays: number;
  lateFeePerDay: number;
}

/**
 * Calculates the base maintenance amount for a flat.
 * Formula: (sqFt × ratePerSqft) + fixedCharge
 */
export function calculateMaintenanceAmount(
  sqFt: number,
  settings: Pick<BillingSettings, 'ratePerSqft' | 'fixedCharge'>
): number {
  return sqFt * settings.ratePerSqft + settings.fixedCharge;
}

/**
 * Calculates the dynamic late fee for a bill.
 * Formula: max(0, daysSinceDue - graceDays) × lateFeePerDay
 * Returns 0 if bill is not yet past the grace period.
 */
export function calculateLateFee(
  dueDate: Date,
  settings: Pick<BillingSettings, 'lateFeeGraceDays' | 'lateFeePerDay'>
): number {
  const days = daysSince(dueDate);
  const daysOverGrace = Math.max(0, days - settings.lateFeeGraceDays);
  return daysOverGrace * settings.lateFeePerDay;
}