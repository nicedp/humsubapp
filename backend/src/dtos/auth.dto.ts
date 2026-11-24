import { z } from 'zod';

/**
 * Login schema — two mutually exclusive paths:
 *
 * Path A (standard): accountNumber + username + password
 *   → Used by all users (admin, residents, security)
 *
 * Path B (admin email): identifier (email or phone) + password
 *   → Used by society admin only, without needing account number
 *   → Looks up society by Society.contactEmail or Society.contactPhone
 */
export const loginSchema = z
  .object({
    accountNumber: z.string().optional(),
    username: z.string().optional(),
    /** Email or phone used during society registration (admin-only path) */
    identifier: z.string().optional(),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    const hasStandard = data.accountNumber && data.username;
    const hasIdentifier = !!data.identifier;
    if (!hasStandard && !hasIdentifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either (accountNumber + username) or a registration email/phone',
        path: ['accountNumber'],
      });
    }
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const verifyTotpSchema = z.object({
  /** The short-lived temp token issued by the login endpoint when 2FA is required */
  tempToken: z.string().min(1, 'Temp token is required'),
  /** 6-digit TOTP code from authenticator app, or 9-char backup code (XXXX-XXXX) */
  code: z.string().min(6, 'TOTP code is required'),
  /** Passed through from the original login request to issue a long-lived token */
  rememberMe: z.boolean().optional().default(false),
});

export const setupTotpSchema = z.object({
  /** The TOTP code from the authenticator app — confirms the user has scanned the QR */
  code: z.string().length(6, 'TOTP code must be 6 digits'),
});

export const disableTotpSchema = z.object({
  /** Current TOTP code required to confirm disable action */
  code: z.string().min(6, 'TOTP code is required'),
});

export type LoginDto = z.infer<typeof loginSchema> & {
  accountNumber?: string;
  username?: string;
  identifier?: string;
};
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;
export type VerifyTotpDto = z.infer<typeof verifyTotpSchema>;
export type SetupTotpDto = z.infer<typeof setupTotpSchema>;
export type DisableTotpDto = z.infer<typeof disableTotpSchema>;