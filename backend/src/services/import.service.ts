import prisma from '../config/db';
import { hashPassword } from '../utils/hash.utils';
import { createError } from '../middleware/error.middleware';

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export interface ImportRow {
  sr: number;
  flatNumber: string;
  flatSize: number;
  residentName: string;
  phone: string;
  email: string;
  ownerType: 'owner' | 'tenant';
  parkingNumber: string | null; // null = not allotted
  blockName: string;            // optional; empty = fallback to first block / create 'Main Block'
  propertyType: string;         // e.g. 'flat','penthouse','single','duplex','triplex','bungalow'
  floor: number | null;         // null for row houses / ground-level types that don't need floor
}

export interface ImportRowResult {
  sr: number;
  flatNumber: string;
  residentName: string;
  status: 'created' | 'skipped' | 'error';
  reason?: string;
}

export interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: number;
  rows: ImportRowResult[];
}

/** Map PropertyType label (from CSV) to FlatType enum value */
function parsePropertyType(raw: string): string {
  const normalized = (raw ?? '').toLowerCase().replace(/[\s\-_]/g, '');
  const map: Record<string, string> = {
    flat: 'flat',
    apartment: 'flat',
    penthouse: 'penthouse',
    pent: 'penthouse',
    ph: 'penthouse',
    rowhouse: 'single',
    rawhouse: 'single',
    single: 'single',
    plot: 'single',
    duplex: 'duplex',
    triplex: 'triplex',
    bungalow: 'bungalow',
    villa: 'bungalow',
  };
  return map[normalized] ?? 'flat'; // default to 'flat'
}

/** Map Floor label (from CSV) to integer or null.
 *  Accepts: integers, ordinal words (FIRST→1, SECOND→2…), GROUND→0, BASEMENT→-1, empty→null */
function parseFloor(raw: string): number | null {
  const s = (raw ?? '').trim().toLowerCase();
  if (!s || s === '-' || s === 'n/a' || s === 'na' || s === 'none') return null;

  // Word mappings
  const words: Record<string, number> = {
    basement: -1, b: -1,
    ground: 0, g: 0,
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
  };
  if (words[s] !== undefined) return words[s];

  // Ordinal suffix: 1st, 2nd, 3rd, 4th…
  const ordinal = s.match(/^(-?\d+)(st|nd|rd|th)$/);
  if (ordinal) return parseInt(ordinal[1], 10);

  // Plain integer
  const n = parseInt(s, 10);
  if (!isNaN(n)) return n;

  return null; // unrecognised → null
}

/** Parse comma-separated CSV text into rows, skipping header */
export function parseCsv(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) throw createError('CSV file is empty or has no data rows', 400);

  // Skip header line (index 0)
  const dataLines = lines.slice(1);

  return dataLines.map((line, idx) => {
    const parts = line.split(',').map((p) => p.trim());
    if (parts.length < 8) {
      throw createError(
        `Row ${idx + 2}: expected at least 8 columns (Sr,FlatNumber,FlatSize,ResidentName,PhoneNumber,Email,OwnerType,ParkingNumber[,BlockName,PropertyType,Floor]), got ${parts.length}`,
        400,
      );
    }

    const [srStr, flatNumber, flatSizeStr, residentName, phone, email, ownerTypeRaw, parkingRaw, blockNameRaw, propertyTypeRaw, floorRaw] = parts;

    const sr = parseInt(srStr, 10);
    if (isNaN(sr)) throw createError(`Row ${idx + 2}: Sr must be a number, got "${srStr}"`, 400);

    const flatSize = parseFloat(flatSizeStr);
    if (isNaN(flatSize) || flatSize <= 0) throw createError(`Row ${idx + 2}: FlatSize must be a positive number, got "${flatSizeStr}"`, 400);

    if (!flatNumber) throw createError(`Row ${idx + 2}: FlatNumber is required`, 400);
    if (!residentName) throw createError(`Row ${idx + 2}: ResidentName is required`, 400);
    if (!phone) throw createError(`Row ${idx + 2}: PhoneNumber is required`, 400);
    if (!email) throw createError(`Row ${idx + 2}: Email is required`, 400);

    const ownerTypeLower = ownerTypeRaw.toLowerCase();
    if (ownerTypeLower !== 'owner' && ownerTypeLower !== 'tenant') {
      throw createError(`Row ${idx + 2}: OwnerType must be "owner" or "tenant", got "${ownerTypeRaw}"`, 400);
    }

    const parkingNormalized = (parkingRaw ?? '').toLowerCase().trim();
    const parkingNumber =
      parkingNormalized === 'not allotted' || parkingNormalized === '' || parkingNormalized === '-'
        ? null
        : parkingRaw.trim();

    const propertyType = parsePropertyType(propertyTypeRaw ?? '');
    const floor = parseFloor(floorRaw ?? '');

    return {
      sr,
      flatNumber,
      flatSize,
      residentName,
      phone,
      email: email.toLowerCase(),
      ownerType: ownerTypeLower as 'owner' | 'tenant',
      parkingNumber,
      blockName: (blockNameRaw ?? '').trim(),
      propertyType,
      floor,
    };
  });
}

/** Generate a unique username from email prefix */
async function generateUsername(emailPrefix: string, societyId: number, tx: TxClient): Promise<string> {
  // Clean prefix: lowercase, alphanumeric + dot only
  const base = emailPrefix.toLowerCase().replace(/[^a-z0-9.]/g, '').slice(0, 20) || 'resident';
  let candidate = base;
  let suffix = 1;
  while (true) {
    const existing = await tx.user.findUnique({
      where: { societyId_username: { societyId, username: candidate } },
    });
    if (!existing) return candidate;
    candidate = `${base}${suffix++}`;
  }
}

/** Resolve or create a block for the import row.
 *  Priority: named block → first existing block → create 'Main Block'
 *  Uses (prisma as any).block — stale Prisma types until prisma generate runs in container */
async function resolveBlockId(blockName: string, societyId: number): Promise<string | null> {
  const db = prisma as any;

  // 1. Named block provided — look it up (case-insensitive)
  if (blockName) {
    const found = await db.block.findFirst({
      where: { societyId, name: { equals: blockName, mode: 'insensitive' } },
    });
    if (found) return found.id;
    // Named block not found — fall through to fallback
  }

  // 2. No name (or unmatched name) — use first existing block
  const firstBlock = await db.block.findFirst({
    where: { societyId },
    orderBy: { createdAt: 'asc' },
  });
  if (firstBlock) return firstBlock.id;

  // 3. No blocks at all — create 'Main Block'
  const mainBlock = await db.block.create({
    data: {
      societyId,
      name: 'Main Block',
      blockType: 'flats',
    },
  });
  return mainBlock.id;
}

/** Import residents from parsed CSV rows */
export async function importResidents(rows: ImportRow[], societyId: number = 1): Promise<ImportResult> {
  const result: ImportResult = { total: rows.length, created: 0, skipped: 0, errors: 0, rows: [] };

  // Resolve blocks per unique blockName upfront (cache to avoid repeated DB calls per row)
  const blockCache = new Map<string, string | null>();

  for (const row of rows) {
    try {
      // Check for duplicate email — skip if already imported
      const existingResident = await prisma.resident.findUnique({ where: { email: row.email } });
      if (existingResident) {
        result.skipped++;
        result.rows.push({
          sr: row.sr,
          flatNumber: row.flatNumber,
          residentName: row.residentName,
          status: 'skipped',
          reason: 'Email already exists',
        });
        continue;
      }

      // Use explicit propertyType + floor from CSV (no more pattern inference)
      const flatType = row.propertyType;
      const floor = row.floor;

      // Resolve blockId (cached per blockName key)
      const cacheKey = row.blockName.toLowerCase();
      if (!blockCache.has(cacheKey)) {
        blockCache.set(cacheKey, await resolveBlockId(row.blockName, societyId));
      }
      const blockId = blockCache.get(cacheKey) ?? null;

      await prisma.$transaction(async (tx: TxClient) => {
        // Upsert flat: create if missing, update sqFt if exists
        const existingFlat = await tx.flat.findUnique({
          where: { societyId_flatNumber: { societyId, flatNumber: row.flatNumber } },
        });

        let flat;
        if (existingFlat) {
          flat = await tx.flat.update({
            where: { id: existingFlat.id },
            data: { sqFt: row.flatSize, ...(blockId ? { blockId } : {}) },
          });
        } else {
          flat = await tx.flat.create({
            data: {
              societyId,
              flatNumber: row.flatNumber,
              ...(floor !== null ? { floor } : {}),
              type: flatType,
              sqFt: row.flatSize,
              status: 'occupied',
              ...(blockId ? { blockId } : {}),
            } as any,
          });
        }

        // Generate unique username from email prefix
        const emailPrefix = row.email.split('@')[0];
        const username = await generateUsername(emailPrefix, societyId, tx);

        // Default password = phone number (admin should inform residents)
        const passwordHash = await hashPassword(row.phone);

        // Create resident record
        const resident = await tx.resident.create({
          data: {
            name: row.residentName,
            email: row.email,
            phone: row.phone,
            flatId: flat.id,
            residentType: row.ownerType,
            moveInDate: new Date(),
          },
        });

        // Create user account linked to resident
        await tx.user.create({
          data: {
            societyId,
            username,
            passwordHash,
            role: row.ownerType === 'owner' ? 'owner' : 'tenant',
            residentId: resident.id,
          },
        });

        // Mark flat as occupied
        await tx.flat.update({
          where: { id: flat.id },
          data: { status: 'occupied' },
        });

        // Link parking slot if provided — silently skip if slot not found
        if (row.parkingNumber) {
          const parkingSlot = await tx.parkingSlot.findUnique({
            where: { societyId_slotNumber: { societyId, slotNumber: row.parkingNumber } },
          });
          if (parkingSlot) {
            await tx.parkingSlot.update({
              where: { id: parkingSlot.id },
              data: { flatId: flat.id, isOccupied: true },
            });
          }
        }
      });

      result.created++;
      result.rows.push({
        sr: row.sr,
        flatNumber: row.flatNumber,
        residentName: row.residentName,
        status: 'created',
      });
    } catch (err: unknown) {
      result.errors++;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.rows.push({
        sr: row.sr,
        flatNumber: row.flatNumber,
        residentName: row.residentName,
        status: 'error',
        reason: msg,
      });
    }
  }

  return result;
}