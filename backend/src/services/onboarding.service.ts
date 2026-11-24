import crypto from 'crypto';
import prisma from '../config/db';
import { hashPassword } from '../utils/hash.utils';
import { signAccessToken } from '../utils/jwt.utils';
import { sendSetupInvite } from '../utils/email.utils';
import { createError } from '../middleware/error.middleware';
import {
  RegisterSocietyDto,
  Step1ProfileDto,
  Step2AdminDto,
  Step3BillingDto,
} from '../dtos/onboarding.dto';

// ─── Society URL + Account Number helpers ─────────────────────────────────────

/**
 * Generates a URL-safe slug from a society name.
 * "Green Valley Apartments (Phase 2)" → "green-valley-apartments-phase-2"
 * If the slug is already taken, appends "-2", "-3", etc.
 */
async function generateSocietyUrl(name: string): Promise<string> {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  let candidate = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await (prisma as any).society.findUnique({
      where: { societyUrl: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix++;
  }
}

/**
 * Generates a unique account number in the format YYYYMMNNN.
 * The NNN counter starts at 1001 within each YYYYMM bucket.
 * e.g. first society in Jul 2026 → "2026071001", second → "2026071002"
 */
async function generateAccountNumber(date: Date): Promise<string> {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}${month}`;

  // Count existing societies whose accountNumber starts with this YYYYMM prefix
  const count = await (prisma as any).society.count({
    where: { accountNumber: { startsWith: prefix } },
  });

  const counter = 1001 + count; // starts at 1001
  return `${prefix}${counter}`;
}

// ─── Reserved URL slugs ───────────────────────────────────────────────────────

/**
 * Slugs that cannot be used as society URLs because they conflict with
 * system-level routes, well-known paths, or could cause confusion.
 */
export const RESERVED_SOCIETY_URLS = new Set([
  // System routes / app paths
  'admin', 'superadmin', 'root', 'system', 'portal',
  'login', 'logout', 'register', 'signup', 'signin',
  'account', 'accounts', 'setup', 'onboarding', 'activate',
  'dashboard', 'settings', 'profile', 'security',
  // Device / platform routes
  'mobile', 'm', 'tablet', 'app', 'web', 'pwa',
  // API / infra
  'api', 'v1', 'v2', 'v3', 'graphql', 'webhooks', 'health',
  'static', 'assets', 'uploads', 'cdn', 'media', 'files',
  // Common reserved slugs
  'help', 'support', 'docs', 'documentation', 'blog',
  'about', 'contact', 'terms', 'privacy', 'legal',
  'test', 'demo', 'sandbox', 'staging', 'prod', 'production',
  'null', 'undefined', 'admin-panel', 'control-panel',
  'society', 'societies', 'user', 'users',
  'new', 'create', 'delete', 'update', 'edit',
]);

// ─── Check URL availability ───────────────────────────────────────────────────

/**
 * Returns true if the given slug is available (not reserved + not taken).
 * Used by the registration page to show green/red availability indicator.
 */
export async function checkSocietyUrlAvailable(slug: string): Promise<boolean> {
  if (!slug || slug.length < 2) return false;
  // Check reserved words first (fast, no DB query needed)
  if (RESERVED_SOCIETY_URLS.has(slug.toLowerCase())) return false;
  const existing = await (prisma as any).society.findUnique({
    where: { societyUrl: slug },
    select: { id: true },
  });
  return !existing;
}

// ─── Default seeds for new societies ──────────────────────────────────────────

const DEFAULT_SETTINGS = (societyId: number, name: string, address: string) => [
  { societyId, varName: 'rate_per_sqft',       varValue: '1.0' },
  { societyId, varName: 'fixed_charge',         varValue: '700.0' },
  { societyId, varName: 'late_fee_grace_days',  varValue: '10' },
  { societyId, varName: 'late_fee_per_day',     varValue: '10.0' },
  { societyId, varName: 'society_name',         varValue: name },
  { societyId, varName: 'address',              varValue: address },
  { societyId, varName: 'bill_vacant_flats',    varValue: 'false' },
  { societyId, varName: 'require_2fa',          varValue: 'false' },
  { societyId, varName: 'bank_name',            varValue: '' },
  { societyId, varName: 'bank_account_number',  varValue: '' },
  { societyId, varName: 'bank_ifsc',            varValue: '' },
  { societyId, varName: 'upi_id',               varValue: '' },
];

const DEFAULT_EXPENSE_CATEGORIES = (societyId: number) => [
  { societyId, slug: 'maintenance', name: 'Maintenance', color: '#8884d8', sortOrder: 1 },
  { societyId, slug: 'utility',     name: 'Utility',     color: '#82ca9d', sortOrder: 2 },
  { societyId, slug: 'salary',      name: 'Salary',      color: '#ffc658', sortOrder: 3 },
  { societyId, slug: 'repair',      name: 'Repair',      color: '#ff7300', sortOrder: 4 },
  { societyId, slug: 'admin',       name: 'Admin',       color: '#0088fe', sortOrder: 5 },
  { societyId, slug: 'other',       name: 'Other',       color: '#a4a4a4', sortOrder: 6 },
];

// ─── Register Society ──────────────────────────────────────────────────────────

/**
 * Creates a new pending society, seeds default settings + expense categories,
 * creates an OnboardingSession at step 1, then emails the setup link.
 */
export async function registerSociety(dto: RegisterSocietyDto): Promise<{ societyId: number; setupToken: string }> {
  const setupToken = crypto.randomBytes(32).toString('hex');
  const setupTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  // If admin provided a preferred slug, check availability; otherwise auto-generate
  let societyUrl: string;
  if (dto.societyUrl) {
    const taken = await (prisma as any).society.findUnique({
      where: { societyUrl: dto.societyUrl },
      select: { id: true },
    });
    if (taken) {
      // Preferred slug is taken — fall back to auto-deduplicated generation
      societyUrl = await generateSocietyUrl(dto.societyUrl);
    } else {
      societyUrl = dto.societyUrl;
    }
  } else {
    societyUrl = await generateSocietyUrl(dto.name);
  }
  const accountNumber = await generateAccountNumber(new Date());

  // Create society in 'pending' status — DB unique constraint on contactEmail enforces dedup
  let society: any;
  try {
    society = await (prisma as any).society.create({
      data: {
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        city: dto.city ?? null,
        state: dto.state ?? null,
        status: 'pending',
        setupToken,
        setupTokenExpiry,
        societyUrl,
        accountNumber,
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2002' && err?.meta?.target?.includes('contactEmail')) {
      throw createError('A society is already registered with this email address', 409);
    }
    throw err;
  }

  // Seed default settings + expense categories in parallel
  const settings = DEFAULT_SETTINGS(society.id, dto.name, '');
  await Promise.all([
    ...settings.map((s) =>
      prisma.societySetting.upsert({
        where: { societyId_varName: { societyId: society.id, varName: s.varName } },
        update: {},
        create: s,
      })
    ),
    (prisma as any).expenseCategory.createMany({
      data: DEFAULT_EXPENSE_CATEGORIES(society.id).map((c) => ({
        ...c,
        isDefault: true,
        isActive: true,
      })),
      skipDuplicates: true,
    }),
  ]);

  // Create OnboardingSession at step 1
  await (prisma as any).onboardingSession.create({
    data: {
      societyId: society.id,
      currentStep: 1,
    },
  });

  // Send setup invite email (console stub if SMTP not configured)
  await sendSetupInvite(dto.contactEmail, setupToken, dto.name);

  return { societyId: society.id, setupToken };
}

// ─── Validate Token ────────────────────────────────────────────────────────────

/**
 * Validates the setup token and returns the society + session state.
 * Called on every wizard page load to allow resuming after browser close.
 */
export async function validateToken(token: string): Promise<{
  society: any;
  session: any;
}> {
  const society = await (prisma as any).society.findUnique({
    where: { setupToken: token },
  });

  if (!society) {
    throw createError('Invalid or expired setup link', 400);
  }

  if (society.setupTokenExpiry && new Date() > new Date(society.setupTokenExpiry)) {
    throw createError('Setup link has expired — please register again', 400);
  }

  if (society.status === 'active') {
    throw createError('This society has already been activated', 400);
  }

  const session = await (prisma as any).onboardingSession.findUnique({
    where: { societyId: society.id },
  });

  return { society, session };
}

// ─── Step 1: Society Profile ───────────────────────────────────────────────────

export async function saveStep1(token: string, dto: Step1ProfileDto): Promise<void> {
  const { society } = await validateToken(token);

  try {
    await (prisma as any).society.update({
      where: { id: society.id },
      data: {
        name: dto.name,
        address: dto.address ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        pincode: dto.pincode ?? null,
        registrationNumber: dto.registrationNumber ?? null,
        contactEmail: dto.contactEmail ?? society.contactEmail,
        contactPhone: dto.contactPhone ?? society.contactPhone,
        status: 'setup',
      },
    });
  } catch (err: any) {
    if (err?.code === 'P2002' && err?.meta?.target?.includes('contactEmail')) {
      throw createError('Another society is already registered with this email address', 409);
    }
    throw err;
  }

  // Update society_name + address in EAV settings
  await Promise.all([
    prisma.societySetting.upsert({
      where: { societyId_varName: { societyId: society.id, varName: 'society_name' } },
      update: { varValue: dto.name },
      create: { societyId: society.id, varName: 'society_name', varValue: dto.name },
    }),
    prisma.societySetting.upsert({
      where: { societyId_varName: { societyId: society.id, varName: 'address' } },
      update: { varValue: dto.address ?? '' },
      create: { societyId: society.id, varName: 'address', varValue: dto.address ?? '' },
    }),
  ]);

  await (prisma as any).onboardingSession.update({
    where: { societyId: society.id },
    data: {
      currentStep: 2,
      step1Data: {
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        registrationNumber: dto.registrationNumber,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
      },
    },
  });
}

// ─── Step 2: Admin Account ─────────────────────────────────────────────────────

/**
 * Creates the first admin user for the new society and issues a full JWT.
 * Password is NEVER stored in the session — only username.
 */
export async function saveStep2(
  token: string,
  dto: Step2AdminDto
): Promise<{
  token: string;
  user: { id: string; username: string; role: string; residentId: null; staffId: null };
}> {
  const { society } = await validateToken(token);

  // Check username uniqueness within this society (compound unique key)
  const existingUser = await (prisma as any).user.findUnique({
    where: { societyId_username: { societyId: society.id, username: dto.username } },
  });
  if (existingUser) {
    throw createError('Username is already taken in this society', 409);
  }

  const passwordHash = await hashPassword(dto.password);

  const user = await (prisma as any).user.create({
    data: {
      societyId: society.id,
      username: dto.username,
      passwordHash,
      role: 'admin',
      isActive: true,
    },
  });

  // Update session — store username ONLY (no password)
  await (prisma as any).onboardingSession.update({
    where: { societyId: society.id },
    data: {
      currentStep: 3,
      step2Data: { username: dto.username },
    },
  });

  // Issue full JWT — wizard Steps 3-7 use standard JWT auth
  const accessToken = signAccessToken({
    userId: user.id,
    societyId: society.id,
    role: user.role,
    residentId: null,
    staffId: null,
  });

  return {
    token: accessToken,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      residentId: null,
      staffId: null,
    },
  };
}

// ─── Step 3: Billing Config ────────────────────────────────────────────────────

export async function saveStep3(societyId: number, dto: Step3BillingDto): Promise<void> {
  const settingPairs = [
    { varName: 'rate_per_sqft',       varValue: String(dto.ratePerSqft) },
    { varName: 'fixed_charge',        varValue: String(dto.fixedCharge) },
    { varName: 'late_fee_grace_days', varValue: String(dto.lateFeeGraceDays) },
    { varName: 'late_fee_per_day',    varValue: String(dto.lateFeePerDay) },
    { varName: 'bill_vacant_flats',   varValue: String(dto.billVacantFlats) },
  ];

  await Promise.all(
    settingPairs.map((s) =>
      prisma.societySetting.upsert({
        where: { societyId_varName: { societyId, varName: s.varName } },
        update: { varValue: s.varValue },
        create: { societyId, varName: s.varName, varValue: s.varValue },
      })
    )
  );

  await (prisma as any).onboardingSession.update({
    where: { societyId },
    data: {
      currentStep: 4,
      step3Data: {
        ratePerSqft: dto.ratePerSqft,
        fixedCharge: dto.fixedCharge,
        lateFeeGraceDays: dto.lateFeeGraceDays,
        lateFeePerDay: dto.lateFeePerDay,
        billVacantFlats: dto.billVacantFlats,
      },
    },
  });
}

// ─── Get Progress ──────────────────────────────────────────────────────────────

export async function getProgress(societyId: number): Promise<{
  society: any;
  session: any;
}> {
  const [society, session] = await Promise.all([
    (prisma as any).society.findUnique({ where: { id: societyId } }),
    (prisma as any).onboardingSession.findUnique({ where: { societyId } }),
  ]);

  if (!society) throw createError('Society not found', 404);

  return { society, session };
}

// ─── Find Account (public lookup) ─────────────────────────────────────────────

export interface SocietyLookupResult {
  id: number;
  name: string;
  city: string | null;
  state: string | null;
  accountNumber: string; // partially masked
  societyUrl: string | null;
  status: string;
}

/**
 * Partially masks account number for display on the lookup page.
 * "2026071001" → "2026**1001"  (first 4 chars + ** + last 4 chars)
 */
function maskAccountNumber(acct: string | null): string {
  if (!acct || acct.length < 6) return acct ?? '';
  const head = acct.slice(0, 4);
  const tail = acct.slice(-4);
  return `${head}**${tail}`;
}

/**
 * Public endpoint — searches active/setup societies by name (partial),
 * contactEmail (exact), or contactPhone (partial). Returns max 10 results.
 * The accountNumber is masked — user must contact admin for the full number.
 */
export async function findAccount(query: string): Promise<SocietyLookupResult[]> {
  const q = query.trim();
  if (q.length < 2) throw createError('Search query must be at least 2 characters', 400);

  const societies = await (prisma as any).society.findMany({
    where: {
      status: { in: ['active', 'setup'] },
      accountNumber: { not: null },
      OR: [
        { name:         { contains: q, mode: 'insensitive' } },
        { contactEmail: { equals:   q, mode: 'insensitive' } },
        { contactPhone: { contains: q } },
      ],
    },
    select: {
      id:            true,
      name:          true,
      city:          true,
      state:         true,
      accountNumber: true,
      societyUrl:    true,
      status:        true,
    },
    take: 10,
    orderBy: { name: 'asc' },
  });

  return societies.map((s: any): SocietyLookupResult => ({
    id:            s.id,
    name:          s.name,
    city:          s.city,
    state:         s.state,
    accountNumber: maskAccountNumber(s.accountNumber),
    societyUrl:    s.societyUrl,
    status:        s.status,
  }));
}

// ─── Activate Society ──────────────────────────────────────────────────────────

/**
 * Marks the society as 'active', clears the setup token, records activatedAt.
 * Called after wizard Step 7 Review + Activate.
 */
export async function activateSociety(societyId: number): Promise<void> {
  const society = await (prisma as any).society.findUnique({ where: { id: societyId } });
  if (!society) throw createError('Society not found', 404);

  await (prisma as any).society.update({
    where: { id: societyId },
    data: {
      status: 'active',
      setupToken: null,
      setupTokenExpiry: null,
      activatedAt: new Date(),
    },
  });

  // Mark session as completed
  await (prisma as any).onboardingSession.update({
    where: { societyId },
    data: {
      currentStep: 7,
      completedAt: new Date(),
    },
  });
}