import prisma from '../config/db';
import { createError } from '../middleware/error.middleware';
import { UpdateSettingsDto } from '../dtos/settings.dto';

// Typed shape returned by the service — billing helpers and controllers use this
export interface SettingsSnapshot {
  // ── Billing / Configurations ───────────────────────────────────
  ratePerSqft: number;
  fixedCharge: number;
  lateFeeGraceDays: number;
  lateFeePerDay: number;
  billVacantFlats: boolean;

  // ── Opening Balance ────────────────────────────────────────────
  openingBalance: number;
  openingBalanceYearMonth: string;

  // ── General / Society Info ─────────────────────────────────────
  societyName: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  websiteUrl: string | null;
  mapLat: string | null;
  mapLng: string | null;

  // ── Society Identity (from Society table, not EAV) ─────────────
  accountNumber: string | null;  // read-only; format YYYYMMNNN e.g. "2026071001"
  societyUrl: string | null;     // editable slug e.g. "green-valley-apartments"

  // ── Bank Details ───────────────────────────────────────────────
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  upiId: string | null;
  upiQrCode: string | null;

  // ── Display Settings ───────────────────────────────────────────
  paginationLimit: number;
  theme: 'light' | 'dark';

  // ── Security ───────────────────────────────────────────────────
  require2fa: boolean;
}

/** Default values used when a key is missing from the DB */
const DEFAULTS: SettingsSnapshot = {
  ratePerSqft: 1.0,
  fixedCharge: 700.0,
  lateFeeGraceDays: 10,
  lateFeePerDay: 10.0,
  billVacantFlats: false,
  openingBalance: 0,
  openingBalanceYearMonth: '',
  societyName: 'Residential Society',
  address: null,
  phone: null,
  whatsapp: null,
  email: null,
  websiteUrl: null,
  mapLat: null,
  mapLng: null,
  accountNumber: null,
  societyUrl: null,
  bankName: null,
  bankAccountNumber: null,
  bankIfsc: null,
  bankBranch: null,
  upiId: null,
  upiQrCode: null,
  paginationLimit: 20,
  theme: 'light',
  require2fa: false,
};

/** Reads all EAV rows + Society identity fields for the given society */
export async function getSettings(societyId: number = 1): Promise<SettingsSnapshot> {
  // Fetch EAV settings + Society identity fields in parallel
  const [rows, society] = await Promise.all([
    prisma.societySetting.findMany({ where: { societyId } }),
    (prisma as any).society.findUnique({
      where: { id: societyId },
      select: { accountNumber: true, societyUrl: true },
    }),
  ]);
  if (!rows.length) throw createError('Society settings not found', 500);

  const map = Object.fromEntries(rows.map((r) => [r.varName, r.varValue]));

  return {
    // ── Billing ────────────────────────────────────────────────────
    ratePerSqft:      map['rate_per_sqft']       !== undefined ? parseFloat(map['rate_per_sqft'])        : DEFAULTS.ratePerSqft,
    fixedCharge:      map['fixed_charge']         !== undefined ? parseFloat(map['fixed_charge'])         : DEFAULTS.fixedCharge,
    lateFeeGraceDays: map['late_fee_grace_days']  !== undefined ? parseInt(map['late_fee_grace_days'], 10): DEFAULTS.lateFeeGraceDays,
    lateFeePerDay:    map['late_fee_per_day']     !== undefined ? parseFloat(map['late_fee_per_day'])     : DEFAULTS.lateFeePerDay,
    billVacantFlats:  map['bill_vacant_flats']    !== undefined ? map['bill_vacant_flats'] === 'true'     : DEFAULTS.billVacantFlats,

    // ── Opening Balance ────────────────────────────────────────────
    openingBalance:          map['opening_balance']            !== undefined ? parseFloat(map['opening_balance'])           : DEFAULTS.openingBalance,
    openingBalanceYearMonth: map['opening_balance_year_month'] !== undefined ? map['opening_balance_year_month']            : DEFAULTS.openingBalanceYearMonth,

    // ── General ────────────────────────────────────────────────────
    societyName: map['society_name'] ?? DEFAULTS.societyName,
    address:     map['address']      ?? DEFAULTS.address,
    phone:       map['phone']        ?? DEFAULTS.phone,
    whatsapp:    map['whatsapp']     ?? DEFAULTS.whatsapp,
    email:       map['email']        ?? DEFAULTS.email,
    websiteUrl:  map['website_url']  ?? DEFAULTS.websiteUrl,
    mapLat:      map['map_lat']      ?? DEFAULTS.mapLat,
    mapLng:      map['map_lng']      ?? DEFAULTS.mapLng,

    // ── Society Identity (from Society table, not EAV) ─────────────
    accountNumber: society?.accountNumber ?? DEFAULTS.accountNumber,
    societyUrl:    society?.societyUrl    ?? DEFAULTS.societyUrl,

    // ── Bank ───────────────────────────────────────────────────────
    bankName:          map['bank_name']           ?? DEFAULTS.bankName,
    bankAccountNumber: map['bank_account_number'] ?? DEFAULTS.bankAccountNumber,
    bankIfsc:          map['bank_ifsc']           ?? DEFAULTS.bankIfsc,
    bankBranch:        map['bank_branch']         ?? DEFAULTS.bankBranch,
    upiId:             map['upi_id']              ?? DEFAULTS.upiId,
    upiQrCode:         map['upi_qr_code']         ?? DEFAULTS.upiQrCode,

    // ── Display ────────────────────────────────────────────────────
    paginationLimit: map['pagination_limit'] !== undefined ? parseInt(map['pagination_limit'], 10) : DEFAULTS.paginationLimit,
    theme:           (map['theme'] === 'dark' ? 'dark' : 'light') as 'light' | 'dark',

    // ── Security ───────────────────────────────────────────────────
    require2fa: map['require_2fa'] !== undefined ? map['require_2fa'] === 'true' : DEFAULTS.require2fa,
  };
}

/** Upserts only the keys present in the DTO — each EAV setting is one row.
 *  societyUrl is updated on the Society table directly (not EAV).
 *  accountNumber is read-only and always ignored even if sent. */
export async function updateSettings(dto: UpdateSettingsDto, societyId: number = 1): Promise<SettingsSnapshot> {
  const updates: Array<{ varName: string; varValue: string }> = [];

  // ── Billing ──────────────────────────────────────────────────────
  if (dto.ratePerSqft      !== undefined) updates.push({ varName: 'rate_per_sqft',       varValue: String(dto.ratePerSqft) });
  if (dto.fixedCharge      !== undefined) updates.push({ varName: 'fixed_charge',        varValue: String(dto.fixedCharge) });
  if (dto.lateFeeGraceDays !== undefined) updates.push({ varName: 'late_fee_grace_days', varValue: String(dto.lateFeeGraceDays) });
  if (dto.lateFeePerDay    !== undefined) updates.push({ varName: 'late_fee_per_day',    varValue: String(dto.lateFeePerDay) });
  if (dto.billVacantFlats  !== undefined) updates.push({ varName: 'bill_vacant_flats',   varValue: String(dto.billVacantFlats) });

  // ── Opening Balance ───────────────────────────────────────────────
  if (dto.openingBalance          !== undefined) updates.push({ varName: 'opening_balance',            varValue: String(dto.openingBalance) });
  if (dto.openingBalanceYearMonth !== undefined) updates.push({ varName: 'opening_balance_year_month', varValue: dto.openingBalanceYearMonth ?? '' });

  // ── General ──────────────────────────────────────────────────────
  if (dto.societyName !== undefined) updates.push({ varName: 'society_name', varValue: dto.societyName });
  if (dto.address     !== undefined) updates.push({ varName: 'address',      varValue: dto.address ?? '' });
  if (dto.phone       !== undefined) updates.push({ varName: 'phone',        varValue: dto.phone ?? '' });
  if (dto.whatsapp    !== undefined) updates.push({ varName: 'whatsapp',     varValue: dto.whatsapp ?? '' });
  if (dto.email       !== undefined) updates.push({ varName: 'email',        varValue: dto.email ?? '' });
  if (dto.websiteUrl  !== undefined) updates.push({ varName: 'website_url',  varValue: dto.websiteUrl ?? '' });
  if (dto.mapLat      !== undefined) updates.push({ varName: 'map_lat',      varValue: dto.mapLat ?? '' });
  if (dto.mapLng      !== undefined) updates.push({ varName: 'map_lng',      varValue: dto.mapLng ?? '' });

  // ── Bank ─────────────────────────────────────────────────────────
  if (dto.bankName          !== undefined) updates.push({ varName: 'bank_name',           varValue: dto.bankName ?? '' });
  if (dto.bankAccountNumber !== undefined) updates.push({ varName: 'bank_account_number', varValue: dto.bankAccountNumber ?? '' });
  if (dto.bankIfsc          !== undefined) updates.push({ varName: 'bank_ifsc',           varValue: dto.bankIfsc ?? '' });
  if (dto.bankBranch        !== undefined) updates.push({ varName: 'bank_branch',         varValue: dto.bankBranch ?? '' });
  if (dto.upiId             !== undefined) updates.push({ varName: 'upi_id',              varValue: dto.upiId ?? '' });
  if (dto.upiQrCode         !== undefined) updates.push({ varName: 'upi_qr_code',         varValue: dto.upiQrCode ?? '' });

  // ── Display ──────────────────────────────────────────────────────
  if (dto.paginationLimit !== undefined) updates.push({ varName: 'pagination_limit', varValue: String(dto.paginationLimit) });
  if (dto.theme           !== undefined) updates.push({ varName: 'theme',            varValue: dto.theme });

  // ── Security ─────────────────────────────────────────────────────
  if (dto.require2fa !== undefined) updates.push({ varName: 'require_2fa', varValue: String(dto.require2fa) });

  // ── societyUrl — stored on Society table (not EAV); accountNumber is read-only ──
  if (dto.societyUrl !== undefined && dto.societyUrl !== null) {
    // Uniqueness check before updating
    const existing = await (prisma as any).society.findUnique({
      where: { societyUrl: dto.societyUrl },
      select: { id: true },
    });
    if (existing && existing.id !== societyId) {
      throw createError('This society URL is already taken — please choose another', 409);
    }
    await (prisma as any).society.update({
      where: { id: societyId },
      data: { societyUrl: dto.societyUrl },
    });
  }

  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map(({ varName, varValue }) =>
        prisma.societySetting.upsert({
          where: { societyId_varName: { societyId, varName } },
          update: { varValue },
          create: { societyId, varName, varValue },
        })
      )
    );
  }

  return getSettings(societyId);
}

// ─── Generate Account Number ───────────────────────────────────────────────────

/**
 * Generates and persists an accountNumber for the given society — ONLY if it
 * doesn't already have one. Idempotent: calling twice returns the existing value.
 *
 * Format: YYYYMMNNN — counter starts at 1001 within each YYYYMM bucket.
 */
export async function generateSocietyAccountNumber(societyId: number = 1): Promise<string> {
  const society = await (prisma as any).society.findUnique({
    where: { id: societyId },
    select: { accountNumber: true },
  });

  if (!society) throw createError('Society not found', 404);

  // Already has one — return it (no-op)
  if (society.accountNumber) return society.accountNumber as string;

  const date   = new Date();
  const year   = date.getFullYear();
  const month  = String(date.getMonth() + 1).padStart(2, '0');
  const prefix = `${year}${month}`;

  const count   = await (prisma as any).society.count({
    where: { accountNumber: { startsWith: prefix } },
  });
  const counter = 1001 + count;
  const accountNumber = `${prefix}${counter}`;

  await (prisma as any).society.update({
    where: { id: societyId },
    data: { accountNumber },
  });

  return accountNumber;
}