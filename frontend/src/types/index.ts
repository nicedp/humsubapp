// ─── Auth & User ───────────────────────────────────────────────
export interface AuthUser {
  id: string
  userId?: string  // alias kept for backward compat — use id
  role: 'admin' | 'owner' | 'tenant' | 'security'
  residentId?: string | null
  staffId?: string | null
  username: string
}

// ─── Block ─────────────────────────────────────────────────────
export interface Block {
  id: string
  societyId: number
  name: string
  description?: string | null
  blockType: 'flats' | 'rowhouses' | 'mixed'
  totalFloors?: number | null
  isActive: boolean
  flatCount?: number
  createdAt: string
  updatedAt: string
}

// ─── Property / Flat ───────────────────────────────────────────
export type PropertyType = 'flat' | 'single' | 'duplex' | 'triplex' | 'bungalow' | 'penthouse'

export interface Flat {
  id: string
  societyId: number
  blockId?: string | null
  blockName?: string | null
  flatNumber: string
  floor: number | null
  type: PropertyType
  sqFt: number
  status: 'occupied' | 'vacant'
  ownerId?: string | null
  ownerName?: string | null
  createdAt: string
  updatedAt: string
}

// ─── Resident ─────────────────────────────────────────────────
export interface Resident {
  id: string
  name: string
  email: string
  phone: string
  whatsapp?: string
  flatId: string
  flatNumber?: string
  residentType: 'owner' | 'tenant'
  isActive: boolean
  moveInDate: string
  moveOutDate?: string
  numCars: number
  numBikes: number
  userId?: string | null       // linked User.id (if login account exists)
  username?: string | null     // linked User.username (if login account exists)
  role?: string | null         // linked User.role
  createdAt: string
}

// ─── Billing ──────────────────────────────────────────────────
export interface MaintenanceBill {
  id: string
  flatId: string
  flatNumber?: string
  floor?: number | null
  residentName?: string | null
  residentPhone?: string | null
  month: number
  year: number
  amount: number
  status: 'unpaid' | 'paid' | 'overdue'
  dueDate: string
  lateFee: number
  totalDue: number
  payment?: Payment
  createdAt: string
}

export interface Payment {
  id: string
  billId: string
  amountPaid: number
  paidOn: string
  paymentMode: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  notes?: string
  recordedBy?: string
}

// ─── Visitor ──────────────────────────────────────────────────
export type VisitorType =
  | 'guest' | 'delivery' | 'milkman' | 'service'
  | 'plumber' | 'electrician' | 'dth' | 'broadband' | 'solar' | 'gas'
  | 'cab' | 'courier' | 'other'

export interface Visitor {
  id:            string
  flatId:        string
  flatNumber?:   string
  visitorName:   string
  phone?:        string
  vehicleNumber?: string
  visitorType:   VisitorType
  purpose?:      string | null
  entryTime:     string
  exitTime?:     string | null
  loggedBy?:     string | null
  createdAt:     string
  updatedAt:     string
}

// ─── Asset ────────────────────────────────────────────────────
export interface Asset {
  id: string
  name: string
  type: 'lift' | 'borewell' | 'water_tank' | 'generator' | 'other'
  status: 'operational' | 'under_maintenance' | 'out_of_service'
  location?: string
  lastServiceDate?: string
  nextServiceDue?: string
  notes?: string
  societyId: number
  createdAt: string
}

// ─── Parking ──────────────────────────────────────────────────
export interface ParkingSlot {
  id: string
  slotNumber: string
  flatId?: string
  flatNumber?: string
  vehicleNumber?: string
  vehicleType?: string
  isOccupied: boolean
  societyId: number
  createdAt: string
}

// ─── Notice ───────────────────────────────────────────────────
export interface Notice {
  id: string
  title: string
  body: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  postedBy?: string
  postedOn: string
  expiresOn?: string
  societyId: number
  createdAt: string
}

// ─── Complaint ────────────────────────────────────────────────
export interface Complaint {
  id: string
  flatId: string
  flatNumber?: string
  raisedBy?: string
  category: 'maintenance' | 'noise' | 'cleanliness' | 'security' | 'billing' | 'other'
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  adminRemark?: string
  raisedOn: string
  resolvedOn?: string
  createdAt: string
}

// ─── Staff ────────────────────────────────────────────────────
export interface Staff {
  id: string
  name: string
  role: string
  phone?: string
  shift?: string
  joinDate: string
  isActive: boolean
  societyId: number
  userId?: string
  createdAt: string
}

// ─── Notification ─────────────────────────────────────────────
export interface Notification {
  id: string
  userId: string
  flatId?: string
  message: string
  isRead: boolean
  createdAt: string
}

// ─── Settings ─────────────────────────────────────────────────
export interface SocietySettings {
  // Billing / Configurations
  ratePerSqft: number
  fixedCharge: number
  lateFeeGraceDays: number
  lateFeePerDay: number
  billVacantFlats: boolean

  // Opening Balance
  openingBalance: number
  openingBalanceYearMonth: string  // "YYYY-MM" or ""

  // General / Society Info
  societyName: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  websiteUrl: string | null
  mapLat: string | null
  mapLng: string | null

  // Bank Details
  bankName: string | null
  bankAccountNumber: string | null
  bankIfsc: string | null
  bankBranch: string | null
  upiId: string | null
  upiQrCode: string | null

  // Display Settings
  paginationLimit: number
  theme: 'light' | 'dark'

  // Security
  require2fa: boolean

  // Society Identity (from Society table, not EAV)
  accountNumber: string | null
  societyUrl: string | null
}

// ─── Directory ────────────────────────────────────────────────
export interface DirectoryEntry {
  id: string
  name: string
  flatNumber: string
  floor: number
  flatType: string
  residentType: string
}

// ─── Pagination ───────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  skip: number
  limit: number
}

// ─── API Error ────────────────────────────────────────────────
export interface ApiError {
  message: string
  statusCode: number
}

// ─── Vehicle ──────────────────────────────────────────────────
export type VehicleType = 'car' | 'bike' | 'scooter' | 'other'

export interface Vehicle {
  id: string
  residentId: string
  residentName?: string
  flatId: string
  vehicleType: VehicleType
  vehicleNumber: string
  make: string | null
  model: string | null
  color: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Admin User ───────────────────────────────────────────────
export interface AdminUser {
  id: string
  username: string
  role: 'admin' | 'security'
  isActive: boolean
  residentId: string | null
  staffId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Helper ───────────────────────────────────────────────────
export type HelperCategory =
  | 'electrician' | 'plumber' | 'carpenter' | 'ac_service'
  | 'motor_binding' | 'generator_service' | 'painting'
  | 'pest_control' | 'housekeeping' | 'security_service' | 'other'

export interface Helper {
  id:             string
  societyId:      number
  name:           string
  phone:          string
  alternatePhone?: string | null
  email?:         string | null
  category:       HelperCategory
  description?:   string | null
  photoUrl?:      string | null
  isActive:       boolean
  addedBy?:       string | null
  createdAt:      string
  updatedAt:      string
}