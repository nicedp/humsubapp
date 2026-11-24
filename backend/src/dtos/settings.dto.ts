import { z } from 'zod';
import { RESERVED_SOCIETY_URLS as RESERVED_SOCIETY_URL_WORDS } from '../services/onboarding.service';

export const updateSettingsSchema = z.object({
  // ── Billing / Configurations ───────────────────────────────────
  ratePerSqft:      z.number().positive('Rate per sqft must be positive').optional(),
  fixedCharge:      z.number().min(0, 'Fixed charge cannot be negative').optional(),
  lateFeeGraceDays: z.number().int().min(0).optional(),
  lateFeePerDay:    z.number().min(0).optional(),
  billVacantFlats:  z.boolean().optional(),

  // ── Opening Balance ────────────────────────────────────────────
  openingBalance:          z.number().min(0).optional(),
  openingBalanceYearMonth: z.string().nullable().optional(), // "YYYY-MM" or ""

  // ── General / Society Info ─────────────────────────────────────
  societyName: z.string().min(1).optional(),
  address:     z.string().nullable().optional(),
  phone:       z.string().nullable().optional(),
  whatsapp:    z.string().nullable().optional(),
  email:       z.string().email().nullable().optional(),
  websiteUrl:  z.string().nullable().optional(),
  mapLat:      z.string().nullable().optional(),
  mapLng:      z.string().nullable().optional(),

  // ── Bank Details ───────────────────────────────────────────────
  bankName:          z.string().nullable().optional(),
  bankAccountNumber: z.string().nullable().optional(),
  bankIfsc:          z.string().nullable().optional(),
  bankBranch:        z.string().nullable().optional(),
  upiId:             z.string().nullable().optional(),
  upiQrCode:         z.string().nullable().optional(), // base64 data URL

  // ── Display Settings ───────────────────────────────────────────
  paginationLimit: z.number().int().min(5).max(100).optional(),
  theme:           z.enum(['light', 'dark']).optional(),

  // ── Security ───────────────────────────────────────────────────
  require2fa: z.boolean().optional(),

  // ── Society Identity (Society table, not EAV) ──────────────────
  societyUrl: z.string()
    .min(2, 'Society URL must be at least 2 characters')
    .max(75, 'Society URL must be at most 75 characters')
    .regex(/^[a-z0-9-]+$/, 'Society URL can only contain lowercase letters, numbers and hyphens')
    .refine(
      (slug) => !RESERVED_SOCIETY_URL_WORDS.has(slug.toLowerCase()),
      { message: 'This URL slug is reserved and cannot be used' }
    )
    .optional(),
});

export type UpdateSettingsDto = z.infer<typeof updateSettingsSchema>;