import { BulkFlatPayload } from '../../../api/flats'
import { PropertyType } from '../../../types'

// Unit types available in bulk setup (no penthouse — added individually)
export const BULK_PROPERTY_TYPES: PropertyType[] = ['flat', 'single', 'duplex', 'triplex', 'bungalow']

// Re-export from labels.ts so consumers can import from one place
export { BULK_PROPERTY_TYPE_LABELS } from '../../../constants/labels'

// Types that require a floor number
export const FLOOR_REQUIRED = new Set(['flat'])

export interface UnitTemplate {
  id: string           // local key for React
  suffix: string       // zero-padded: '01', '02', …
  type: PropertyType
  sqFt: string         // string so form input works; parsed to number on generate
}

export interface BulkSetupConfig {
  blockId: string
  blockName: string    // used as prefix, e.g. "A"
  customPrefix: string // override if set; falls back to blockName
  noPrefix: boolean    // when true, flat numbers are just "{floor}{suffix}" e.g. "101"
  fromFloor: number
  toFloor: number
  unitStartNumber: number  // starting unit number per floor (default 1 → suffix "01")
  units: UnitTemplate[]
}

/** Pad a number to at least 2 digits: 1 → '01', 10 → '10' */
export function padFloor(n: number): string {
  return String(n).padStart(2, '0')
}

/** Build the flat number.
 *  With prefix:    "{prefix}-{floor}{unitSuffix}" → "A-101"
 *  Without prefix: "{floor}{unitSuffix}"           → "101"
 */
export function buildFlatNumber(prefix: string, floor: number, suffix: string, noPrefix: boolean): string {
  if (noPrefix) return `${floor}${suffix}`
  return `${prefix}-${floor}${suffix}`
}

/**
 * Compute the effective suffix for a unit given the unitStartNumber.
 *
 * If the suffix is a plain numeric string (e.g. "01", "02"), we shift it so
 * the first unit becomes unitStartNumber. If it's non-numeric (e.g. "A"), leave as-is.
 */
export function computeEffectiveSuffix(
  suffix: string,
  unitIdx: number,
  unitStartNumber: number,
): string {
  const raw = suffix.trim()
  const asNum = parseInt(raw, 10)
  if (isNaN(asNum)) return raw  // non-numeric suffix → keep as-is

  const shiftedNum = unitStartNumber + unitIdx
  const width = Math.max(2, String(shiftedNum).length)
  return String(shiftedNum).padStart(width, '0')
}

/** Generate the full list of BulkFlatPayload objects from the config */
export function generateFlats(config: BulkSetupConfig): BulkFlatPayload[] {
  const prefix = config.customPrefix.trim() || config.blockName.trim()
  const flats: BulkFlatPayload[] = []

  for (let floor = config.fromFloor; floor <= config.toFloor; floor++) {
    let validIdx = 0
    for (const unit of config.units) {
      const sqFtNum = parseFloat(unit.sqFt)
      if (!unit.suffix.trim() || isNaN(sqFtNum) || sqFtNum <= 0) continue

      const effectiveSuffix = computeEffectiveSuffix(unit.suffix, validIdx, config.unitStartNumber)
      const needsFloor = FLOOR_REQUIRED.has(unit.type)
      flats.push({
        flatNumber: buildFlatNumber(prefix, floor, effectiveSuffix, config.noPrefix),
        blockId: config.blockId || null,
        floor: needsFloor ? floor : null,
        type: unit.type,
        sqFt: sqFtNum,
        status: 'vacant',
      })
      validIdx++
    }
  }

  return flats
}

/** Create a default set of 4 unit templates for a standard floor */
export function defaultUnits(): UnitTemplate[] {
  return [
    { id: crypto.randomUUID(), suffix: '01', type: 'flat', sqFt: '1000' },
    { id: crypto.randomUUID(), suffix: '02', type: 'flat', sqFt: '1000' },
    { id: crypto.randomUUID(), suffix: '03', type: 'flat', sqFt: '1000' },
    { id: crypto.randomUUID(), suffix: '04', type: 'flat', sqFt: '1000' },
  ]
}

/** Count total valid flats that would be generated */
export function countGenerated(config: BulkSetupConfig): number {
  if (config.fromFloor > config.toFloor) return 0
  const floors = config.toFloor - config.fromFloor + 1
  const validUnits = config.units.filter(
    u => u.suffix.trim() && parseFloat(u.sqFt) > 0
  ).length
  return floors * validUnits
}