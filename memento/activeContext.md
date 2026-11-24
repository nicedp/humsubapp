# Active Context

## Current Focus

## What Was Just Done (16 Jul 2026 — Resident Profile: Cars/Bikes Bug Fix + Admin Change Password Feature)

### Bug Fix: Cars/Bikes Count Incorrect in Personal Details
**Root Cause:** `getResidentProfile()` in `resident.service.ts` was calling `transformResident()` which read stale `numCars`/`numBikes` DB columns. These counters can drift when vehicles are added/deleted outside the resident service (or due to earlier bugs in the increment/decrement logic).

**Fix (Backend):**
- `backend/src/services/resident.service.ts` (lines 540–547) — After fetching the `vehicles` array in `Promise.all`, re-derives `numCars` and `numBikes` from live vehicle records:
  ```ts
  const numCars = (vehicles as any[]).filter(v => v.vehicleType === 'car').length;
  const numBikes = (vehicles as any[]).filter(v => v.vehicleType !== 'car').length;
  ```
  Then spreads these overrides into the returned `resident` object, overriding the stale DB counters.

**Fix (Frontend):**
- `frontend/src/pages/admin/ResidentProfile.tsx` (lines 440–441) — Also re-derives from the vehicles array received in the profile response:
  ```ts
  const numCars = vehicles.filter(v => v.vehicleType === 'car').length
  const numBikes = vehicles.filter(v => v.vehicleType !== 'car').length
  ```
  Uses these in the Personal Details section: `"X cars · Y bikes"`.

Also applied same fix to `getAllResidents()` (lines 48–78) — uses `prisma.vehicle.groupBy()` to fetch live vehicle counts for all residents in one query and patches each resident before transforming.

### Feature: Admin Change Resident Portal Password

**New Backend Files/Changes:**
- `backend/src/dtos/resident.dto.ts` (lines 103–110) — Added `adminChangePasswordSchema` (newPassword min 6, notify enum: `email|whatsapp|none`) + `AdminChangePasswordDto`
- `backend/src/utils/email.utils.ts` (lines 75–88) — Added `sendPasswordChangedNotification(email, username)` — sends HTML+text email; dev console stub if no SMTP configured
- `backend/src/services/resident.service.ts` (lines 448–473) — Added `adminChangeResidentPassword(residentId, newPassword, notify, societyId)`:
  - Looks up resident scoped by society (throws 404 if not found, 400 if no portal account)
  - Hashes new password, updates user record
  - If `notify === 'email'` and email exists: calls `sendPasswordChangedNotification()`
  - Returns `{ success: true, notified: notify }`
- `backend/src/controllers/resident.controller.ts` (lines 169–183) — Added `adminChangeResidentPasswordHandler`: Zod `safeParse`, calls service, returns JSON
- `backend/src/routes/resident.routes.ts` (line 103) — Registered `POST /:id/change-password` with `requireRoles('admin')` BEFORE `/:id` route

**New Frontend Files/Changes:**
- `frontend/src/api/residents.ts` (lines 207–213) — Added `changePassword(residentId, { newPassword, notify })` → `POST /residents/:id/change-password`
- `frontend/src/pages/admin/ResidentProfile.tsx` — Complete rewrite with:
  - `ChangePasswordModal` component (lines 86–271): New/Confirm password inputs, 3-button notify selector (🔕 No Notification / 📧 Send Email / 💬 WhatsApp), email+WA hint text, success state, error banner
  - WhatsApp notification: opens `https://wa.me/{phone}?text={encoded_message}` in new tab (no API needed)
  - Email/WhatsApp buttons disabled if contact not on file (with tooltip)
  - `showPwdModal` state (line 409) controls modal visibility
  - Portal Account `SectionCard` action prop: `🔑 Change Password` amber button (only when `portalAccount` exists)
  - Modal rendered at lines 668–676

### Files Changed (16 Jul 2026)
- `backend/src/services/resident.service.ts` — Bug fix in `getAllResidents()` + `getResidentProfile()`; added `adminChangeResidentPassword()`
- `backend/src/dtos/resident.dto.ts` — Added `adminChangePasswordSchema`, `AdminChangePasswordDto`
- `backend/src/utils/email.utils.ts` — Added `sendPasswordChangedNotification()`
- `backend/src/controllers/resident.controller.ts` — Added `adminChangeResidentPasswordHandler`; cleaned up `getResidentProfileHandler`
- `backend/src/routes/resident.routes.ts` — Registered `POST /:id/change-password` before `/:id`
- `frontend/src/api/residents.ts` — Added `changePassword()` method
- `frontend/src/pages/admin/ResidentProfile.tsx` — Full rewrite (815 lines): bug fix + Change Password modal + button

---

## What Was Just Done (11 Jul 2026 — Session 3: SocietyCard UX Fixes)

### Issues Fixed
Three UX issues identified after code review:

**Fix 1 — Portal URL format** (was `/s/slug` path, should be subdomain)
- `frontend/src/components/admin/SocietyCard.tsx` — `buildPortalUrl()` now returns `https://{slug}.societyportal.app` (matches `PORTAL_DOMAIN = 'societyportal.app'` constant from `RegisterPage.tsx`)
- Portal URL preview in `Settings.tsx` also updated to subdomain format via imported `buildPortalUrl()`
- Hint text updated: `"your portal will be at https://your-slug.societyportal.app"`

**Fix 2 — SocietyCard placement** (was always visible in Settings, should be behind CTA)
- Removed always-visible `<SocietyCard>` from `Settings.tsx` General tab
- Added indigo banner with `🪪 View Card` button; clicking opens `SocietyCardModal`
- Same CTA pattern used in `Step7ReviewActivate.tsx` — replaced inline card with indigo CTA → modal

**Fix 3 — Print isolation** (was `window.print()` which printed whole page)
- `SocietyCardModal` now generates a hidden `<iframe>`, injects complete card HTML + isolated CSS, calls `iframe.contentWindow.print()`, then removes iframe after 1s
- Only the card is printed — not the page header, sidebar, or anything else
- Card HTML is self-contained with inline styles (no external deps); works cross-browser

### SocietyCard Architecture (final)
- **`SocietyCard` (default export)** — pure visual card (`CardBody`); used when embedding card content directly (no modal, no print button)
- **`SocietyCardModal` (named export)** — modal wrapper with ×, 🖨️ Print button, backdrop close; uses iframe print isolation
- **`buildPortalUrl(slug)` (named export)** — `https://{slug}.societyportal.app`; also used in `Settings.tsx`
- **`PORTAL_DOMAIN` (named export)** — `'societyportal.app'`; use everywhere portal URL is constructed

---

## What Was Just Done (11 Jul 2026 — Session 2: Portal Identity UX Polish)

### 1. Reserved Words for societyUrl
**Problem:** Admin could accidentally register a slug like `admin`, `api`, or `mobile`, which would conflict with application routes or create confusion.

**Changes:**
- `backend/src/services/onboarding.service.ts` — added `RESERVED_SOCIETY_URLS: Set<string>` (exported); `checkSocietyUrlAvailable()` now checks reserved words before DB query (returns `available: false` for reserved slugs)
- `backend/src/dtos/settings.dto.ts` — `societyUrl` field now has `.refine()` rejecting reserved slugs: `!RESERVED_SOCIETY_URLS.has(slug.toLowerCase())`
- `backend/src/dtos/onboarding.dto.ts` — same `.refine()` added to `registerSocietySchema.societyUrl` and `step1ProfileSchema.societyUrl`; import of `RESERVED_SOCIETY_URLS` from service file at top

**Reserved slugs include:** `admin`, `api`, `app`, `www`, `mobile`, `m`, `accounts`, `login`, `register`, `setup`, `dashboard`, `portal`, `manage`, `help`, `support`, `docs`, `static`, `assets`, `health`, `status`

### 2. SocietyCard Component
- **NEW: `frontend/src/components/admin/SocietyCard.tsx`** — reusable printable society identity card
  - Props: `settings: Partial<SocietySettings>`, `portalBaseUrl?: string`, `showPrint?: boolean`
  - Sections: gradient header (🏘️ icon + society name), Account Number box (large monospace, blue border, copy button), Portal URL row (copy button), Login URL row (copy button), Address line, Contact row (phone + email)
  - Footer: "Share this card with residents" hint + `/{slug}` label
  - `buildPortalUrl(settings, baseUrl)` helper exported for use in other components
  - `CopyButton` internal sub-component handles clipboard copy with 2s ✓ confirmation
  - Fully printable (🖨️ Print Card button with `print:hidden` on non-printable parts)
  - Returns `null` if no data — safe to always render

### 3. Portal URL Preview in Settings
- **`frontend/src/pages/admin/Settings.tsx`** — General tab Portal Identity section:
  - Imported `SocietyCard` from `'../../components/admin/SocietyCard'`
  - Added inline portal URL preview below the societyUrl field (both locked + unlocked states): monospace blue text showing `{origin}/s/{slug}` with 📋 copy button; styled as `bg-gray-50 border border-gray-200 rounded-lg px-3 py-2`
  - Added `<SocietyCard settings={form} showPrint />` below the Portal Identity SectionCard when `data?.accountNumber || data?.societyUrl` is truthy

### 4. SocietyCard in Step7ReviewActivate
- **`frontend/src/components/onboarding/Step7ReviewActivate.tsx`** — replaced the green credentials box (lines 135–157) with `<SocietyCard>`:
  - Imported `SocietyCard, { buildPortalUrl }` from `'../admin/SocietyCard'`
  - Maps `SocietyPublic` fields to `SocietySettings` shape: `societyName: society?.name`, `accountNumber`, `societyUrl`, `address`, `phone: society?.contactPhone`, `email: society?.contactEmail`
  - Added tip below card when `accountNumber` is set but `societyUrl` is not: "💡 Tip: Set a Society URL in Settings after activation…"
  - Shows `showPrint` button so admin can print the card immediately after activation

---

## What Was Just Done (11 Jul 2026 — Session 1: Account Lookup Feature)

### Find Your Society Account Number (`/find-account`)

**Problem Solved:** With the new AWS IAM-style login requiring an `accountNumber`, members who don't know their society's account number had no way to find it without contacting their admin.

**Solution:** A public lookup page at `/find-account` that searches by society name, registered email, or phone number and returns the (partially masked) account number.

**Backend Changes:**
- `backend/src/services/onboarding.service.ts` — added `findAccount(query)` + `SocietyLookupResult` interface + `maskAccountNumber()` helper; searches `societies` table by name (partial, case-insensitive), contactEmail (exact, case-insensitive), or contactPhone (partial); returns max 10 results with accountNumber masked as `"2026**1001"` (first 4 + `**` + last 4)
- `backend/src/controllers/onboarding.controller.ts` — added `findAccount` handler; validates `q` param min length 2; passes to service; returns `{ results[] }`
- `backend/src/routes/onboarding.routes.ts` — added `GET /find-account` public route (no auth, no rate limit — results are masked)

**Frontend Changes:**
- `frontend/src/api/onboarding.ts` — added `SocietyLookupResult` interface + `onboardingApi.findAccount(q)` method calling `GET /onboarding/find-account`
- `frontend/src/pages/FindAccountPage.tsx` — NEW public page at `/find-account`; search form (name/email/phone); result cards showing society name, city/state, societyUrl, status badge, masked accountNumber with 📋 copy button; amber warning that number is masked; "Back to Sign In" + "Register" footer links
- `frontend/src/pages/LoginPage.tsx` — added `🔍 Don't know your account number? Find it here →` link (indigo, only shown in standard mode) below the login/register mode toggle
- `frontend/src/App.tsx` — imported `FindAccountPage` + registered `<Route path="/find-account" element={<FindAccountPage />} />`

**Security Design:**
- Account number is **partially masked** (`2026**1001`) — hides middle digits so only someone who already has partial knowledge can confirm
- Only `active` and `setup` societies returned (not `pending` or `suspended`)
- Only societies that already have an `accountNumber` appear in results
- No authentication required — public lookup, like "find my bank" features
- Results are masked so no sensitive data is exposed

---

**Sprint 8 — Account-Based Login + Society Identity** — **COMPLETE** as of 10 Jul 2026.

## What Was Just Done (10 Jul 2026 — Sprint 8)

### AWS IAM-style Multi-Tenant Login System

**Problem Solved:** `username` was globally unique — a user `john` in Society A would conflict with a `john` in Society B. Added `accountNumber` (YYYYMMNNN format) and `societyUrl` (slug) to the Society table; username uniqueness is now compound `[societyId, username]`.

**DB Schema Changes:**
- `Society` model: 2 new optional fields — `societyUrl String? @unique` (slug), `accountNumber String? @unique` (YYYYMMNNN)
- `User` model: `username` changed from global `@unique` → compound `@@unique([societyId, username])`
- Migration: `backend/prisma/migrations/20260710_society_account_login/migration.sql`
- Seeded values for id=1: `societyUrl: 'default-society'`, `accountNumber: '2026011001'`

**Backend Changes:**
- `backend/src/dtos/auth.dto.ts` — `accountNumber: z.string().min(1)` added to `loginSchema`
- `backend/src/dtos/settings.dto.ts` — `societyUrl` field with min(2)/max(75)/regex validation
- `backend/src/services/auth.service.ts` — `login()` now: (1) resolve society via `accountNumber`, (2) find user by `societyId_username` compound key
- `backend/src/services/settings.service.ts` — `SettingsSnapshot` has `accountNumber` + `societyUrl`; `getSettings()` fetches from Society table; `updateSettings()` writes `societyUrl` to Society table; `accountNumber` silently ignored on update
- `backend/src/services/onboarding.service.ts` — `generateSocietyUrl()` + `generateAccountNumber()` helpers; `registerSociety()` calls both; `saveStep2()` uses `societyId_username` compound key
- `backend/prisma/seed.ts` — Society upsert includes `societyUrl` + `accountNumber`; admin user upsert uses `(prisma as any).user.upsert({ where: { societyId_username: ... } })`

**Frontend Changes:**
- `frontend/src/api/auth.ts` — `LoginPayload.accountNumber: string` added
- `frontend/src/api/onboarding.ts` — `SocietyPublic` has `accountNumber` + `societyUrl`
- `frontend/src/types/index.ts` — `SocietySettings` has `accountNumber` + `societyUrl`
- `frontend/src/pages/LoginPage.tsx` — Account Number field (first, with `autoFocus`), then username, then password; `REMEMBER_ACCOUNT_KEY` persists account number in localStorage alongside username
- `frontend/src/pages/admin/Settings.tsx` — "Portal Identity" `SectionCard` in General tab: read-only `accountNumber` with 📋 copy button + editable `societyUrl`; `saveGeneral()` includes `societyUrl`
- `frontend/src/components/onboarding/Step7ReviewActivate.tsx` — green highlight box after summary cards showing `accountNumber` + `societyUrl` with "share with members" copy CTA

**Login Flow:**
1. User enters Account Number → Username → Password
2. Backend resolves society via `accountNumber`
3. Finds user by `(societyId, username)` compound key
4. Error messages deliberately vague: "Invalid account number, username, or password"

**Account Number Format:** `YYYYMMNNN` — 10 chars, counter starts at 1001 per `YYYYMM` bucket. Example: first society Jul 2026 → `2026071001`.

## Next Steps — Sprint 9
Sprint 9 per roadmap: **P3.4 Document Vault + P3.6 Reporting Suite**

### P3.4 — Document Vault (~1 day)
- New DB table: `society_documents` (id, societyId, title, category `DocCategory` enum, fileUrl, fileSize, mimeType, visibleToResidents, uploadedBy, version, createdAt, updatedAt)
- `DocCategory` enum: `bylaw | noc | audit | contract | minutes | circular | other`
- Admin: upload, categorize, toggle resident visibility, replace with new version
- Resident: view documents marked `visibleToResidents=true`
- Uses existing `storage.service.ts` (`uploadFile()`)
- 10MB file size limit enforced in multer config

### P3.6 — Admin Reporting Suite (~1 day)
- Dedicated Reports section — 6 exportable reports (CSV + print-friendly)
- Reports: Monthly Collection, Resident Aging, Expense Budget vs Actual, Visitor Traffic, Complaint SLA, Committee Activity
- New `frontend/src/pages/admin/Reports.tsx` orchestrator + `components/admin/reports/` sub-components
- Sidebar: `📊 Reports` under Finance group

---

## Previous Focus (1 Jul 2026 — Sprint 7)
**Sprint 7 — Resident Experience Upgrade** — **COMPLETE** as of 1 Jul 2026.

## What Was Just Done (1 Jul 2026 — Sprint 7)

### P2.3 — Resident Dashboard v2 (COMPLETE)

**Frontend Only — orchestrator + sub-components**

- **`frontend/src/pages/resident/Dashboard.tsx`** — full rewrite; orchestrator owns all 5 `useQuery` calls (billing summary, active complaints, recent notices, today's visitors, upcoming events); passes data down as props
- **Sub-components in `frontend/src/components/resident/dashboard/`:**
  - `BillHero.tsx` — bill status hero card; shows total due with countdown to due date; color-coded (red=overdue, yellow=unpaid, green=clear); "View Bills →" CTA
  - `ActiveComplaints.tsx` — list of open complaints (submitted / acknowledged / in_progress status pills); "Raise Complaint →" if none
  - `RecentNotices.tsx` — last 3 notices with priority badge + preview text + "View All →"
  - `TodayVisitors.tsx` — today's flat visitors; visitor type chips; "Log Entry →" for guard nav
  - `QuickActions.tsx` — 4-button quick action row: Raise Complaint · View Bills · Gate Pass · Committee
  - `UpcomingEvents.tsx` — next 2 society events; date + title + location

### P2.4 — Resident Payment QR Page (COMPLETE)

**Backend new endpoint:**
- **`backend/src/dtos/notification.dto.ts`** — added `notifyAdminSchema` (`{ message: string min(1) max(500) }`) + `NotifyAdminDto`
- **`backend/src/services/notification.service.ts`** — added `notifyAdmin(message, fromUserId, societyId)`: finds all `admin` users in the society, resolves sender's flat number + name via resident relation, fans out `Notification` records to each admin
- **`backend/src/controllers/notification.controller.ts`** — added `notifyAdminHandler`; imports `notifyAdminSchema` + `getSocietyId`
- **`backend/src/routes/notification.routes.ts`** — added `POST /notify-admin` gated by `requireRoles('owner', 'tenant')`; fixed import from `roleMiddleware` → `requireRoles`

**Frontend new page + wiring:**
- **`frontend/src/pages/resident/Pay.tsx`** — NEW: Payment page at `/resident/pay`; shows outstanding bill hero; UPI QR (SVG generated from `upi://pay?pa=...&am=...&pn=...&cu=INR`); bank details section (tap-to-copy); "I've Paid — Notify Admin" button → `notifyAdmin()` API call → success confirmation; all-clear state when no outstanding bills
- **`frontend/src/api/notifications.ts`** — added `notifyAdmin({ message })` → `POST /notifications/notify-admin`
- **`frontend/src/App.tsx`** — added `import ResidentPay` + `<Route path="/resident/pay">` in resident `ProtectedRoute` block
- **`frontend/src/components/Sidebar.tsx`** — added `{ to: '/resident/pay', label: 'Pay Now', icon: '💳' }` to resident Finance nav group

### P2.5 — Expense Analytics Enhancement (COMPLETE)

**Backend new endpoint:**
- **`backend/src/services/expense.service.ts`** — added `getVendorSummary(year, societyId)`: uses `prisma.expense.groupBy(['vendor'])` with `_sum: { amount: true }`, `_count: { id: true }`, `orderBy: { _sum: { amount: 'desc' } }`, `take: 10`; blank vendor grouped as `(Unspecified)`
- **`backend/src/controllers/expense.controller.ts`** — added inline `vendorSummaryQuerySchema` (z.coerce year) + `getVendorSummaryHandler`
- **`backend/src/routes/expense.routes.ts`** — added `GET /expenses/vendor-summary`

**Frontend enhancements to `ExpenseAnalytics.tsx`:**
- **`frontend/src/api/expenses.ts`** — added `ExpenseVendorSummaryItem { vendor, total, count }` interface + `getVendorSummary(year?)` calling `GET /expenses/vendor-summary`
- **`frontend/src/pages/admin/ExpenseAnalytics.tsx`** — enhanced:
  - Print style injection via `useEffect` (`@media print { .no-print { display: none } }`)
  - `🖨️ Export PDF` button (`.no-print`) calls `window.print()`; year selector also marked `.no-print`
  - Vendor summary `useQuery` keyed by `['expense-vendor-summary', selectedYear]`
  - **Section 3: Top Vendors** panel — horizontal progress-bar ranking of top 10; index badge, txn count, ₹ total, indigo progress bar proportional to max vendor spend

## Next Steps — Sprint 8
Sprint 8 per roadmap: **P3.4 Document Vault + P3.6 Reporting Suite**

### P3.4 — Document Vault (~1 day)
- New DB table: `society_documents` (id, societyId, title, category `DocCategory` enum, fileUrl, fileSize, mimeType, visibleToResidents, uploadedBy, version, createdAt, updatedAt)
- `DocCategory` enum: `bylaw | noc | audit | contract | minutes | circular | other`
- Admin: upload, categorize, toggle resident visibility, replace with new version
- Resident: view documents marked `visibleToResidents=true`
- Uses existing `storage.service.ts` (`uploadFile()`)
- 10MB file size limit enforced in multer config

### P3.6 — Admin Reporting Suite (~1 day)
- Dedicated Reports section — 6 exportable reports (CSV + print-friendly)
- Reports: Monthly Collection, Resident Aging, Expense Budget vs Actual, Visitor Traffic, Complaint SLA, Committee Activity
- New `frontend/src/pages/admin/Reports.tsx` orchestrator + `components/admin/reports/` sub-components
- Sidebar: `📊 Reports` under Finance group

---

## Previous Focus (22 Jun 2026 — Sprint 5)
**Sprint 5 — OWASP Security Hardening + Sub-Admin/Member ACL** — **COMPLETE** as of 22 Jun 2026.

## What Was Done (22 Jun 2026 — Sprint 5)

### P1.1 — Close 3 Deferred OWASP Security Items (COMPLETE)

**CRIT-2: Persistent JWT Blacklist**
- Added `BlacklistedToken` Prisma model to `schema.prisma` — fields: `id`, `token`, `expiresAt`, `createdAt`
- `backend/src/services/auth.service.ts` — `blacklistToken(token, expiresAt)` and `isTokenBlacklisted(token)` now use DB (`(prisma as any).blacklistedToken`) instead of in-memory `Set`
- `backend/src/utils/jwt.utils.ts` — added `decodeTokenExpiry(token): Date` using `jwt.decode()` (no verify needed)
- `backend/src/controllers/auth.controller.ts` — `logoutHandler` calls `decodeTokenExpiry(token)` and passes `expiresAt` to `auth.logout(token, expiresAt)`
- `backend/src/middleware/auth.middleware.ts` — made async; JWT verify first (fast), then DB blacklist check second
- Migration: `backend/prisma/migrations/20260622_sprint5_acl/migration.sql` includes `blacklisted_tokens` table

**MED-2: CORS Origin Restriction**
- `ALLOWED_ORIGINS=http://localhost:5173` added to `backend/.env`
- `backend/src/app.ts` — CORS config reads `process.env.ALLOWED_ORIGINS`, splits by comma, uses array-based `origin` callback instead of single string

**MED-5: Login Session Cleanup**
- `backend/src/services/auth.service.ts` — `recordLoginSession()` now deletes `login_sessions` rows older than 90 days (for the same `userId`) before inserting a new session row — no separate cron needed

### P1.2 — Sub-Admin + Member Roles + Full ACL Matrix (COMPLETE)

**Backend Schema & Migration**
- `backend/prisma/schema.prisma` — `Role` enum extended with `sub_admin` and `member`; `PermissionModule` enum (19 values); `RolePermission` model with unique `[societyId, role, module]` constraint
- `backend/prisma/migrations/20260622_sprint5_acl/migration.sql` — creates `blacklisted_tokens` + `role_permissions` tables; seeds default permission presets for both `sub_admin` and `member` for `societyId=1`

**Backend New Files**
- `backend/src/dtos/acl.dto.ts` — `PERMISSION_MODULES` array (19 modules), `ACL_ROLES`, `updatePermissionsSchema`, `PermissionEntry`, `AclMatrix` types
- `backend/src/services/acl.service.ts` — `checkPermission()`, `getRolePermissions()`, `updateRolePermissions()`, `ensureDefaultPermissions()`; in-memory `Map<societyId_role, PermissionsRecord>` cache invalidated on every update
- `backend/src/controllers/acl.controller.ts` — `getPermissionsHandler`, `updatePermissionsHandler`
- `backend/src/routes/acl.routes.ts` — `GET /permissions` (admin/sub_admin/member), `PATCH /permissions` (admin only)
- `backend/src/middleware/acl.middleware.ts` — `requirePermission(module, action)` factory; admin short-circuits (always allowed); sub_admin/member check DB cache; all other roles get 403

**Backend Modified Files**
- `backend/src/middleware/role.middleware.ts` — `AppRole` type exported; `sub_admin` and `member` accepted as valid roles
- `backend/src/app.ts` — `aclRoutes` registered at `/api/v1/acl`

**Frontend New Files**
- `frontend/src/api/acl.ts` — `aclApi.getPermissions()`, `aclApi.updatePermissions()`; `PermissionModule`, `PermissionEntry`, `AclRole`, `AclMatrix` types; `toPermissionMap()` helper
- `frontend/src/hooks/usePermissions.ts` — `usePermissions()` hook: `hasPermission()`, `canView()`, `canCreate()`, `canEdit()`, `canDelete()`, `canExport()`
- `frontend/src/pages/admin/ACLSettings.tsx` — full ACL matrix UI: role tabs (Sub-Admin / Member), 19-row permission table, V/C/E/D/X toggle buttons, "All" column toggle, canView dependency enforcement, save with dirty tracking + unsaved-change guard, success banner
- `frontend/src/pages/UnauthorizedPage.tsx` — 403 page with role-aware "Go to Dashboard" button

**Frontend Modified Files**
- `frontend/src/types.ts` — `AppRole` type exported; `AuthUser.role` updated to include `sub_admin` and `member`
- `frontend/src/context/AuthContext.tsx` — `PermissionsMap` type; `permissions` state; `setPermissions()`; `isSubAdmin`, `isMember`, `isAdminPanelUser` computed flags; permissions persisted to localStorage; `buildPermissionsMap()` exported
- `frontend/src/components/ProtectedRoute.tsx` — handles `sub_admin`/`member`; loads ACL from backend on first visit; shows "Loading permissions…" spinner; falls back gracefully on fetch error
- `frontend/src/components/Sidebar.tsx` — `module` field on `NavItem`; `SidebarContent` filters items by `canView(module)` for sub_admin/member; admin always sees all; role-label differentiation (Sub-Admin Portal / Member Portal); `🛡️ Access Control` nav item in System group (admin-only — no module guard)
- `frontend/src/App.tsx` — admin `ProtectedRoute` `allowedRoles` updated to `['admin', 'sub_admin', 'member']`; `/admin/acl-settings` route added; `/unauthorized` route added

---

## Previous Focus (18 Jun 2026)
**Billing Property Map — Bug Fixes & Defaulters Payment Modal** — **COMPLETE** as of 18 Jun 2026.
Fixed 6 bugs in Property Map + Defaulters tab. Added a full payment modal (mode + reference + notes) in Defaulters tab instead of one-click pay.

## What Was Just Done (18 Jun 2026 — Defaulters Tab Payment Modal)

### Problem Solved
- Previous one-click pay buttons in Defaulters tab caused accidental payments ("i clicked on the due month and it marked as pay")
- Replaced direct `onQuickPay()` calls with a proper payment modal requiring explicit confirmation

### Defaulters Tab — Payment Modal (Final Implementation)
- Month chips are clickable buttons → open a payment modal pre-filled with that single month
- "⚡ Pay All (N months)" button → opens modal with ALL unpaid periods pre-selected
- **Payment modal contents:**
  - Amount summary (total due across selected periods)
  - 4-button payment mode selector (Cash / UPI / Bank Transfer / Cheque) with icons
  - Reference / Transaction ID text input (optional)
  - Notes text input (optional)
  - "✓ Confirm Payment" button (disabled while `quickPayPending`)
- Notes combining: `Ref: ${ref} | ${notes}` (omits blank parts)
- Modal auto-closes after payment completes using `useRef` pattern:
  - `didSubmitRef.current = true` set in `submitPay()` just before calling `onQuickPay()`
  - `useEffect([quickPayPending])` — closes modal only when `didSubmitRef.current` is true
  - Prevents false close on mount (when `quickPayPending` is `false` initially)

### `PayIntent` Interface (local to DefaultersTab)
```ts
interface PayIntent {
  flatId: string
  flatNumber: string
  periods: { month: number; year: number }[]
  totalAmount: number
}
```

### Files Modified (18 Jun 2026 — Session 2)
- `frontend/src/components/admin/billing/DefaultersTab.tsx` — full rewrite: `PayIntent`, `PayForm` interfaces; `openPayModal()`, `submitPay()` helpers; `didSubmitRef` for safe auto-close; full payment modal JSX

## What Was Done Earlier (18 Jun 2026 — Property Map Bug Fixes)

### 6 Bugs Fixed

**Bug 1 — Drawer stale after payment:**
- Added `useEffect` in `PropertyMapTab` watching `floorData` — re-syncs `selectedFlat` from updated data after `invalidateAll()` refetch
- Drawer now auto-shows paid state immediately after quick pay

**Bug 2 — Paid state had no next actions:**
- Pay tab paid state now shows ✅ confirmation + "💰 Record Advance Payment" + "📄 Create New Bill" buttons
- "Record Advance Payment" toggles `AdvancePayPanel` inline with `← Back`
- `no_bill` flats with `cumulativeDue > 0` show red arrears banner + "View Billing History & Pay →" before advance form

**Bug 3a — Tile blank for no_bill flats with past arrears:**
- `tileAmount()` now returns `₹{cumulativeDue}` for `no_bill` flats when `cumulativeDue > 0` (colored red)

**Bug 3b — No Pay button when single unpaid month is a past month:**
- `BillingHistoryTable` now computes `singlePastUnpaidRow` — when `unpaidMonths === 1` and not current month, shows "💳 Pay [MonthName]" for that past bill

**Bug 3c — Orange arrears badge missing for 1 unpaid month:**
- Changed `unpaidMonths > 1` → `unpaidMonths >= 1` for badge threshold

**Bug 3d — Single-month defaulters not in Defaulters tab:**
- `getDefaulters()` backend: changed `flatBills.length < 2` → `flatBills.length < 1`
- Flats with even 1 unpaid month now appear in Defaulters

### Files Modified (18 Jun 2026 — Session 1)
- `frontend/src/components/admin/billing/PropertyMapTab.tsx` — 6 bug fixes (useEffect sync, tileAmount, arrears badge, BillingHistoryTable pay buttons, paid state CTAs, no_bill arrears panel)
- `frontend/src/pages/admin/Billing.tsx` — passes `onQuickPay`/`quickPayPending` to `DefaultersTab`
- `backend/src/services/billing.service.ts` — `getDefaulters()` threshold 2 → 1

## Next Steps
- Continue Property Map UX improvements, or
- Move to Sprint 6: Vendor management, AMC, Events calendar

---

## What Was Just Done (17 Jun 2026 Evening — Billing History Sprint)

### Feature: Complete Billing History in Property Map Flat Drawer

#### Problem Solved
1. Flat tiles were showing only the selected month's amount — misleading when a flat had 4+ months of arrears
2. Clicking a tile opened a drawer showing only the current month — no historical context
3. New sub-admins had no way to see full paid/unpaid history for a flat from this view

#### Backend Changes
- **`billing.service.ts` — `getFloorStatus()` (line 377)**:
  - Previously fetched only the selected month's bill for each flat
  - Now fetches ALL bills via `maintenanceBills: { include: { payment: true } }`
  - Computes `cumulativeDue` = sum of `(amount + lateFee)` for all unpaid/overdue bills
  - Computes `unpaidMonths` = count of unpaid/overdue bills across all time
  - Both new fields returned alongside existing per-month fields
- **`billing.service.ts` — `getFlatBillingHistory()` (line 453) [NEW]**:
  - Fetches all bills for a flat, newest first
  - Computes per-bill: `amount`, `lateFee`, `totalDue`, `status`, `dueDate`, `paidOn`, `paidAmount`, `paymentMode`
  - Returns flat metadata + `cumulativeDue`, `unpaidMonths`, `totalPaid`, `totalBills`, `bills[]`
- **`billing.controller.ts` — `getFlatBillingHistoryHandler` (line 154) [NEW]**:
  - Thin handler: `req.params.flatId` → `billingService.getFlatBillingHistory(flatId, societyId)`
- **`billing.routes.ts` — `GET /flat/:flatId` (line 246) [NEW]**:
  - Registered **BEFORE** the `/:id` param route (line 274) to avoid Express treating "flat" as an ID

#### Frontend API Changes (`frontend/src/api/billing.ts`)
- **`FlatBillStatus` interface**: added `cumulativeDue: number` + `unpaidMonths: number`
- **`FlatBillHistoryRow` interface [NEW]**: per-bill row shape (billId, month, year, amount, lateFee, totalDue, status, dueDate, paidOn, paidAmount, paymentMode)
- **`FlatBillingHistory` interface [NEW]**: full response shape from `GET /billing/flat/:flatId`
- **`billingApi.getFlatHistory(flatId)` [NEW]**: calls `GET /billing/flat/${flatId}`

#### Frontend UI Changes (`frontend/src/components/admin/billing/PropertyMapTab.tsx`)
**Flat Tile:**
- `tileAmount(flat)` now shows `cumulativeDue` (total across all unpaid months) instead of single-month `totalDue`
- Orange arrears badge (absolute top-left) shows `unpaidMonths` count when `> 1`
- Tile tooltip updated to show `₹X total due` using `cumulativeDue`
- Block/floor summary bar uses `cumulativeDue` per flat for aggregate totals

**Drawer — New Tab Layout:**
- "📋 Billing History" tab (default) + "💳 Pay" tab — replaces old single-view drawer
- History tab: `useQuery` fetches `billingApi.getFlatHistory(flatId)` on drawer open; `staleTime: 30_000`
- **`BillingHistoryTable` sub-component [NEW]**:
  - Red banner when `cumulativeDue > 0` showing total outstanding + "⚡ Pay All (N)" button (calls `onPayAllUnpaid`)
  - Green banner when all paid showing total collected
  - Scrollable list of all bills (newest first), max-h `14rem`
  - Each row: month+year, status badge, base amount + late fee, paid date + mode (if paid) OR total due (if unpaid)
  - Blue ring highlight on row matching currently selected `month/year` ("Selected" badge)
- Quick action CTA at bottom of history tab (Pay → / Advance Pay → / Create Bill depending on status)

**Pay Tab** (unchanged — single-month quick pay + advance pay panels)

### Files Modified (17 Jun 2026 Evening — Billing History Sprint)
- `backend/src/services/billing.service.ts` — `getFloorStatus()` now fetches all bills + computes cumulative; added `getFlatBillingHistory()`
- `backend/src/controllers/billing.controller.ts` — added `getFlatBillingHistoryHandler`
- `backend/src/routes/billing.routes.ts` — added `GET /flat/:flatId` before `/:id`
- `frontend/src/api/billing.ts` — updated `FlatBillStatus`; added `FlatBillHistoryRow`, `FlatBillingHistory`, `billingApi.getFlatHistory()`
- `frontend/src/components/admin/billing/PropertyMapTab.tsx` — full rewrite: `BillingHistoryTable` sub-component, drawer tab layout, cumulative tile amounts, arrears badge, history `useQuery`

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (17 Jun 2026 — Quick Pay + Advance Pay Sprint)

### Feature: ⚡ Quick Pay from Property Map (unpaid/overdue flats)
- **Backend**: `POST /api/v1/billing/quick-pay` — new endpoint that takes `flatId`, `periods[]`, `paymentMode`, optional `amountPaid`, optional `notes`
- **Backend DTO**: `quickPaySchema` + `QuickPayDto` type in `backend/src/dtos/billing.dto.ts`
- **Backend Service**: `quickPay(dto, societyId)` in `billing.service.ts` — for each period: finds existing bill → skips if already paid → creates bill if none exists (dueDate = 10th of month) → records payment + marks paid, all in one `$transaction`; returns `{ flatNumber, totalPeriods, paid, skipped, totalAmountPaid, rows[] }`
- **Backend Controller**: `quickPayHandler` in `billing.controller.ts`
- **Backend Route**: `POST /billing/quick-pay` registered BEFORE `/:id` routes in `billing.routes.ts`
- **Frontend API**: `QuickPayDto` + `QuickPayResult` interfaces + `billingApi.quickPay()` in `frontend/src/api/billing.ts`
- **Frontend UI**: Clicking any unpaid/overdue flat tile opens a drawer with:
  - Amount + status badge strip (red for overdue, yellow for unpaid)
  - 4-button payment mode selector (Cash/UPI/Bank/Cheque) with icons
  - Notes input (optional)
  - **"💳 Mark ₹X as Paid" button** — one-tap payment recording
  - Escape hatch: "Enter a different amount or date →" opens full `RecordPaymentModal`
- **Frontend orchestrator**: `quickPayMutation` in `Billing.tsx` — calls `billingApi.quickPay()`, invalidates all billing queries, shows toast with paid/skipped summary

### Feature: 💰 Advance Payment from Property Map (no_bill flats)
- Clicking a flat with no bill opens advance payment panel:
  - **Mode toggle**: "📅 Date Range" vs "☑️ Pick Months"
  - **Range mode**: From/To month+year dropdowns with live period count summary
  - **Pick mode**: 13-month checkbox grid (6 months before + current + 6 months after selected month)
  - **Amount per month** input (optional — auto-calculated from settings if blank)
  - Payment mode selector (same 4 icons)
  - "💰 Save Advance Payment (N months)" button — disabled when no periods selected
  - Escape hatch: "📄 Create Bill for this Flat First" button → opens `SingleBillModal`

### Files Modified/Created (17 Jun 2026 — Quick Pay Sprint)
- `backend/src/dtos/billing.dto.ts` — added `quickPaySchema`, `QuickPayDto`
- `backend/src/services/billing.service.ts` — added `quickPay()` function
- `backend/src/controllers/billing.controller.ts` — added `quickPayHandler`
- `backend/src/routes/billing.routes.ts` — registered `POST /quick-pay` before `/:id`
- `frontend/src/api/billing.ts` — added `QuickPayDto`, `QuickPayResult`, `billingApi.quickPay()`
- `frontend/src/components/admin/billing/PropertyMapTab.tsx` — **full rewrite**: added `QuickPayForm` state interface, `onQuickPay`/`quickPayPending` props, inline quick-pay drawer panel (unpaid/overdue), advance payment drawer panel (no_bill), pick-month grid, range mode selectors
- `frontend/src/pages/admin/Billing.tsx` — added `QuickPayDto` import, `quickPayMutation`, passed `onQuickPay`/`quickPayPending` props to `PropertyMapTab`

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (17 Jun 2026 — Billing Page UX Sprint)

**Billing Page UX Overhaul** — **COMPLETE** as of 17 Jun 2026.
Comprehensive 8-group improvement sprint to make the admin Billing page easier to use for non-technical users (society treasurers, office staff).

## What Was Just Done (17 Jun 2026 — Billing Page UX Sprint)

### 8 Improvement Groups — All Implemented

**Group 1 — Resident Identity in Bills List**
- **Backend**: `getBills()` in `billing.service.ts` now includes `flat.residents` (active, take: 1) in query
- **Backend**: `billing.transformer.ts` — `BillWithRelations` includes residents; `transformBill()` extracts `residentName` + `residentPhone`
- **Frontend types**: `MaintenanceBill` in `types/index.ts` now has `residentName?: string | null`, `residentPhone?: string | null`, `floor?: number | null`
- **Frontend `BillsTab.tsx`**: Resident column now shows actual name; overdue rows show 💬 WhatsApp button (opens `wa.me/phone`)
- **`billingHelpers.ts`**: `exportCSV()` includes `Resident` column with `b.residentName ?? ''`

**Group 2 — Friendly Confirm Dialogs (no more `window.confirm()`)**
- `BillingModals.tsx`: New `ConfirmModal` component — modal with icon, title, message, destructive action button
- `BillsTab.tsx`: All delete/cancel actions call `onConfirm` prop instead of `window.confirm()`
- `Billing.tsx`: `confirmState` + `askConfirm()` helper; all destructive actions use `ConfirmModal`

**Group 3 — Smarter Payment Recording**
- `RecordPaymentModal` in `BillingModals.tsx`: Amount breakdown panel showing base + late fee + total
- "💯 Pay Full ₹X" quick-fill button sets amount to exact `totalDue`
- Icon-button payment mode selector (UPI/Cash/Bank/Cheque)
- `Billing.tsx` passes `baseAmount` and `totalDue` props to modal

**Group 4 — Clickable KPI Cards**
- `Billing.tsx`: KPI cards for Outstanding (unpaid) and Overdue are now clickable
- Click Outstanding → switches to Bills tab + sets filter to `unpaid`
- Click Overdue → switches to Bills tab + sets filter to `overdue`
- Visual hover state: `cursor-pointer hover:ring-2 ring-blue-300` on clickable cards

**Group 5 — 6-Month Collection Trend Chart**
- New `BillingTrendChart.tsx` sub-component — pure div-height bar chart (no new dependencies)
- Uses existing `billingApi.getMonthlyTrend(6)` endpoint
- Shows green (collected) vs gray (total billed) bars per month
- Hover tooltip showing exact amounts; trend % summary footer
- Skeleton loading state; toggle via `📈 Trend` button in Billing page header

**Group 6 — Generate Bills Preview**
- `GenerateBillsModal` in `BillingModals.tsx`: Preview info box showing:
  - Occupied flats count (from `GET /api/v1/flats?status=occupied`)
  - Bills already generated for current period
  - How many new bills will be created
- `Billing.tsx`: `genSummaryQuery` + `flatsCountQuery` prefetch; props `occupiedCount`, `existingCount`, `willGenerate` passed to modal

**Group 7 — Better Bills Table UX**
- `BillsTab.tsx`: Aging days merged into Status badge as sub-text (single column instead of two)
- Debounced client-side text search (300ms) by flat number or resident name
- colSpan updated to 10 columns

**Group 8 — Shared PrintBillModal (DRY)**
- New `frontend/src/components/shared/PrintBillModal.tsx` — single source of truth for print bill modal
- `frontend/src/components/admin/billing/PrintBillModal.tsx` — now a single-line re-export
- `frontend/src/pages/resident/Bills.tsx` — removed 150-line inline `PrintBillModal` function; now imports from shared component

### Files Modified/Created (17 Jun 2026 — Billing UX Sprint)
- `backend/src/services/billing.service.ts` — `getBills()` includes `flat.residents`
- `backend/src/transformers/billing.transformer.ts` — `residentName` + `residentPhone` in `transformBill()`
- `frontend/src/types/index.ts` — `MaintenanceBill`: added `residentName`, `residentPhone`, `floor` fields
- `frontend/src/components/admin/billing/billingHelpers.ts` — `exportCSV()` includes Resident column
- `frontend/src/components/admin/billing/BillingModals.tsx` — `ConfirmModal`, enhanced `RecordPaymentModal`, enhanced `GenerateBillsModal`
- `frontend/src/components/admin/billing/BillsTab.tsx` — debounced search, merged aging+status, WhatsApp button, `onConfirm` prop
- `frontend/src/components/admin/billing/BillingTrendChart.tsx` — NEW: 6-month div-height bar chart
- `frontend/src/components/admin/billing/PrintBillModal.tsx` — re-export stub pointing to shared
- `frontend/src/components/shared/PrintBillModal.tsx` — NEW: shared print modal (admin + resident)
- `frontend/src/pages/admin/Billing.tsx` — all groups integrated: confirm state, trend toggle, gen preview props, clickable KPI cards
- `frontend/src/pages/resident/Bills.tsx` — inline PrintBillModal removed; imports shared component

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (17 Jun 2026 — Bulk Resident/Staff/Helper Entry Sprint)

**Bulk Entry for Residents, Staff & Helpers** — **COMPLETE** as of 17 Jun 2026.
Added spreadsheet-style bulk entry pages for Residents, Staff, and Helpers, following the same pattern as BulkExpenseEntry.

## What Was Just Done (17 Jun 2026 — Bulk Resident/Staff/Helper Entry Sprint)

### Bulk Entry for Residents (`POST /api/v1/residents/bulk`)
- **DTO**: `bulkCreateResidentsSchema` in `backend/src/dtos/resident.dto.ts` — array of up to 100 items; optional `username`+`password` pair validated with Zod `.refine()` (both must be present or both absent)
- **Service**: `bulkCreateResidents(dto, societyId)` in `resident.service.ts` — loops per-row, validates flat belongs to society, checks email + username uniqueness, creates resident + optional user in transaction, marks flat occupied
- **Controller**: `bulkCreateResidentsHandler` in `resident.controller.ts` — Zod `safeParse`, passes `req.user!.societyId`
- **Route**: `POST /api/v1/residents/bulk` registered BEFORE `/:id` in `resident.routes.ts`
- **Frontend API**: `residentsApi.bulkCreate(residents)` + `BulkResidentItem`, `BulkResidentResult` interfaces in `frontend/src/api/residents.ts`
- **Frontend page**: `frontend/src/pages/admin/BulkResidentEntry.tsx` — spreadsheet table with flat dropdown (all flats fetched), type selector, move-in date, optional username/password columns; sticky summary bar
- **Bulk Entry button**: `⚡ Bulk Entry` (purple) added to Residents.tsx header

### Bulk Entry for Staff (`POST /api/v1/staff/bulk`)
- **DTO**: `bulkCreateStaffSchema` in `backend/src/dtos/staff.dto.ts`
- **Service**: `bulkCreateStaff(societyId, dto)` in `staff.service.ts` — checks username uniqueness, creates staff + optional security user in transaction
- **Controller**: `bulkCreateStaffHandler` in `staff.controller.ts`
- **Route**: `POST /api/v1/staff/bulk` registered BEFORE `/:id` in `staff.routes.ts`
- **Frontend API**: `staffApi.bulkCreate(staff)` + interfaces in `frontend/src/api/staff.ts`
- **Frontend page**: `frontend/src/pages/admin/BulkStaffEntry.tsx` — role/shift dropdowns, optional login credentials
- **Bulk Entry button**: `⚡ Bulk Entry` (purple) added to Staff.tsx header

### Bulk Entry for Helpers (`POST /api/v1/helpers/bulk`)
- **DTO**: `bulkCreateHelpersSchema` in `backend/src/dtos/helper.dto.ts`
- **Service**: `bulkCreateHelpers(dto, addedBy, societyId)` in `helper.service.ts` — uses `(prisma as any).helper` pattern
- **Controller**: `bulkCreateHelpersHandler` in `helper.controller.ts` — passes `req.user!.userId` as `addedBy`
- **Route**: `POST /api/v1/helpers/bulk` registered BEFORE `POST /` in `helper.routes.ts`
- **Frontend API**: `bulkCreateHelpers(helpers)` function + interfaces in `frontend/src/api/helpers.ts`
- **Frontend page**: `frontend/src/pages/admin/BulkHelperEntry.tsx` — category dropdown from `HELPER_CATEGORIES`, phone + alt phone + email + description fields, Active checkbox
- **Bulk Entry button**: `⚡ Bulk Entry` (purple) added to Helpers.tsx header

### Routes Registered in App.tsx
- `/admin/resident-bulk-entry` → `AdminBulkResidentEntry`
- `/admin/staff-bulk-entry` → `AdminBulkStaffEntry`
- `/admin/helper-bulk-entry` → `AdminBulkHelperEntry`

### Files Modified/Created (17 Jun 2026 — Bulk Entity Sprint)
- `backend/src/dtos/resident.dto.ts` — added `bulkCreateResidentsSchema`, `BulkCreateResidentsDto`
- `backend/src/dtos/staff.dto.ts` — added `bulkCreateStaffSchema`, `BulkCreateStaffDto`
- `backend/src/dtos/helper.dto.ts` — added `bulkCreateHelpersSchema`, `BulkCreateHelpersDto`
- `backend/src/services/resident.service.ts` — added `bulkCreateResidents()`, result interfaces
- `backend/src/services/staff.service.ts` — added `bulkCreateStaff()`, result interfaces
- `backend/src/services/helper.service.ts` — added `bulkCreateHelpers()`, result interfaces
- `backend/src/controllers/resident.controller.ts` — added `bulkCreateResidentsHandler`
- `backend/src/controllers/staff.controller.ts` — added `bulkCreateStaffHandler`
- `backend/src/controllers/helper.controller.ts` — added `bulkCreateHelpersHandler`
- `backend/src/routes/resident.routes.ts` — registered `POST /bulk` before `/:id`
- `backend/src/routes/staff.routes.ts` — registered `POST /bulk` before `/:id`
- `backend/src/routes/helper.routes.ts` — registered `POST /bulk` before `POST /`
- `frontend/src/api/residents.ts` — added `bulkCreate()`, bulk interfaces
- `frontend/src/api/staff.ts` — added `bulkCreate()`, bulk interfaces
- `frontend/src/api/helpers.ts` — added `bulkCreateHelpers()`, bulk interfaces
- `frontend/src/pages/admin/BulkResidentEntry.tsx` — NEW bulk entry page
- `frontend/src/pages/admin/BulkStaffEntry.tsx` — NEW bulk entry page
- `frontend/src/pages/admin/BulkHelperEntry.tsx` — NEW bulk entry page
- `frontend/src/pages/admin/Residents.tsx` — added `useNavigate` + `⚡ Bulk Entry` button
- `frontend/src/pages/admin/Staff.tsx` — added `useNavigate` + `⚡ Bulk Entry` button
- `frontend/src/pages/admin/Helpers.tsx` — added `useNavigate` + `⚡ Bulk Entry` button
- `frontend/src/App.tsx` — added 3 new bulk entry imports + routes

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (17 Jun 2026 — Expense Import + Bulk Entry Sprint)

### Feature 1: CSV Import (`📤 Import CSV` button on Expenses page)
- **Backend**: `POST /api/v1/expenses/import` — accepts `{ csv: string }` JSON body; parses CSV in-memory; validates each row (title, date, amount, category slug); skips blank rows; processes rows individually (one bad row doesn't abort rest); returns `{ total, imported, skipped, errors, rows[] }`
- **Backend**: `importExpensesFromCsv()` in `expense.service.ts` — quoted-field-safe CSV parser `parseCsvLine()`; validates category slugs against active categories in DB; uses `(prisma as any).expenseCategory` + `.expense` pattern
- **Frontend modal**: `frontend/src/components/admin/expenses/ExpenseImportModal.tsx` — drag-and-drop file upload, format guide, template download, per-row result table with colour-coded status
- **CSV format**: `Title,Date,Amount,Category,Vendor,Notes` (header required; Date=YYYY-MM-DD; Category=active slug)

### Feature 2: Bulk Entry Page (`📋 Bulk Entry` button on Expenses page)
- **Route**: `/admin/expense-bulk-entry` (no sidebar entry — linked via Expenses header button)
- **Page**: `frontend/src/pages/admin/BulkExpenseEntry.tsx` — 10 empty rows by default; spreadsheet-style inline table; Add Row / Add 5 / Add 10 buttons; per-row status indicators (✓/✕/⋯)
- **Backend**: `POST /api/v1/expenses/bulk` — accepts `{ expenses: CreateExpenseDto[] }` (max 100); processes individually; returns `{ total, created, errors, rows[] }`
- **Sticky summary bar**: dark bar at bottom; shows Total Rows / Filled / Valid / Errors + live total ₹ amount + "Save N Expenses" button
- **Success flow**: shows green banner + "Go to Expenses →" link after all rows saved

### Files Modified/Created (17 Jun 2026)
- `backend/src/dtos/expense.dto.ts` — added `bulkCreateExpensesSchema`, `importExpensesBodySchema`, `BulkCreateExpensesDto`
- `backend/src/services/expense.service.ts` — added `bulkCreateExpenses()`, `importExpensesFromCsv()`, `parseCsvLine()`, result interfaces
- `backend/src/controllers/expense.controller.ts` — added `bulkCreateExpensesHandler`, `importExpensesHandler`
- `backend/src/routes/expense.routes.ts` — added `POST /bulk` + `POST /import` routes (before `/:id` param routes)
- `frontend/src/api/expenses.ts` — added `bulkCreate()`, `importCsv()`, `downloadTemplate()`, result type interfaces
- `frontend/src/components/admin/expenses/ExpenseImportModal.tsx` — new import modal component
- `frontend/src/pages/admin/BulkExpenseEntry.tsx` — new full-page bulk entry
- `frontend/src/pages/admin/Expenses.tsx` — added `useNavigate`, `showImportModal` state, Import CSV + Bulk Entry + Add Expense buttons in header, `ExpenseImportModal` render
- `frontend/src/App.tsx` — added `AdminBulkExpenseEntry` import + `/admin/expense-bulk-entry` route

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (16 Jun 2026 — Bulk Setup Sprint)

**Bulk Property Setup Improvements** — **COMPLETE** as of 16 Jun 2026.
Enhanced the 4-step bulk setup wizard with 7 UX improvements.

## What Was Just Done (16 Jun 2026 — Bulk Setup Sprint)

### Improvements Implemented

**1. Unit Start Number (`unitStartNumber: number`)**
- `FloorRangeForm` and `BulkSetupConfig` now carry `unitStartNumber` (default 1)
- New `computeEffectiveSuffix(suffix, unitIdx, unitStartNumber)` helper in `bulkSetupHelpers.ts`
- For numeric suffixes: shifts by `unitStartNumber - 1 + unitIdx` offset (e.g. start=5, units 3 → suffixes 05, 06, 07)
- Non-numeric suffixes (letters) are left unchanged

**2. No Prefix Checkbox**
- `FloorRangeForm` now has `noPrefix: boolean` field (default `false`)
- When checked: flat number is `{floor}{suffix}` (e.g. `101`) instead of `{prefix}-{floor}{suffix}` (e.g. `A-101`)
- `buildFlatNumber(prefix, floor, suffix, noPrefix)` updated to 4-arg signature
- Useful when adding flats to an existing block with a different numbering scheme

**3. FloorTemplateEditor Preview Fix**
- `FloorTemplateEditor` now receives `prefix`, `noPrefix`, `startFloor`, `unitStartNumber` props
- Preview column header: `Preview (Floor {startFloor})` instead of hardcoded `Preview`
- Preview cells use real `buildFlatNumber` + `computeEffectiveSuffix` instead of `{block}-1{suffix}`

**4. BulkPreviewGrid Inline Editing**
- Clicking any "new" (non-conflicting) flat tile enters inline edit mode
- `<input>` appears in the tile; blur/Enter commits, Escape cancels
- Renamed flat numbers tracked in `flatNumberOverrides: Map<string, string>` in the orchestrator
- Overrides cleared via `useEffect` whenever config changes (block, prefix, floors, units)
- Null floor → key `'nofloor'` → label "Row Houses / No Floor" (not "Ground")
- All floors displayed via `floorLabel(n)` from `constants/labels.ts`
- Floor label column widened from `w-16` → `w-28`

**5. BulkResidentEntry Credentials Toggle**
- Added `showCredentials: boolean` field to per-row state (default `false`)
- `🔑 Login` / `🔒 Hide` toggle button per row in new "Login?" column
- Credentials (username + password) appear as an expandable sub-row below the resident row
- Hiding credentials clears the username/password values
- Table is now 7 columns wide (removed separate credential columns from header)

**6. "View in Properties" with blockId filter**
- Success screen "View in Properties →" button navigates to `/admin/properties?blockId={blockId}`
- `Properties.tsx` reads `useSearchParams()` on mount and seeds `filterBlock` from `?blockId=`
- Property table auto-filters to the just-created block

**7. Summary always visible + improved limits**
- FloorRangeConfig summary box shows unit count even when no block is selected
- `startFloor` max raised 10 → 200 (for tall buildings)
- `floorCount` max raised 50 → 100

### Files Modified (16 Jun 2026)
- `frontend/src/components/admin/bulkSetup/bulkSetupHelpers.ts` — `computeEffectiveSuffix()`, `buildFlatNumber()` 4-arg, `noPrefix`/`unitStartNumber` in `BulkSetupConfig`
- `frontend/src/components/admin/bulkSetup/FloorRangeConfig.tsx` — `noPrefix` + `unitStartNumber` fields + UI; summary always shown; raised limits; `units` prop instead of `unitSuffixExample`
- `frontend/src/components/admin/bulkSetup/FloorTemplateEditor.tsx` — `prefix`/`noPrefix`/`startFloor`/`unitStartNumber` props; real preview
- `frontend/src/components/admin/bulkSetup/BulkPreviewGrid.tsx` — inline tile editing via `onFlatNumberChange` prop; `floorLabel()` for floor display; null-floor key fix; wider label column
- `frontend/src/components/admin/bulkSetup/BulkResidentEntry.tsx` — collapsible credentials per row; `showCredentials` state; `🔑 Login` toggle; expandable sub-row
- `frontend/src/pages/admin/BulkPropertySetup.tsx` — `flatNumberOverrides` state + `useMemo` config + `handleFlatNumberChange` + all new props plumbed; `navigate` to properties with blockId
- `frontend/src/pages/admin/Properties.tsx` — `useSearchParams()` + `useEffect` to seed `filterBlock` from `?blockId=` URL param on mount

## Next Steps
- Sprint 5: Sub-Admin + Member Roles + ACL Matrix (roadmap)
- Or continue UI polishing of existing features

---

## What Was Just Done (15 Jun 2026 — Multi-Tenancy Isolation Fix)

**All 20 controller/service pairs now properly scope data by `req.user!.societyId` from JWT.**

## What Was Just Done (15 Jun 2026 — Multi-Tenancy Isolation Fix)

### Root Cause
All services had a hardcoded `const SOCIETY_ID = 1` or `societyId: 1` literal. When a new society registered via the onboarding wizard and its admin logged in, their JWT carried `societyId = 2` (or N), but every query still returned data for society 1.

### Fix Pattern Applied
1. **Services** — Every data-fetching/creating function now accepts `societyId: number = 1` as a parameter (default preserves backward compat).
2. **Controllers** — Extract `req.user!.societyId` from JWT and pass to service.
3. **Indirect scoping** — Models without a direct `societyId` column (Resident, Complaint, Visitor) are scoped via their parent Flat: `where: { flat: { societyId } }`.

### Files Modified (20 controllers + their services)
- `block.controller.ts` + `block.service.ts` — `getAllBlocks`, `getBlockById`, `createBlock`, `updateBlock`, `deleteBlock`
- `settings.controller.ts` + `settings.service.ts` — `getSettings`, `updateSettings`
- `billing.controller.ts` + `billing.service.ts` — all 11 billing functions
- `auth.service.ts` — `require_2fa` lookup uses `user.societyId` (not hardcoded 1)
- `resident.controller.ts` + `resident.service.ts` — `getAllResidents` scopes via `flat: { societyId }`
- `finance.controller.ts` + `finance.service.ts` — `getMonthlySummary`, `getMonthlyReport`
- `visitor.controller.ts` + `visitor.service.ts` — `getVisitors`, `getTodaysVisitors` scope via `flat: { societyId }`
- `complaint.controller.ts` + `complaint.service.ts` — `getAllComplaints` scopes via `flat: { societyId }`
- `invoice.controller.ts` + `invoice.service.ts` — `getInvoices`, `createInvoice`, `generateInvoiceNumber`
- `event.controller.ts` + `event.service.ts` — `getEvents`, `createEvent`
- `helper.controller.ts` + `helper.service.ts` — `getHelpers`, `createHelper`
- `note.controller.ts` + `note.service.ts` — `getNotes`, `createNote`
- `vendor.controller.ts` + `vendor.service.ts` — `getVendors`, `createVendor`, `getContracts`, `createContract`
- `expense-category.controller.ts` + `expense-category.service.ts` — `listCategories`, `createCategory`, `deleteCategory`
- `import.controller.ts` + `import.service.ts` — `importResidents`
- Already correct (no changes needed): `notice`, `notification` — they already received `societyId` as first param

### Multi-Tenancy Invariant (enforce going forward)
> **Every new controller handler that queries or creates data MUST pass `req.user!.societyId` to its service function. Never hardcode `societyId: 1`.**

---

## What Was Just Done (15 Jun 2026 — Sprint 4: Society Onboarding Wizard)

### Full 7-Step Self-Service Signup Wizard

**New DB Changes (migration `20260616_onboarding`):**
- `SocietyStatus` enum: `pending | setup | active | suspended`
- 5 new fields on `Society`: `status`, `setupToken`, `setupTokenExpiry`, `logoUrl`, `activatedAt`
- `OnboardingSession` model: `societyId`, `currentStep`, `step1Data`, `step2Data`, `step3Data`, `step4Data`, `completedAt`

**New Backend Files:**
- `backend/prisma/migrations/20260616_onboarding/migration.sql`
- `backend/src/dtos/onboarding.dto.ts` — `registerSocietySchema`, `step1ProfileSchema`, `step2AdminSchema`, `step3BillingSchema`
- `backend/src/transformers/onboarding.transformer.ts` — strips `setupToken`, shapes session
- `backend/src/services/onboarding.service.ts` — 7 methods: register, validateToken, saveStep1–3, getProgress, activateSociety
- `backend/src/controllers/onboarding.controller.ts` — thin handlers
- `backend/src/routes/onboarding.routes.ts` — 7 routes; `loginRateLimiter` on register

**Modified Backend Files:**
- `backend/prisma/schema.prisma` — new enum + fields + model
- `backend/prisma/seed.ts` — `status: 'active'` on society upsert
- `backend/src/utils/email.utils.ts` — added `sendSetupInvite(email, token, societyName)`
- `backend/src/app.ts` — registered `/api/v1/onboarding` router

**New Frontend Files (all in `frontend/src/components/onboarding/`):**
- `RegisterPage.tsx` — public `/register` page
- `OnboardingLayout.tsx` — full-screen branded layout (no sidebar/navbar)
- `StepIndicator.tsx` — 7-step progress pill bar + exports `STEPS` constant
- `Step1SocietyProfile.tsx` — society name/address/contact form
- `Step2AdminAccount.tsx` — admin account with password strength meter
- `Step3BillingConfig.tsx` — billing config with live preview
- `Step4BlockStructure.tsx` — inline block builder via `POST /api/v1/blocks`
- `Step5PropertySetup.tsx` — bulk setup launcher or skip
- `Step6ResidentImport.tsx` — CSV import or skip
- `Step7ReviewActivate.tsx` — summary + activate + animated celebration
- `OnboardingShell.tsx` — orchestrator at `/setup/:token`; owns all state + step transitions

**Modified Frontend Files:**
- `frontend/src/api/onboarding.ts` — Axios API layer with all types + `OnboardingProgress` alias
- `frontend/src/App.tsx` — added `/register` + `/setup/:token` public routes
- `frontend/src/pages/LoginPage.tsx` — "Register your society →" link below login form
- `frontend/src/pages/admin/Dashboard.tsx` — amber `sticky top-0` setup-incomplete banner when `society.status === 'setup' | 'pending'`

**Key Technical Notes:**
- `setupToken` is `crypto.randomBytes(32).toString('hex')` — NOT a JWT; 48h expiry
- Steps 1–2 are token-gated (no JWT required); Step 2 issues JWT; Steps 3–7 use JWT auth
- `(prisma as any).onboardingSession` — stale Prisma types until `prisma generate` runs in container
- `SocietyStatus` default is `'active'` in migration — existing `id=1` row is completely unaffected
- Phantom VS Code TS errors in `components/onboarding/**` — not build errors; `vite build` is authoritative

## Next Steps
Sprint 5 — Sub-Admin + Member Roles + ACL Matrix (or next roadmap priority).

---

## What Was Just Done (15 Jun 2026 — Security Audit Sprint)

### Security Audit & Hardening (OWASP Top 10 + Multi-Tenant)
Full audit of all 28+ API routes. 18 findings (3 CRITICAL, 5 HIGH, 6 MEDIUM, 4 LOW). 15 of 18 fixed immediately. Full report: `memento/security-audit.md`.

**New Files Created:**
- `backend/src/middleware/rate-limit.middleware.ts` — rate limiters (login 10/15min, forgot-pw 5/hr, TOTP 10/15min, global 300/min)
- `backend/src/helpers/society.helper.ts` — `getSocietyId(req)` helper for multi-tenant scoping

**Backend Files Modified:**
- `backend/src/server.ts` — JWT secret strength check at startup; aborts in production if weak
- `backend/src/app.ts` — 1MB JSON body limit, Swagger hidden in production, global rate limiter on `/api/*`
- `backend/src/routes/auth.routes.ts` — rate limiters on login / forgot-password / 2fa-verify
- `backend/src/routes/upload.routes.ts` — `authMiddleware` added (was unauthenticated)
- `backend/src/routes/income.routes.ts` — Zod `validate()` middleware added
- `backend/src/routes/invoice.routes.ts` — Zod `validate()` middleware added
- `backend/src/routes/import.routes.ts` — MIME-only CSV check (removed `originalname` bypass)
- `backend/src/routes/helper.routes.ts` — image MIME type validation on photo upload
- `backend/src/services/complaint.service.ts` — IDOR fix: ownership check via `requestingResidentId`; flatId always resolved from JWT-linked resident (not body)
- `backend/src/controllers/complaint.controller.ts` — passes `residentId` for non-admin calls
- `backend/src/services/visitor.service.ts` — replaced broken raw SQL date filter with `prisma.visitor.groupBy()`
- `backend/src/services/billing.service.ts` — documented hardcoded `societyId: 1` for future migration

**Deferred (future work):**
- CRIT-2: JWT blacklist persistence (needs Redis/DB)
- MED-2: CORS origin restriction (needs `ALLOWED_ORIGINS` env var)
- MED-5: Login session cleanup cron

## What Was Just Done (15 Jun 2026 — Sprint 3 Task 4A: Committee)

### Backend (completed in previous session)
- Added `CommitteeDesignation` enum (8 values), `AchievementCategory` enum (6 values), `Committee`, `CommitteeMember`, `CommitteeAchievement` models to `schema.prisma`
- `backend/src/dtos/committee.dto.ts`, `committee.transformer.ts`, `committee.service.ts`, `committee.controller.ts`, `committee.routes.ts`
- Registered `/api/v1/committees` in `app.ts`; applied schema via `prisma db push`

### Frontend (completed 15 Jun 2026)
- Added `DESIGNATION_LABELS`, `DESIGNATION_COLORS`, `DESIGNATIONS`, `ACHIEVEMENT_CATEGORY_LABELS`, `ACHIEVEMENT_CATEGORY_ICONS`, `ACHIEVEMENT_CATEGORY_COLORS`, `ACHIEVEMENT_CATEGORIES` to `constants/labels.ts`
- `components/admin/committee/CommitteeMemberGrid.tsx` — circular avatar cards, active/inactive split, admin edit/remove
- `components/admin/committee/AchievementTimeline.tsx` — vertical timeline (desc), category badges, admin delete
- `components/admin/committee/PastCommitteesPanel.tsx` — accordion with member/achievement preview, reactivate/delete
- `components/admin/committee/CommitteeModals.tsx` — `CommitteeModal`, `AddMemberModal` (resident search), `AddAchievementModal`, `ConfirmDeleteModal`
- `pages/admin/Committee.tsx` — orchestrator; 3 tabs (Active/Past/Manage); full CRUD
- `pages/resident/Committee.tsx` — read-only hero card + member grid + achievement timeline
- Sidebar: `🏛️ Committee` added to admin and resident Community groups
- `App.tsx`: `/admin/committee` + `/resident/committee` routes registered
- Backend TS: clean. Frontend TS: zero new errors in committee files.

## Next Steps
Continue Sprint 3 — next roadmap task.

## What Was Just Done (13 Jun 2026 — Sprint 2: Auth Overhaul)

### Features Implemented

**2FA / TOTP**
- `totp_secrets` DB table stores secret + backup codes (hashed SHA-256) per user
- `POST /auth/2fa/setup` — generates TOTP secret + QR code PNG (base64), stores as pending
- `POST /auth/2fa/enable` — verifies first TOTP code, activates 2FA, returns 8 one-time backup codes
- `POST /auth/2fa/verify` — exchanges `tempToken` for full JWT during login (accepts TOTP OR backup code)
- `DELETE /auth/2fa` — disables TOTP (requires current code confirmation)
- `GET /auth/2fa/status` — returns `{ isEnabled, backupCodesRemaining }`
- Society-wide `require_2fa` setting in `society_settings` (default `false`)

**Forgot / Reset Password**
- `POST /auth/forgot-password` — looks up email via resident record, sends reset link (console stub if no SMTP configured)
- `POST /auth/reset-password/:token` — validates token + expiry (1 hour), updates password, marks token used
- `password_reset_tokens` DB table; old unused tokens auto-invalidated on new request

**Login Sessions**
- `login_sessions` DB table — records IP, User-Agent, browser/device on every successful login
- `GET /auth/sessions` — returns last 20 sessions for current user
- `DELETE /auth/sessions/:id` — invalidates/revokes a session

**Remember Me**
- `loginSchema` accepts optional `rememberMe: boolean`
- `signAccessToken(payload, rememberMe)` — `JWT_DEFAULT_TTL` (1d) vs `JWT_REMEMBER_TTL` (30d)

**Temp Token (2FA handshake)**
- `signTempToken(userId)` — short-lived (5min) JWT with `{ userId, step: 'totp' }`
- `verifyTempToken(token)` — validates in `verifyTotpLogin` service
- 2FA login flow: `POST /auth/login` returns `{ tempToken, step: 'totp_required' }` → user enters TOTP → `POST /auth/2fa/verify` → full JWT

#### New/Modified Backend Files
- `backend/prisma/schema.prisma` — Added `LoginSession`, `PasswordResetToken`, `TotpSecret` models + back-relations on `User`
- `backend/prisma/migrations/20260613_sprint2_auth_overhaul/migration.sql` — Creates 3 new tables
- `backend/.env` — Added `JWT_DEFAULT_TTL`, `JWT_REMEMBER_TTL`, `APP_BASE_URL`, SMTP vars
- `backend/package.json` — Added `otplib`, `qrcode`, `nodemailer`, `@types/qrcode`, `@types/nodemailer`
- `backend/src/utils/otp.utils.ts` — TOTP helpers using otplib v12 API
- `backend/src/utils/email.utils.ts` — Nodemailer wrapper; console stub fallback when `SMTP_HOST` not set
- `backend/src/utils/jwt.utils.ts` — Added `signTempToken()`, `verifyTempToken()`, `TempTokenPayload`; `rememberMe` param on `signAccessToken()`
- `backend/src/dtos/auth.dto.ts` — Added `forgotPasswordSchema`, `resetPasswordSchema`, `verifyTotpSchema`, `setupTotpSchema`, `disableTotpSchema`; updated `loginSchema` with optional `rememberMe`
- `backend/src/services/auth.service.ts` — Complete rewrite: all new methods + token blacklist + `getMe()`
- `backend/src/controllers/auth.controller.ts` — All new handlers (10 total)
- `backend/src/routes/auth.routes.ts` — All new routes (13 total)
- `backend/prisma/seed.ts` — Added `require_2fa = 'false'` to default settings

#### New Frontend Files
- `frontend/src/types.ts` — `AuthUser` interface (shared type needed by AuthContext + auth.ts)
- `frontend/src/pages/ForgotPasswordPage.tsx` — `/forgot-password` public page; 2-step (form then confirmation)
- `frontend/src/pages/ResetPasswordPage.tsx` — `/reset-password/:token` public page; validates + auto-redirects
- `frontend/src/pages/resident/SecuritySettings.tsx` — 3-tab security page: TOTP setup/disable, login sessions, change password

#### Modified Frontend Files
- `frontend/src/api/auth.ts` — Full rewrite: added `forgotPassword`, `resetPassword`, `setupTotp`, `enableTotp`, `verifyTotpLogin`, `disableTotp`, `getTotpStatus`, `getSessions`, `invalidateSession`; new interfaces `TotpRequiredResponse`, `TotpSetupData`, `TotpStatus`, `LoginSession`
- `frontend/src/pages/LoginPage.tsx` — Added Remember Me checkbox, Forgot Password link, TOTP step (2-step login flow)
- `frontend/src/App.tsx` — Added `/forgot-password`, `/reset-password/:token` public routes; `/resident/security-settings` protected route
- `frontend/src/components/Sidebar.tsx` — Added `🔒 Security` entry under resident "My Account" group

## otplib v12 API Notes (Critical — Do Not Change)
- Import: `import * as otplib from 'otplib'`
- `generateSecret()` — random base32 secret
- `verifySync({ token, secret, type: 'totp' })` — boolean
- `generateSync({ secret, type: 'totp' })` — 6-digit string
- `generateURI({ issuer, label, secret, type: 'totp' })` — otpauth:// URL
- The old `authenticator` export was removed in v12 — do NOT use it

## 2FA Login Flow
```
POST /auth/login → { tempToken, step: 'totp_required' }
  └→ POST /auth/2fa/verify { tempToken, code } → { token, user }
```
If no 2FA: `POST /auth/login → { token, user }` directly.

## Next Steps
- Run `docker compose up --build` to rebuild containers with Sprint 2 migration + new packages
- Sprint 3 from roadmap: Maintenance Requests + Gate Pass Pre-approval

---

## Previous Sprint: 13 Jun 2026 — Sprint 1 (Visitor Enhancement + Helpers Directory)

### Phase A: Visitor Type Enhancement + Filters + CSV Export
Added `VisitorType` enum (13 values) + replaced free-text purpose with structured type. Stats KPI strip, date range + type + exit filters, CSV export, bulk log-exit.

### Phase B: Society Helpers Directory + Storage Service
`Helper` model + file upload infrastructure + full CRUD admin page + read-only resident page.

## Sub-component Pattern
- Sub-components are **purely presentational** — no TanStack Query, no `useMutation`, no API calls
- Page orchestrators own ALL state, queries, mutations, and callbacks
- Sub-components receive data + callbacks as typed props
- All form types are exported from the sub-component file and imported by the page

## Known VS Code Phantom Error Pattern
Every `.tsx` file under `components/admin/**/` shows:
- `Cannot find module 'react'`
- `JSX element implicitly has type 'any'`
- `react/jsx-runtime` not found

This is a VS Code tsserver path resolution limitation for deeply nested new directories. **Not a build error.** Does not affect `vite build` or `tsc --noEmit` run from the project root.