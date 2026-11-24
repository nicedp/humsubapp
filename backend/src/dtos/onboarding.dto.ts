import { z } from 'zod';
import { RESERVED_SOCIETY_URLS } from '../services/onboarding.service';

/**
 * POST /api/v1/onboarding/register (public)
 * Registers a new pending society and emails the setup link.
 */
export const registerSocietySchema = z.object({
  name: z.string().min(3).max(200),
  contactEmail: z.string().email(),
  contactPhone: z.string().min(7).max(20),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  /** Optional preferred slug — if taken, backend auto-deduplicates */
  societyUrl: z
    .string()
    .min(2)
    .max(75)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
    .refine(
      (slug) => !RESERVED_SOCIETY_URLS.has(slug.toLowerCase()),
      { message: 'This URL slug is reserved and cannot be used' }
    )
    .optional(),
});
export type RegisterSocietyDto = z.infer<typeof registerSocietySchema>;

/**
 * POST /api/v1/onboarding/:token/step1
 * Token-gated: save society profile.
 */
export const step1ProfileSchema = z.object({
  name: z.string().min(3).max(200),
  address: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  pincode: z.string().max(10).optional(),
  registrationNumber: z.string().max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().min(7).max(20).optional(),
  // logoUrl handled separately via file upload if provided
  // Optional: admin can customize the society URL slug during setup
  societyUrl: z
    .string()
    .min(2)
    .max(75)
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed')
    .refine(
      (slug) => !RESERVED_SOCIETY_URLS.has(slug.toLowerCase()),
      { message: 'This URL slug is reserved and cannot be used' }
    )
    .optional(),
});
export type Step1ProfileDto = z.infer<typeof step1ProfileSchema>;

/**
 * POST /api/v1/onboarding/:token/step2
 * Token-gated: create admin account; returns JWT.
 */
export const step2AdminSchema = z.object({
  fullName: z.string().min(2).max(200),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
export type Step2AdminDto = z.infer<typeof step2AdminSchema>;

/**
 * POST /api/v1/onboarding/step3 (JWT auth)
 * Save billing configuration to society_settings EAV.
 */
export const step3BillingSchema = z.object({
  ratePerSqft: z.number().min(0).max(1000),
  fixedCharge: z.number().min(0).max(100000),
  lateFeeGraceDays: z.number().int().min(0).max(90),
  lateFeePerDay: z.number().min(0).max(1000),
  billVacantFlats: z.boolean(),
});
export type Step3BillingDto = z.infer<typeof step3BillingSchema>;