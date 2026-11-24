# Society Management Portal — Master Roadmap (v2)

> Last updated: 19 Jun 2026
> Status: **Sprint 1 COMPLETE | Sprint 2 COMPLETE | Sprint 3 COMPLETE | Sprint 4 COMPLETE | Sprint 5 PLANNED**

---

## Priority Framework

| Priority | Criteria |
|---|---|
| 🔴 P1 — Critical | Security gap or blocks real-world deployment |
| 🟠 P2 — High | Core operational need; admin/resident daily-use feature |
| 🟡 P3 — Medium | Strong value-add; differentiates from basic systems |
| 🟢 P4 — Enhancement | Polish, convenience, nice-to-have |
| 🔵 P5 — Future | Infrastructure / scale / advanced features |

---

## Suggested Sprint Plan

| Sprint | Items | Total Effort |
|---|---|---|
| **Sprint 5** | P1.1 Security Deferred + P1.2 Sub-Admin ACL Matrix | ~2 days |
| **Sprint 6** | P2.1 Gate Pass Pre-Approval + P2.2 Complaint Pipeline v2 | ~2 days |
| **Sprint 7** | P2.3 Resident Dashboard v2 + P2.4 Payment QR + P2.5 Expense Analytics | ~1.5 days |
| **Sprint 8** | P3.4 Document Vault + P3.6 Reporting Suite | ~2 days |
| **Sprint 9** | P3.1 Vendor AMC Dashboard + P3.2 Events RSVP + P3.3 Notice Reactions + P3.5 Parking Map v2 | ~2 days |
| **Sprint 10** | P4.1 Notifications + P4.2 Resident Profile + P4.3 Guard Dashboard + P4.4 Dark Mode + P4.5 PWA | ~3 days |
| **Sprint 11+** | P5.x Multi-Society, SMS/WhatsApp, Mobile App, AI Insights | ongoing |

**Total estimated remaining work to feature-complete MVP:** ~15 days of focused development

---

## TIER 1 — 🔴 CRITICAL (Deploy Blockers)

### P1.1 — Security: Close 3 Deferred OWASP Items
**Effort:** ~3 hours | No new DB tables | Deferred from 15 Jun 2026 audit

| Item | ID | Fix |
|---|---|---|
| JWT blacklist not persistent | CRIT-2 | Add `BlacklistedToken` Prisma model; replace in-memory `Set` in `auth.service.ts` with DB lookup |
| CORS allows all origins | MED-2 | Add `ALLOWED_ORIGINS` env var; pass `origin: allowedOrigins.split(',')` to `cors()` in `app.ts` |
| Login sessions grow unbounded | MED-5 | On every login, delete `login_sessions` rows older than 90 days (no cron needed) |

**Files to change:**
- `backend/prisma/schema.prisma` — add `BlacklistedToken` model (`token String @unique, expiresAt DateTime, createdAt`)
- `backend/src/services/auth.service.ts` — `blacklistToken()` writes to DB; `isTokenBlacklisted()` queries DB; cleanup old sessions on login
- `backend/src/app.ts` — `ALLOWED_ORIGINS` env-driven CORS config

---

### P1.2 — Sub-Admin + Member Roles + ACL Matrix
**Effort:** ~1.5 days | 1 DB migration | 6 new files, 8 modified

Two new roles enabling multi-person society management without giving everyone full admin power:
- **`sub_admin`** — treasury manager, property manager, office assistant
- **`member`** — committee member with view-heavy + notices write access

#### New DB Table

```
role_permissions
  id String @id @default(uuid())
  societyId Int
  role String                      -- "sub_admin" or "member"
  module PermissionModule
  canView Boolean @default(false)
  canCreate Boolean @default(false)
  canEdit Boolean @default(false)
  canDelete Boolean @default(false)
  canExport Boolean @default(false)
  updatedBy String?
  updatedAt DateTime @updatedAt
  @@unique([societyId, role, module])

PermissionModule enum (19 modules):
  billing, residents, flats, visitors, notices, complaints,
  staff, assets, parking, expenses, income, invoices,
  events, vendors, committee, helpers, settings, users, reports
```

#### Default Permission Presets (seeded on migration)

| Module | sub_admin | member |
|---|---|---|
| billing | view + create + edit | view |
| residents | view + create + edit | view |
| flats | view + create + edit | view |
| visitors | view + create | view |
| notices | view + create + edit + delete | view + create |
| complaints | view + edit | view |
| staff | view | view |
| assets | view + edit | view |
| parking | view + edit | view |
| expenses | view + create | view |
| income | view + create | view |
| invoices | view + create | view |
| events | view + create + edit | view |
| vendors | view | view |
| committee | view + edit | view |
| helpers | view + create + edit | view |
| reports | view | view |
| settings | none | none |
| users | none | none |

#### Backend Files

| File | Action | Description |
|---|---|---|
| `backend/prisma/schema.prisma` | Modify | Add `sub_admin`, `member` to `Role` enum; add `RolePermission` model + `PermissionModule` enum |
| `backend/src/dtos/acl.dto.ts` | NEW | `updatePermissionsSchema` |
| `backend/src/services/acl.service.ts` | NEW | `getRolePermissions()`, `updateRolePermissions()`, `checkPermission()` — in-memory Map cache per societyId+role |
| `backend/src/controllers/acl.controller.ts` | NEW | Thin handlers |
| `backend/src/routes/acl.routes.ts` | NEW | `GET/PATCH /api/v1/acl/permissions` (admin only) |
| `backend/src/middleware/acl.middleware.ts` | NEW | `requirePermission(module, action)` — `admin` short-circuits; checks DB for `sub_admin`/`member` |
| `backend/src/middleware/role.middleware.ts` | Modify | Accept `sub_admin`, `member` in `requireRoles` calls |
| `backend/src/app.ts` | Modify | Register `/api/v1/acl` router |

#### Frontend Files

| File | Action | Description |
|---|---|---|
| `frontend/src/api/acl.ts` | NEW | `getPermissions()`, `updatePermissions(matrix)` |
| `frontend/src/pages/admin/ACLSettings.tsx` | NEW | Checkbox matrix — Sub Admin / Member tabs; rows = modules; cols = View/Create/Edit/Delete/Export |
| `frontend/src/hooks/usePermissions.ts` | NEW | `usePermissions()` → `hasPermission(module, action): boolean` from auth context |
| `frontend/src/pages/UnauthorizedPage.tsx` | NEW | Clean 403 page with back button |
| `frontend/src/components/ProtectedRoute.tsx` | Modify | Fetch ACL on mount for `sub_admin`/`member`; store in auth context |
| `frontend/src/context/AuthContext.tsx` | Modify | Add `permissions: Record<string, Record<string, boolean>>` to context |
| `frontend/src/components/Sidebar.tsx` | Modify | Filter nav items by `hasPermission(module, 'view')` for sub_admin/member |
| `frontend/src/App.tsx` | Modify | Add `/admin/acl-settings` route (admin only); `/unauthorized` public route |

#### Technical Rules
- `admin` role ALWAYS bypasses `requirePermission` — no DB lookup needed
- `acl.service.ts` caches `Map<societyId_role, permissionsObject>` — invalidated on every `updateRolePermissions()` call
- `sub_admin` sees the admin panel; `member` also sees admin panel (filtered by permissions)
- New sidebar group "⚙️ Access Control" → ACL Settings (admin only)

---

## TIER 2 — 🟠 HIGH (Core Operational Needs)

### P2.1 — Gate Pass Pre-Approval
**Effort:** ~1 day | 1 new DB table | 3 new files, 2 modified

Residents pre-register expected visitors. Guard sees them in an "Expected Visitors" tab with one-tap check-in. Eliminates the most common society UX pain point — guard calling resident to verify every visitor.

#### New DB Table

```
gate_passes
  id String @id @default(uuid())
  societyId Int
  flatId String (FK)
  residentId String (FK)
  visitorName String
  visitorPhone String?
  purpose String
  expectedDate DateTime
  validHours Int @default(24)
  status GatePassStatus @default(pending)
  checkedInAt DateTime?
  cancelledAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

GatePassStatus enum: pending | checked_in | expired | cancelled
```

#### API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/gate-passes` | resident | Create gate pass |
| `GET` | `/api/v1/gate-passes/my` | resident | List own gate passes |
| `DELETE` | `/api/v1/gate-passes/:id` | resident | Cancel a pass |
| `GET` | `/api/v1/gate-passes/expected` | guard | Today's expected visitors (all flats) |
| `PATCH` | `/api/v1/gate-passes/:id/checkin` | guard | Mark checked-in + auto-create visitor log entry |
| `GET` | `/api/v1/gate-passes` | admin | All gate passes with filters |

#### Files

| File | Action |
|---|---|
| `backend/src/dtos/gate-pass.dto.ts` | NEW |
| `backend/src/services/gate-pass.service.ts` | NEW |
| `backend/src/controllers/gate-pass.controller.ts` | NEW |
| `backend/src/routes/gate-pass.routes.ts` | NEW |
| `backend/src/transformers/gate-pass.transformer.ts` | NEW |
| `frontend/src/api/gatePasses.ts` | NEW |
| `frontend/src/pages/resident/GatePasses.tsx` | NEW — list + create modal |
| `frontend/src/pages/guard/Dashboard.tsx` | Modify — add "Expected Visitors" tab |

---

### P2.2 — Complaint Pipeline v2 (Maintenance Request Tracker)
**Effort:** ~1 day | No new DB tables | 4 modified files

Transform the flat complaints list into a proper 5-stage ticketing pipeline. Uses existing `complaints` table with extended status values.

#### Status Pipeline

```
submitted → acknowledged → in_progress → resolved → closed
```

#### New Features
- Admin: Kanban-style board view — drag-to-next-stage (or dropdown status selector)
- Admin: Assign complaint to a staff member (`assignedTo String?` new field on `Complaint`)
- Resident: Visual step-progress bar showing current stage
- Status-change → auto push notification to resident (uses existing notification system)
- `acknowledgedAt`, `resolvedAt`, `closedAt` timestamps (new fields)
- Resolution Rating: when closed, resident gets 1–5 star prompt (`rating Int?`, `ratingNote String?`)
- Admin SLA view: avg days to resolve per category

#### DB Changes (migration)

```
Add to Complaint model:
  assignedTo String?         -- staff userId
  acknowledgedAt DateTime?
  resolvedAt DateTime?
  closedAt DateTime?
  rating Int?                -- 1-5, set by resident after closure
  ratingNote String?

Extend ComplaintStatus enum:
  submitted | acknowledged | in_progress | resolved | closed
  (existing: open | in_progress | resolved | closed — migrate open → submitted)
```

#### Files

| File | Action |
|---|---|
| `backend/prisma/schema.prisma` | Modify — add fields + extend enum |
| `backend/src/services/complaint.service.ts` | Modify — `updateStatus()`, `assignComplaint()`, `rateComplaint()`, SLA query |
| `backend/src/controllers/complaint.controller.ts` | Modify — new handlers |
| `backend/src/routes/complaint.routes.ts` | Modify — new routes |
| `frontend/src/pages/admin/Complaints.tsx` | Modify — kanban view + assign + SLA stats |
| `frontend/src/pages/resident/Complaints.tsx` | Modify — step progress bar + rating prompt |

---

### P2.3 — Resident Dashboard v2
**Effort:** ~0.5 day | No new tables | Frontend only — 2 files

Current resident dashboard is sparse. Upgrade to a useful daily-driver with 6 sections:

| Section | Content | API Source |
|---|---|---|
| Bill Status Hero | Big card — amount due + due date countdown + "View Bills" CTA | existing billing API |
| Active Complaints | Live status pills for open complaints (submitted/acknowledged/in_progress) | existing complaints API |
| Society Notices | Last 3 notices with preview text + "View All" | existing notices API |
| Recent Visitors | Today's visitors to their flat | existing visitor API |
| Quick Actions Row | Raise Complaint · View Bills · Gate Pass · Committee buttons | navigation only |
| Upcoming Events | Next 2 society events | existing events API |

Files: `frontend/src/pages/resident/Dashboard.tsx` (orchestrator) + `frontend/src/components/resident/dashboard/` sub-components

---

### P2.4 — Resident Payment QR Page
**Effort:** ~0.5 day | No new tables | 1 new page + 4 new settings vars

Society configures UPI ID + bank details in admin Settings. Resident visits `/resident/pay`:
- Outstanding bill amount (from billing API)
- **UPI QR code** generated client-side from `upi://pay?pa={upi_id}&am={amount}&...`
- Bank NEFT details in copy-friendly format (tap to copy)
- **"I've Paid — Notify Admin"** button → creates a notification for admin to verify + record payment

New `society_settings` vars: `upi_id`, `bank_name`, `bank_account`, `bank_ifsc`

Files:
- `frontend/src/pages/resident/Pay.tsx` — NEW
- `frontend/src/pages/admin/Settings.tsx` — Modify (add payment section)
- `backend/src/services/settings.service.ts` — Modify (accept 4 new vars)

---

### P2.5 — Expense Analytics Enhancement
**Effort:** ~0.5 day | No new tables | 1 file enhanced

Upgrade the existing `ExpenseAnalytics.tsx` page:

| Enhancement | Detail |
|---|---|
| Budget vs Actual bar chart | Admin sets monthly budget per category in settings; chart shows actual spend vs budget |
| 12-month rolling trend | Line chart per category; uses existing expense data |
| Top vendor spend ranking | Aggregate by vendor name, sorted descending |
| Export to PDF | Print-friendly report via `window.print()` with Tailwind `print:` utilities |

New settings vars: `budget_{categorySlug}` — EAV pattern, one per active expense category

---

## TIER 3 — 🟡 MEDIUM (Strong Value-Add)

### P3.1 — Vendor & AMC Dashboard
**Effort:** ~0.5 day | No new tables | 2 files enhanced

Upgrade existing Vendors page:
- **AMC Due Alert Banner** — contracts expiring ≤30 days (red) / ≤60 days (amber) as sticky banner
- **Service Log Timeline** — vertical timeline per vendor, newest first
- **Vendor Performance Rating** — 1–5 stars per service log entry (`rating Int?` field on `AmcServiceLog`)
- **"Schedule Next Service"** action → creates a dated notice/reminder

---

### P3.2 — Events Calendar + RSVP
**Effort:** ~0.5 day | 1 new DB table | 2 files modified

Add calendar view + resident RSVP to existing Events module:

```
event_rsvps
  id, eventId, residentId, status (attending | maybe | not_attending),
  createdAt, updatedAt
  @@unique([eventId, residentId])
```

- Admin Events page: toggle between List view and Calendar grid view (month)
- Resident Events page (new): read-only calendar + RSVP buttons
- RSVP counts shown on event cards (`attending: 12, maybe: 3`)

---

### P3.3 — Notice Enhancements (Reactions + Read Receipts + Expiry)
**Effort:** ~0.5 day | 1 new DB table | 2 files modified

```
notice_reactions
  id, noticeId, residentId, reaction (thumbsup | heart | surprised | sad),
  createdAt
  @@unique([noticeId, residentId])

Add to Notice model:
  expiresAt DateTime?    -- auto-archive when passed
  viewCount Int @default(0)  -- incremented on resident fetch (debounced)
```

- Resident: emoji reaction bar below each notice (4 emoji options)
- Admin: reaction counts + "X/Y residents viewed" per notice
- **Pinned notice**: highest-priority active notice shown as a banner on resident dashboard

---

### P3.4 — Document Vault
**Effort:** ~1 day | 1 new DB table | 4 new files

Society stores and shares important documents (bylaws, NOC letters, audit reports, maintenance contracts):

```
society_documents
  id String @id @default(uuid())
  societyId Int
  title String
  category DocCategory (bylaw | noc | audit | contract | minutes | circular | other)
  fileUrl String
  fileSize Int?
  mimeType String?
  visibleToResidents Boolean @default(false)
  uploadedBy String (userId)
  version Int @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
```

- Admin: upload, categorize, toggle resident visibility, replace with new version
- Resident: view documents marked `visibleToResidents=true`
- Uses existing storage service (`uploadFile()`)
- File size limit: 10MB enforced in multer config

---

### P3.5 — Parking Management v2 (Visual Map)
**Effort:** ~0.5 day | No new tables | 2 files modified

Upgrade existing Parking module:
- **Visual grid** — all slots shown as colored tiles (occupied/available/reserved/visitor-parking)
- **Visitor parking** — guard can assign a temporary slot for duration of visit, auto-clears on visitor exit
- **Vehicle-slot linkage** — clicking a slot shows the flat + vehicle details inline
- **Slot filter** — filter by type, status, block

---

### P3.6 — Admin Reporting Suite
**Effort:** ~1 day | No new tables | 3 new files

Dedicated reports section with 6 exportable reports (CSV + print-friendly):

| Report | Key Metrics |
|---|---|
| Monthly Collection | Bills generated vs collected vs outstanding; collection % |
| Resident Aging | Who hasn't paid in 2+, 3+, 6+ months; contact details |
| Expense Budget vs Actual | Per category; monthly trend |
| Visitor Traffic | By type, by day-of-week, peak hours chart |
| Complaint SLA | Avg days to resolve per category; open > 7 days flagged |
| Committee Activity | Achievements this year; member tenure |

Files:
- `frontend/src/pages/admin/Reports.tsx` — orchestrator with 6 report tabs
- `frontend/src/components/admin/reports/` — sub-components per report
- Sidebar: "📊 Reports" under Finance group

---

## TIER 4 — 🟢 ENHANCEMENT (Polish & Convenience)

### P4.1 — Global Notification Bell Improvements
**Effort:** ~0.5 day | No new tables

- Notification categories with icons (billing 💰, visitor 🚪, complaint 🔧, notice 📢, system ⚙️)
- "Mark all as read" button
- Notification preferences page — resident can mute certain categories
- Unread badge count on browser tab title

### P4.2 — Resident Profile Enhancement
**Effort:** ~0.5 day | No new tables

- Profile photo upload (uses existing storage service)
- Emergency contact fields (name + phone)
- Vehicle registration inline (currently admin-only)
- "Request Move-Out" — sends notification to admin

### P4.3 — Guard Dashboard Enhancement
**Effort:** ~0.5 day | No new tables

- Shift log — guard marks shift start/end; last 7 days visible
- Incident report form — raise security concerns (suspicious activity, equipment failure)
- Frequent visitors quick-select — shows most-visited guests per flat (last 30 days)

### P4.4 — Dark Mode
**Effort:** ~1 day | No new tables | ~20 files

- `tailwind.config.js` dark mode class strategy
- `ThemeContext` with `localStorage` persistence
- Navbar toggle button (☀️/🌙)
- All pages/components updated with `dark:` variants

### P4.5 — PWA + Offline Support
**Effort:** ~1 day | No new tables | 3 files

- `vite-plugin-pwa` + `manifest.json`
- Service worker caches billing history + notices for offline read
- "Add to Home Screen" prompt for mobile residents

---

## TIER 5 — 🔵 FUTURE (Scale & Infrastructure)

### P5.1 — Multi-Society Admin Dashboard
**Effort:** ~2 days

Super-admin portal overseeing all registered societies: active count, revenue, usage metrics, suspension controls.

### P5.2 — SMS/WhatsApp Push Notifications
**Effort:** ~1.5 days

Integrate MSG91 or Twilio — bill reminders, visitor alerts, notice broadcasts via WhatsApp Business API. All existing notification triggers gain SMS/WA channel.

### P5.3 — Mobile App (Capacitor wrapper)
**Effort:** ~5+ days

Wrap the frontend with Ionic Capacitor for iOS/Android. Native push notifications via FCM.

### P5.4 — AI-Powered Insights
**Effort:** ~2 days

- Payment prediction — flag flats likely to default based on history
- Expense anomaly detection — alert admin when a category spikes >30% vs 3-month avg
- Complaint pattern recognition — identify recurring infrastructure issues

---

## Design Decisions (Confirmed)

| Decision | Choice |
|---|---|
| Email (signup invites / password reset) | Real SMTP via nodemailer — credentials configured later; stubs to console in dev |
| 2FA | Society-wide toggle in `society_settings` (`require_2fa = true/false`) |
| Photo storage | Local disk (Docker volume) by default; switchable to AWS S3 via `STORAGE_DRIVER=s3` |
| Committee members | Linked to registered residents only (`residentId` required) |
| ACL granularity | Role-level only for v1 (one matrix per role — no per-user overrides) |
| Onboarding entry | Token-gated wizard via `/setup/:token` |
| Onboarding auth boundary | Steps 1–2 token-gated; Step 2 issues JWT; Steps 3–7 use JWT auth |
| Existing societies unaffected | `societies.status` defaults to `'active'` |
| Gate pass check-in | Auto-creates visitor log entry — no duplicate entry needed by guard |
| Complaint status migration | `open` → `submitted` for backward compat |

---

## Completed Sprints (Historical)

### Sprint 1 — COMPLETE (13 Jun 2026)
- Visitor Type Enhancement (13 VisitorType enum values, stats KPI, filters, CSV export, bulk log-exit)
- Society Helpers Directory (full CRUD, photo upload, storage service abstraction)

### Sprint 2 — COMPLETE (13 Jun 2026)
- Auth Overhaul: 2FA/TOTP, Forgot/Reset Password, Login Session Tracking, Remember Me, temp tokens

### Sprint 3 — COMPLETE (15 Jun 2026)
- Society Committee + Achievements (CRUD, designation badges, achievement timeline, past committees)
- OWASP Security Audit + Hardening (18 findings, 15 fixed, 3 deferred → now P1.1)
- Multi-Tenancy Isolation Fix (20 controller/service pairs now properly scope by societyId)

### Sprint 4 — COMPLETE (15–16 Jun 2026)
- Society Onboarding Wizard (7-step self-service signup, token-gated, JWT handoff at Step 2)
- Bulk Property Setup improvements (unit start number, no-prefix mode, inline tile rename)

### Post-Sprint 4 Additions (17–18 Jun 2026)
- Billing UX Overhaul (8 improvements: resident identity, confirm dialogs, quick-pay, trend chart, etc.)
- Property Map Quick Pay + Advance Pay
- Full Billing History in Property Map flat drawer
- Defaulters Tab Payment Modal
- Expense CSV Import + Bulk Entry
- Bulk Resident / Staff / Helper Entry pages
