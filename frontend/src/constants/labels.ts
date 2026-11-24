/**
 * Central constants file for shared labels, colors and lookup maps.
 * Import from here instead of duplicating in each component.
 */

// ─── Month Names ─────────────────────────────────────────────────────────────

/** Full month names, index 0 = January */
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Short month names, index 0 = Jan */
export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// ─── Expense Category Fallback Colors ────────────────────────────────────────

/** Fallback hex colors for expense categories that have no explicit color in DB.
 *  Cycle through this array using `index % FALLBACK_COLORS.length`. */
export const FALLBACK_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

// ─── Income Sources ──────────────────────────────────────────────────────────

export interface IncomeSourceDef {
  value: string
  label: string
  icon: string
  /** Tailwind badge classes */
  badgeClass: string
}

/** All valid income source definitions */
export const INCOME_SOURCES: IncomeSourceDef[] = [
  { value: 'sponsorship',   label: 'Sponsorship',   icon: '🤝', badgeClass: 'bg-blue-100 text-blue-700' },
  { value: 'advertisement', label: 'Advertisement', icon: '📣', badgeClass: 'bg-purple-100 text-purple-700' },
  { value: 'event',         label: 'Event',         icon: '🎉', badgeClass: 'bg-yellow-100 text-yellow-700' },
  { value: 'rental',        label: 'Rental',        icon: '🏠', badgeClass: 'bg-green-100 text-green-700' },
  { value: 'donation',      label: 'Donation',      icon: '💝', badgeClass: 'bg-pink-100 text-pink-700' },
  { value: 'other',         label: 'Other',         icon: '💵', badgeClass: 'bg-gray-100 text-gray-600' },
]

/** Quick lookup: source value → emoji icon (used in report text) */
export const INCOME_SOURCE_ICONS: Record<string, string> = Object.fromEntries(
  INCOME_SOURCES.map(s => [s.value, s.icon])
)

/** Quick lookup: source value → human label (used in WhatsApp text & report) */
export const INCOME_SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  INCOME_SOURCES.map(s => [s.value, `${s.icon} ${s.label}`])
)

/** Helper: get badge Tailwind class for an income source */
export function incomeSourceBadge(source: string): string {
  return INCOME_SOURCES.find(s => s.value === source)?.badgeClass ?? 'bg-gray-100 text-gray-600'
}

/** Helper: get icon emoji for an income source */
export function incomeSourceIcon(source: string): string {
  return INCOME_SOURCES.find(s => s.value === source)?.icon ?? '💵'
}

/** Helper: get human label for an income source */
export function incomeSourceLabel(source: string): string {
  return INCOME_SOURCES.find(s => s.value === source)?.label ?? source
}

// ─── Bill / Maintenance Status Colors ────────────────────────────────────────

/** Tailwind badge classes for maintenance bill status */
export const BILL_STATUS_COLORS: Record<string, string> = {
  unpaid:  'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  paid:    'bg-green-100 text-green-700',
}

// ─── Complaint Status Colors ──────────────────────────────────────────────────

/** Tailwind badge classes for complaint status */
export const COMPLAINT_STATUS_COLORS: Record<string, string> = {
  open:        'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved:    'bg-green-100 text-green-700',
  closed:      'bg-gray-100 text-gray-500',
}

/** All complaint categories */
export const COMPLAINT_CATEGORIES = [
  'maintenance', 'noise', 'cleanliness', 'security', 'billing', 'other',
]

/** All complaint statuses */
export const COMPLAINT_STATUSES = ['open', 'in_progress', 'resolved', 'closed']

// ─── Invoice Status Colors ────────────────────────────────────────────────────

/** Tailwind badge classes for invoice status */
export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  paid:      'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

/** All invoice statuses */
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled']

// ─── Notice Priority Colors ───────────────────────────────────────────────────

/** Tailwind badge classes for notice priority */
export const NOTICE_PRIORITY_COLORS: Record<string, string> = {
  urgent:  'bg-red-100 text-red-700',
  high:    'bg-orange-100 text-orange-700',
  normal:  'bg-blue-100 text-blue-700',
}

/** Helper: get Tailwind classes for a notice priority */
export function noticePriorityColor(priority: string): string {
  return NOTICE_PRIORITY_COLORS[priority] ?? 'bg-blue-100 text-blue-700'
}

// ─── Event Status Colors ──────────────────────────────────────────────────────

/** Tailwind badge classes for society event status */
export const EVENT_STATUS_COLORS: Record<string, string> = {
  planning:  'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

// ─── AMC / Contract Status Colors ────────────────────────────────────────────

/** Tailwind badge classes for AMC contract status */
export const AMC_STATUS_COLORS: Record<string, string> = {
  active:          'bg-green-100 text-green-700',
  expired:         'bg-red-100 text-red-600',
  cancelled:       'bg-gray-100 text-gray-500',
  pending_renewal: 'bg-yellow-100 text-yellow-700',
}

/** Tailwind badge + dot classes for AMC due status */
export const AMC_DUE_STATUS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  overdue:  { bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500',    label: '🔴 Overdue'  },
  due_soon: { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500', label: '🟡 Due Soon' },
  ok:       { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500',  label: '🟢 OK'       },
  unknown:  { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: '⚪ Unknown'  },
}

// ─── Property Types ───────────────────────────────────────────────────────────

/** Human-readable label for each property type */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  flat:      '🏢 Flat',
  single:    '🏠 Single',
  duplex:    '🏘️ Duplex',
  triplex:   '🏘️ Triplex',
  bungalow:  '🏡 Bungalow',
  penthouse: '🌟 Penthouse',
}

/** Human-readable label for bulk setup property types (no penthouse — added individually).
 *  Note: slightly more descriptive labels vs PROPERTY_TYPE_LABELS for form context. */
export const BULK_PROPERTY_TYPE_LABELS: Record<string, string> = {
  flat:      'Flat / Apartment',
  single:    'Single Storey',
  duplex:    'Duplex',
  triplex:   'Triplex',
  bungalow:  'Bungalow',
}

/** Types that require a floor number */
export const FLOOR_REQUIRED_TYPES = new Set(['flat', 'penthouse'])

// ─── Floor Names ─────────────────────────────────────────────────────────────

/** Named labels for special floor numbers.
 *  Usage: FLOOR_NAMES[n] ?? `Floor ${n}`
 *  Add more entries here to support basements, mezzanines, etc. */
export const FLOOR_NAMES: Record<number, string> = {
  [-3]: 'Basement 3',
  [-2]: 'Basement 2',
  [-1]: 'Basement',
  [0]:  'Ground Floor',
  [1]:  '1st Floor',
  [2]:  '2nd Floor',
  [3]:  '3rd Floor',
}

/** Return a display name for any floor number.
 *  Falls back to "4th Floor", "5th Floor", … for floors not in FLOOR_NAMES. */
export function floorLabel(n: number): string {
  if (n in FLOOR_NAMES) return FLOOR_NAMES[n]
  const suffix = n === 11 || n === 12 || n === 13 ? 'th'
    : n % 10 === 1 ? 'st'
    : n % 10 === 2 ? 'nd'
    : n % 10 === 3 ? 'rd'
    : 'th'
  return `${n}${suffix} Floor`
}

// ─── Block Types ──────────────────────────────────────────────────────────────

/** Human-readable label for each block type */
export const BLOCK_TYPE_LABELS: Record<string, string> = {
  flats:     '🏢 Flats',
  rowhouses: '🏡 Row Houses',
  mixed:     '🏘️ Mixed',
}

/** Tailwind badge classes for block type */
export const BLOCK_TYPE_COLORS: Record<string, string> = {
  flats:     'bg-blue-100 text-blue-700',
  rowhouses: 'bg-green-100 text-green-700',
  mixed:     'bg-purple-100 text-purple-700',
}

/** Block type option definitions for form selectors/pickers */
export const BLOCK_TYPE_OPTIONS: {
  value: 'flats' | 'rowhouses' | 'mixed'
  label: string
  desc: string
}[] = [
  { value: 'flats',     label: 'Flats / Apartments', desc: 'Multi-floor apartments with floor numbers' },
  { value: 'rowhouses', label: 'Row Houses',          desc: 'Ground-level units without floors' },
  { value: 'mixed',     label: 'Mixed',               desc: 'Combination of flats and row houses' },
]

// ─── Note Colors ──────────────────────────────────────────────────────────────

// ─── Visitor Types ────────────────────────────────────────────────────────────

/** Human-readable label for each visitor type */
export const VISITOR_TYPE_LABELS: Record<string, string> = {
  guest:       'Guest',
  delivery:    'Delivery',
  milkman:     'Milkman',
  service:     'Service',
  plumber:     'Plumber',
  electrician: 'Electrician',
  dth:         'DTH',
  broadband:   'Broadband',
  solar:       'Solar',
  gas:         'Gas',
  cab:         'Cab',
  courier:     'Courier',
  other:       'Other',
}

/** Emoji icon for each visitor type */
export const VISITOR_TYPE_ICONS: Record<string, string> = {
  guest:       '👤',
  delivery:    '📦',
  milkman:     '🥛',
  service:     '🔧',
  plumber:     '🪠',
  electrician: '⚡',
  dth:         '📡',
  broadband:   '🌐',
  solar:       '☀️',
  gas:         '🔴',
  cab:         '🚕',
  courier:     '📬',
  other:       '🚶',
}

/** Tailwind badge classes for each visitor type */
export const VISITOR_TYPE_COLORS: Record<string, string> = {
  guest:       'bg-blue-100 text-blue-700',
  delivery:    'bg-orange-100 text-orange-700',
  milkman:     'bg-yellow-100 text-yellow-700',
  service:     'bg-purple-100 text-purple-700',
  plumber:     'bg-cyan-100 text-cyan-700',
  electrician: 'bg-amber-100 text-amber-700',
  dth:         'bg-indigo-100 text-indigo-700',
  broadband:   'bg-sky-100 text-sky-700',
  solar:       'bg-lime-100 text-lime-700',
  gas:         'bg-red-100 text-red-700',
  cab:         'bg-green-100 text-green-700',
  courier:     'bg-teal-100 text-teal-700',
  other:       'bg-gray-100 text-gray-600',
}

/** All visitor type values (for filter dropdowns) */
export const VISITOR_TYPES = [
  'guest', 'delivery', 'milkman', 'service',
  'plumber', 'electrician', 'dth', 'broadband', 'solar', 'gas',
  'cab', 'courier', 'other',
] as const

export type VisitorTypeValue = typeof VISITOR_TYPES[number]

// ─── Helper Categories ────────────────────────────────────────────────────────

/** Human-readable label for each helper category */
export const HELPER_CATEGORY_LABELS: Record<string, string> = {
  electrician:      'Electrician',
  plumber:          'Plumber',
  carpenter:        'Carpenter',
  ac_service:       'AC Service',
  motor_binding:    'Motor Binding',
  generator_service: 'Generator Service',
  painting:         'Painting',
  pest_control:     'Pest Control',
  housekeeping:     'Housekeeping',
  security_service: 'Security Service',
  other:            'Other',
}

/** Emoji icon for each helper category */
export const HELPER_CATEGORY_ICONS: Record<string, string> = {
  electrician:      '⚡',
  plumber:          '🪠',
  carpenter:        '🪚',
  ac_service:       '❄️',
  motor_binding:    '⚙️',
  generator_service: '🔋',
  painting:         '🎨',
  pest_control:     '🐛',
  housekeeping:     '🧹',
  security_service: '🛡️',
  other:            '🔧',
}

/** All helper categories (for filter dropdowns) */
export const HELPER_CATEGORIES = [
  'electrician', 'plumber', 'carpenter', 'ac_service',
  'motor_binding', 'generator_service', 'painting',
  'pest_control', 'housekeeping', 'security_service', 'other',
] as const

export type HelperCategoryValue = typeof HELPER_CATEGORIES[number]

// ─── Note Colors ──────────────────────────────────────────────────────────────

/** Tailwind bg + border + title classes per note color */
export const NOTE_COLOR_CLASSES: Record<string, { bg: string; border: string; title: string }> = {
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   title: 'text-blue-800'   },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   title: 'text-pink-800'   },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  title: 'text-green-800'  },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-800' },
  white:  { bg: 'bg-white',     border: 'border-gray-200',   title: 'text-gray-800'   },
}

// ─── Committee Designations ───────────────────────────────────────────────────

/** Human-readable label for each committee designation */
export const DESIGNATION_LABELS: Record<string, string> = {
  president:       'President',
  vice_president:  'Vice President',
  secretary:       'Secretary',
  joint_secretary: 'Joint Secretary',
  treasurer:       'Treasurer',
  joint_treasurer: 'Joint Treasurer',
  member:          'Member',
  advisor:         'Advisor',
}

/** Tailwind badge classes by designation (seniority-based coloring) */
export const DESIGNATION_COLORS: Record<string, string> = {
  president:       'bg-yellow-100 text-yellow-800 border border-yellow-300',
  vice_president:  'bg-yellow-50 text-yellow-700 border border-yellow-200',
  secretary:       'bg-blue-100 text-blue-700',
  joint_secretary: 'bg-blue-50 text-blue-600',
  treasurer:       'bg-green-100 text-green-700',
  joint_treasurer: 'bg-green-50 text-green-600',
  member:          'bg-gray-100 text-gray-600',
  advisor:         'bg-purple-100 text-purple-700',
}

/** All committee designation values (for form selects) */
export const DESIGNATIONS = [
  'president', 'vice_president', 'secretary', 'joint_secretary',
  'treasurer', 'joint_treasurer', 'member', 'advisor',
] as const

export type DesignationValue = typeof DESIGNATIONS[number]

// ─── Achievement Categories ───────────────────────────────────────────────────

/** Human-readable label for each achievement category */
export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  infrastructure: 'Infrastructure',
  finance:        'Finance',
  community:      'Community',
  legal:          'Legal',
  safety:         'Safety',
  other:          'Other',
}

/** Emoji icon for each achievement category */
export const ACHIEVEMENT_CATEGORY_ICONS: Record<string, string> = {
  infrastructure: '🏗️',
  finance:        '💰',
  community:      '🤝',
  legal:          '⚖️',
  safety:         '🛡️',
  other:          '✨',
}

/** Tailwind badge classes for achievement category */
export const ACHIEVEMENT_CATEGORY_COLORS: Record<string, string> = {
  infrastructure: 'bg-orange-100 text-orange-700',
  finance:        'bg-green-100 text-green-700',
  community:      'bg-blue-100 text-blue-700',
  legal:          'bg-purple-100 text-purple-700',
  safety:         'bg-red-100 text-red-700',
  other:          'bg-gray-100 text-gray-600',
}

/** All achievement category values (for form selects) */
export const ACHIEVEMENT_CATEGORIES = [
  'infrastructure', 'finance', 'community', 'legal', 'safety', 'other',
] as const

export type AchievementCategoryValue = typeof ACHIEVEMENT_CATEGORIES[number]