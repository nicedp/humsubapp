# Progress

## What Works (Production Ready)

### Core Infrastructure
- Multi-society capable architecture (societyId=1 for single-society deployment)
- **Account-based multi-tenant login (Sprint 8)** — `accountNumber` (YYYYMMNNN) + `societyUrl` (slug) on Society; `username` uniqueness is compound `[societyId, username]`; login resolves society via `accountNumber` then finds user by `(societyId, username)` — AWS IAM-style
- JWT auth with **DB-persistent token blacklist** (`blacklisted_tokens` table) ← Sprint 5 (CRIT-2 closed)
- Role-based access — 6 roles: admin, sub_admin, member, owner, tenant, security ← Sprint 5
- **Sub-Admin + Member ACL Matrix** — 19-module permission matrix, per-society configurable, cached in-memory ← Sprint 5
- **CORS restricted** to `ALLOWED_ORIGINS` env var ← Sprint 5 (MED-2 closed)
- **Login session auto-cleanup** — rows older than 90 days deleted on every login ← Sprint 5 (MED-5 closed)
- **Remember Me** — 1d default TTL / 30d extended TTL via `rememberMe` flag ← Sprint 2
- **2FA / TOTP** — per-user TOTP with backup codes + optional society-wide enforce ← Sprint 2
- **Forgot/Reset Password** — email token flow (1hr expiry, console stub if no SMTP) ← Sprint 2
- **Login Session Tracking** — IP + browser + device recorded on every login ← Sprint 2
- Prisma ORM + PostgreSQL 15, Docker Compose dev environment
- Zod DTOs, Transformers, Service/Controller/Routes pattern throughout

### Admin Features (All Complete)
- Dashboard with KPIs
- Flat management (50 flats, ground floor = parking, floors 1-4, penthouses)
- **Bulk Property Setup** — floor template wizard, `POST /api/v1/flats/bulk`, conflict detection, inline tile rename, no-prefix mode, unit start number, credentials toggle in resident entry ← 11 Jun / 16 Jun 2026
- Resident management with vehicle tracking
- **Billing** — bulk monthly bill generation, payment recording, late fee calculation; **UX Overhaul complete (17 Jun 2026)**: resident name/phone in bills list, WhatsApp button for overdue, friendly ConfirmModal dialogs, Pay Full Amount quick-fill, clickable KPI cards, 6-month trend chart, generate preview with flat count, merged aging+status badge, debounced search, shared PrintBillModal, CSV export with resident name; **Quick Pay + Advance Pay (17 Jun 2026)**: click any flat tile in Property Map to instantly record payment (unpaid/overdue: 4-mode icon selector + one-tap pay; no_bill: date-range or pick-month advance payment; `POST /billing/quick-pay` backend endpoint); **Full Billing History in Property Map (17 Jun 2026 Evening)**: tile shows cumulative due across ALL unpaid months (not just selected month); orange arrears badge with count; flat drawer shows complete billing history (all months, paid/unpaid/overdue per row, selected-month highlight); `GET /billing/flat/:flatId` new endpoint; `BillingHistoryTable` sub-component with "Pay All (N)" banner; `useQuery` fetches history per-flat on drawer open
- **Visitor management (enhanced)** — `VisitorType` enum (13 types), stats KPI strip, date range + type + exit filters, CSV export, bulk log-exit ← Sprint 1
- Asset management
- Parking slot management
- **Society Helpers directory** — full CRUD, photo upload (local/S3), category filter ← Sprint 1
- Staff management
- Notice board (with priority levels)
- Complaint management
- User account management
- Expense management with categories, **analytics enhanced (1 Jul 2026)**: top-vendor ranking + PDF export via `window.print()`; `GET /expenses/vendor-summary` endpoint; `ExpenseVendorSummaryItem` interface; Section 3 indigo progress-bar ranking panel; **CSV import** (`POST /expenses/import`) and **bulk entry** (`POST /expenses/bulk`, `/admin/expense-bulk-entry` page) ← 17 Jun 2026
- **Bulk Resident Entry** — `POST /api/v1/residents/bulk` (max 100), `/admin/resident-bulk-entry` page, `⚡ Bulk Entry` button on Residents page ← 17 Jun 2026
- **Bulk Staff Entry** — `POST /api/v1/staff/bulk` (max 100), `/admin/staff-bulk-entry` page, `⚡ Bulk Entry` button on Staff page ← 17 Jun 2026
- **Bulk Helper Entry** — `POST /api/v1/helpers/bulk` (max 100), `/admin/helper-bulk-entry` page, `⚡ Bulk Entry` button on Helpers page ← 17 Jun 2026
- Finance ledger
- Monthly report (with WhatsApp share + print)
- Other Income tracking
- Invoice generation with print
- Events management (contributions, expenses, core team) ← 10 Jun 2026
- Vendor Services & AMC (contracts, service logs, due-date alerts) ← 10 Jun 2026
- Notes (sticky note board, per-user + public society board) ← 10 Jun 2026
- **Society Committee** — committee CRUD, member management (designations), achievement timeline, past committees ← Sprint 3 (15 Jun 2026)

### Resident Features (All Complete)
- **Dashboard v2 (1 Jul 2026)** — Bill Hero card (countdown + color-coded), Active Complaints section, Recent Notices preview, Today's Visitors, Quick Actions row, Upcoming Events; orchestrator + 6 sub-components in `components/resident/dashboard/`
- My Bills (with payment info)
- **Pay Now page (1 Jul 2026)** — `/resident/pay`; UPI QR generation + bank details (tap-to-copy) + "I've Paid — Notify Admin" button; `POST /notifications/notify-admin` backend endpoint fans out to all admin users
- Complaints (submit + track)
- Notices (view)
- Visitor log (own flat)
- Resident directory
- Push notifications (in-app)
- Profile management
- Notes (personal + public board) ← 10 Jun 2026
- **Society Helpers directory** (read-only: search + category filter + phone links) ← Sprint 1
- **Security Settings** — TOTP setup/disable, login session viewer + revoke, change password ← Sprint 2
- **Society Committee** — view active committee members + achievement timeline ← Sprint 3 (15 Jun 2026)

### Guard Features (All Complete)
- Visitor entry form (updated: 13-chip visitorType selector, optional notes) ← Sprint 1
- Dashboard (recent visitors)
- Notes ← 10 Jun 2026

### Calculator Panel
- Available to all roles (Ctrl+Shift+C toggle)

### Storage Service
- `backend/src/services/storage.service.ts` — local disk or AWS S3 (switch via `STORAGE_DRIVER` env var)
- `GET /api/v1/uploads/:filename` — serves uploaded files with path-traversal guard

## DB Tables (31 total)
societies, blocks, flats, residents, users, maintenance_bills, payments, visitors, assets, parking_slots, notices, complaints, staff, notifications, society_settings, vehicles, expense_categories, income_records, invoices, invoice_items, events (+ event_contributions, event_expenses, event_team_members), vendors, amc_contracts, amc_service_logs, user_notes, helpers,
**login_sessions, password_reset_tokens, totp_secrets** ← NEW Sprint 2,
**committees, committee_members, committee_achievements** ← NEW Sprint 3,
**onboarding_sessions** ← NEW Sprint 4 (+ SocietyStatus enum + 5 Society fields),
**blacklisted_tokens, role_permissions** ← NEW Sprint 5 (+ sub_admin/member in Role enum + PermissionModule enum)

## Sprint 7 New API Endpoints (1 Jul 2026)
```
POST   /notifications/notify-admin    — resident → fans out notification to all admin users
GET    /expenses/vendor-summary       — top-10 vendor spend aggregation (groupBy + _sum)
```

## Auth Routes (Sprint 2)
```
POST   /auth/login                 — credentials; returns tempToken if 2FA required
POST   /auth/logout                — blacklists token
GET    /auth/me                    — current user info
PUT    /auth/change-password       — change password
POST   /auth/forgot-password       — send reset email
POST   /auth/reset-password/:token — apply password reset
POST   /auth/2fa/setup             — initiate TOTP setup (returns QR + secret)
POST   /auth/2fa/enable            — activate TOTP + get backup codes
POST   /auth/2fa/verify            — exchange tempToken + code for full JWT
DELETE /auth/2fa                   — disable TOTP
GET    /auth/2fa/status            — isEnabled + backupCodesRemaining
GET    /auth/sessions              — list last 20 login sessions
DELETE /auth/sessions/:id          — revoke a session
```

## ACL System (Sprint 5 — Complete as of 22 Jun 2026)
- **19 permission modules**: billing, residents, flats, visitors, notices, complaints, staff, assets, parking, expenses, income, invoices, events, vendors, committee, helpers, reports, settings, users
- **5 actions per module**: canView, canCreate, canEdit, canDelete, canExport
- Default presets seeded in migration for both `sub_admin` (broad access) and `member` (view-heavy, notices write)
- **Backend**: `RolePermission` Prisma model, `acl.service.ts` with in-memory cache, `acl.middleware.ts` `requirePermission()` factory, `GET/PATCH /api/v1/acl/permissions`
- **Frontend**: `usePermissions()` hook, `ACLSettings.tsx` matrix page at `/admin/acl-settings`, Sidebar filters nav by `canView(module)`, `ProtectedRoute` loads ACL for sub_admin/member on first render

## Sprint 8 — Account-Based Login + Society Identity (Complete 10 Jul 2026)
- `societyUrl` + `accountNumber` columns on `societies` table (migration `20260710_society_account_login`)
- `User.username` uniqueness: global `@unique` → compound `@@unique([societyId, username])`
- Login page: 3 fields — Account Number → Username → Password (AWS IAM-style)
- `GET /settings` exposes `accountNumber` (read-only) + `societyUrl` (editable) from Society table
- `PATCH /settings` with `societyUrl` updates Society table (accountNumber silently ignored)
- Admin Settings → General tab: "Portal Identity" card with read-only account number (copy button) + editable URL slug
- Onboarding Step 7: green highlight box displaying account number + society URL for admin to share with members

## Account Number Lookup (11 Jul 2026 — Session 1)
- `GET /api/v1/onboarding/find-account?q=<query>` — public endpoint; searches Society by name/email/phone; returns masked `accountNumber`
- `frontend/src/pages/FindAccountPage.tsx` — `/find-account` public page; search form + result cards with masked account number + 📋 copy button
- `frontend/src/pages/LoginPage.tsx` — "🔍 Don't know your account number? Find it here →" link added in standard login mode
- `frontend/src/App.tsx` — `/find-account` route registered; `FindAccountPage` imported
- Masking pattern: `"2026071001"` → `"2026**1001"` (first 4 + `**` + last 4)

## Portal Identity UX Polish (11 Jul 2026 — Session 2 + 3)
- **Reserved society URL slugs** — `RESERVED_SOCIETY_URLS: Set<string>` exported from `onboarding.service.ts`; enforced in `settings.dto.ts` + `onboarding.dto.ts` (both schemas); `checkSocietyUrlAvailable()` also rejects reserved slugs
- **`SocietyCard` + `SocietyCardModal`** — `frontend/src/components/admin/SocietyCard.tsx`:
  - `PORTAL_DOMAIN = 'societyportal.app'` constant
  - `buildPortalUrl(slug)` → `https://{slug}.societyportal.app` (subdomain format, matching RegisterPage)
  - `SocietyCard` (default export) — pure visual card for embedding
  - `SocietyCardModal` (named export) — modal with ×, 🖨️ Print (iframe-isolated print), backdrop close
  - `CopyButton` sub-component with 2s ✓ confirmation
- **Portal URL preview in Settings** — blue `bg-blue-50` row below societyUrl showing `https://{slug}.societyportal.app` with copy button; subdomain format
- **Settings "View Card" CTA** — indigo banner with `🪪 View Card` button opens `SocietyCardModal`; card NOT always visible
- **Step7ReviewActivate** — indigo CTA banner opens `SocietyCardModal`; replaced inline card entirely
- **Print isolation** — `SocietyCardModal` creates hidden iframe, injects self-contained HTML/CSS, calls `iframe.contentWindow.print()`, removes iframe after 1s; only card prints

## Resident Profile Fixes (16 Jul 2026)
- **Cars/Bikes count bug fixed** — `getResidentProfile()` now re-derives `numCars`/`numBikes` from live `vehicles` array (not stale DB counters); `getAllResidents()` uses `prisma.vehicle.groupBy()` for the same fix at list level; frontend `ResidentProfile.tsx` also re-derives from the `vehicles[]` in the profile response
- **Admin Change Resident Password** — new `POST /api/v1/residents/:id/change-password` (admin only); `adminChangeResidentPassword()` service hashes and updates; optional email notification via `sendPasswordChangedNotification()`; frontend `ChangePasswordModal` with new/confirm password + 3-way notify selector (None / Email / WhatsApp); WhatsApp opens `wa.me` link in new tab; button disabled if contact info not on file

## What's Left to Build (Next: Sprint 9)
- **P3.4 — Document Vault** — `society_documents` table + `DocCategory` enum; admin upload/categorize/version; resident read-only view; 10MB multer limit; uses existing `storage.service.ts`
- **P3.6 — Admin Reporting Suite** — 6 exportable reports (CSV + print): Monthly Collection, Resident Aging, Expense Budget vs Actual, Visitor Traffic, Complaint SLA, Committee Activity; `Reports.tsx` + `components/admin/reports/` sub-components; sidebar `📊 Reports`
- **Sprint 10**: P3.1 Vendor AMC Dashboard + P3.2 Events RSVP + P3.3 Notice Reactions + P3.5 Parking Map v2
- **Sprint 10**: P4.x Notification Bell enhancements, Resident Profile v2, Guard Dashboard v2, Dark Mode, PWA
- **Future**: Multi-Society Admin Dashboard, SMS/WhatsApp push, Mobile App (Capacitor), AI Insights

## Onboarding Wizard (Sprint 4 — Complete as of 15 Jun 2026)
- `POST /register` → email setup link → token-gated 7-step wizard at `/setup/:token`
- Steps 1–2 token-gated; Step 2 issues JWT; Steps 3–7 use JWT auth
- New DB: `SocietyStatus` enum, 5 Society fields, `OnboardingSession` table
- New migration: `backend/prisma/migrations/20260616_onboarding/migration.sql`
- 11 new frontend components in `frontend/src/components/onboarding/`
- Dashboard shows amber `sticky top-0` banner while `society.status !== 'active'`
- Existing `societyId=1` deployment unaffected (`status` defaults to `'active'`)
- New Prisma model uses `(prisma as any).onboardingSession` until `prisma generate` runs in container

## Security Hardening (15 Jun 2026 — OWASP Audit Sprint)
- **Rate limiting:** login (10/15min), forgot-password (5/hr), TOTP (10/15min), global API (300/min)
- **JWT secret validation:** server aborts in production if `JWT_SECRET` is < 32 chars or known-weak
- **Upload auth:** `authMiddleware` now required for all `/api/v1/uploads/*` endpoints
- **Complaint IDOR fixed:** `GET /complaints/:id` — residents can only view their own flat's complaints
- **Complaint flatId trust fixed:** residents' `flatId` always resolved from JWT-linked resident profile
- **Input validation added:** income + invoice routes now use Zod `validate()` middleware
- **Body size limit:** 1MB JSON + urlencoded limit added globally
- **Swagger hidden in production:** `/api-docs` only available when `NODE_ENV !== 'production'`
- **Visitor stats:** replaced broken raw SQL (date filter never applied) with `prisma.visitor.groupBy()`
- **File upload MIME validation:** CSV import rejects non-CSV MIME types; helper photo upload rejects non-image types
- **societyId helper:** `getSocietyId(req)` in `backend/src/helpers/society.helper.ts` — use in all controllers
- **Full audit report:** `memento/security-audit.md`

**All 3 previously-deferred security items now CLOSED (Sprint 5):**
- ~~CRIT-2: JWT blacklist persistence~~ — `blacklisted_tokens` DB table, async `authMiddleware`
- ~~MED-2: CORS origin restriction~~ — `ALLOWED_ORIGINS` env var in `backend/.env` + multi-origin `cors()` callback
- ~~MED-5: Session cleanup cron~~ — inline delete-older-than-90-days in `recordLoginSession()`

## Multi-Tenancy Isolation Fix (15 Jun 2026 — Evening)
All data queries are now properly scoped by `societyId` from JWT. Previously, every service hardcoded `societyId = 1`, causing a new society's admin to see society-1 data.

**Pattern:**
- Services accept `societyId: number = 1` as a parameter (default=1 preserves backward compat)
- Controllers pass `req.user!.societyId` to every service call
- Models without direct `societyId` (Resident, Complaint, Visitor) scope via their parent Flat: `where: { flat: { societyId } }`

**20 controller/service pairs fixed** — billing, settings, blocks, residents, finance, visitors, complaints, invoices, events, helpers, notes, vendors, expense-categories, import, auth.

**Rule for new code:** Every new route handler MUST pass `req.user!.societyId` to its service. Never use `societyId: 1` literals in production code.

## Known Issues / Gotchas
- Prisma compound key accessor for `User`: `{ societyId_username: { societyId, username } }` — use `(prisma as any).user.findUnique/upsert` until `prisma generate` runs
- `(prisma as any).society.findUnique({ where: { accountNumber } })` — stale Prisma types until `prisma generate`
- VS Code shows spurious TS errors (no local node_modules) — Docker `tsc --noEmit` is authoritative (always exits 0)
- `as const` pattern on form defaults causes TS2322 — use explicit union type annotation instead
- Pagination component prop is `onPageChange` (not `onSkipChange`)
- `MaintenanceBill` uses `month: Int` + `year: Int` (not `billMonth DateTime`)
- New Prisma models (`BlacklistedToken`, `RolePermission`, `LoginSession`, `TotpSecret`, `PasswordResetToken`, `OnboardingSession`) won't be in generated types until `npx prisma generate` runs inside container; services use `(prisma as any).modelName` in the interim
- `Helper` model fields: `alternatePhone`, `email`, `description` — NO `altPhone`, NO `notes`, NO `rating`, NO `address`
- otplib v12: the old `authenticator` export was removed — use top-level `generateSync`, `verifySync`, `generateURI` with `{ secret, type: 'totp' }` object args
- `visitor.service.ts` groupBy cast to `any` — Prisma types stale until `prisma generate` runs in container
- `authMiddleware` is now `async` — required by DB blacklist check; `express-async-errors` handles propagation
- ACL in-memory cache keyed by `${societyId}_${role}` — invalidated on every `updateRolePermissions()` call; server restart also clears it (DB is authoritative)
- `ProtectedRoute` for sub_admin/member fetches ACL on first render; permissions stored in `AuthContext` + localStorage for subsequent navigations