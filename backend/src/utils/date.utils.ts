/**
 * Returns the number of calendar days between two dates (always >= 0).
 * Returns 0 if `date` is today or in the future.
 */
export function daysSince(date: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (diffMs <= 0) return 0;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats month/year as "YYYY-MM" string for display/grouping.
 */
export function formatMonthYear(month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Returns the due date for a bill: the `dueDayOfMonth` of the given month/year.
 * Defaults to the 10th of the month.
 */
export function getBillDueDate(month: number, year: number, dueDayOfMonth = 10): Date {
  return new Date(year, month - 1, dueDayOfMonth);
}