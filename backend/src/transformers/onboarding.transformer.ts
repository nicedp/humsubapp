/**
 * Onboarding transformer — strips sensitive fields (setupToken, setupTokenExpiry)
 * and shapes session progress for API responses.
 */

export interface SocietyPublic {
  id: number;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  address: string | null;
  registrationNumber: string | null;
  logoUrl: string | null;
  status: string;
  activatedAt: string | null;
}

export interface SessionProgress {
  id: string;
  societyId: number;
  currentStep: number;
  step1Data: Record<string, unknown> | null;
  step2Data: Record<string, unknown> | null;  // username only — no password
  step3Data: Record<string, unknown> | null;
  completedAt: string | null;
}

export function transformSociety(society: any): SocietyPublic {
  return {
    id: society.id,
    name: society.name,
    contactEmail: society.contactEmail ?? null,
    contactPhone: society.contactPhone ?? null,
    city: society.city ?? null,
    state: society.state ?? null,
    pincode: society.pincode ?? null,
    address: society.address ?? null,
    registrationNumber: society.registrationNumber ?? null,
    logoUrl: society.logoUrl ?? null,
    status: society.status,
    activatedAt: society.activatedAt ? new Date(society.activatedAt).toISOString() : null,
    // setupToken and setupTokenExpiry are intentionally stripped
  };
}

export function transformSession(session: any): SessionProgress {
  return {
    id: session.id,
    societyId: session.societyId,
    currentStep: session.currentStep,
    step1Data: session.step1Data ?? null,
    step2Data: session.step2Data ?? null,
    step3Data: session.step3Data ?? null,
    completedAt: session.completedAt ? new Date(session.completedAt).toISOString() : null,
  };
}