# 🏘️ Society Management Portal

A full-stack web portal for managing a residential housing society. Supports **admin**, **resident** (owner/tenant), and **security guard** roles with dedicated dashboards, billing, complaints, visitors, assets, and more.

> **Full deployment guide → [DEPLOYMENT.md](DEPLOYMENT.md)**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + TailwindCSS |
| Backend | Node.js 20 + Express.js + TypeScript |
| Database | PostgreSQL 15 |
| ORM | Prisma 5 |
| Auth | JWT (role-based, 2FA optional) |
| Container | Docker + Docker Compose |

---

## Quick Start — Local Development

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose v2)
- Git

### 1. Clone

```bash
git clone <repo-url>
cd society-management-portal
```

### 2. Create the backend env file

```bash
cp backend/.env.example backend/.env
```

The defaults work as-is for local Docker development.

### 3. Start all services

```bash
docker compose up --build
```

Three containers start automatically:

| Container | What it is | URL |
|-----------|-----------|-----|
| `society_db` | PostgreSQL 15 | `localhost:5432` |
| `society_backend` | Express API (hot-reload) | http://localhost:3000 |
| `society_frontend` | React SPA (Vite dev server) | http://localhost:5173 |

The backend auto-runs `prisma migrate deploy` + `prisma db seed` on every start.

### 4. Open the app

**http://localhost:5173**

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend application |
| http://localhost:3000/api-docs | Swagger interactive API docs |
| http://localhost:3000/health | API health check |

### Default credentials

| Role | Account Number | Username | Password |
|------|---------------|----------|----------|
| Admin | `2026011001` | `admin` | `admin123` |

> Resident and security guard accounts are created by the admin through the portal.

---

## Project Structure

```
.
├── backend/                    # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (19 models)
│   │   ├── seed.ts             # DB seed (admin user + society settings)
│   │   └── migrations/         # SQL migration history
│   ├── src/
│   │   ├── controllers/        # Thin HTTP handlers
│   │   ├── services/           # Business logic
│   │   ├── routes/             # Express routers
│   │   ├── middleware/         # Auth, roles, ACL, validation, errors
│   │   ├── dtos/               # Zod validation schemas (input)
│   │   ├── transformers/       # Response shaping (output — never raw Prisma)
│   │   ├── helpers/            # Billing + pagination helpers
│   │   └── utils/              # JWT, bcrypt, date, email, OTP utils
│   ├── .env.example            # ← copy to .env, fill in values
│   ├── Dockerfile              # Multi-stage production build
│   └── package.json
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── api/                # Axios API layer (one file per resource)
│   │   ├── components/         # Layout, Navbar, Sidebar, ProtectedRoute, etc.
│   │   ├── context/            # AuthContext (JWT state + permissions)
│   │   ├── pages/
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── resident/       # Resident portal pages
│   │   │   └── guard/          # Security guard page
│   │   ├── constants/          # Shared labels, colors, enums
│   │   └── types/              # TypeScript interfaces
│   ├── .env.example            # ← copy to .env, fill in values
│   ├── Dockerfile              # Dev server (Docker Compose local)
│   ├── Dockerfile.prod         # Multi-stage production build → nginx
│   └── nginx.conf              # nginx config inside frontend container
│
├── nginx/
│   └── nginx.conf              # Outer reverse proxy (SSL + routing)
│
├── docker-compose.yml          # Local development
├── docker-compose.prod.yml     # Production deployment
├── DEPLOYMENT.md               # ← Full setup guide (read this!)
└── README.md
```

---

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access — all modules |
| `sub_admin` | Broad access, ACL-configurable per module |
| `member` | Committee member — view heavy, notices write |
| `owner` | Bills, complaints, notices, visitors, directory |
| `tenant` | Same as owner |
| `security` | Visitor entry/exit logging only |

---

## Key Features

- **Multi-block property structure** — Blocks with flats, row houses, penthouses
- **Maintenance Billing** — Bulk monthly bill generation: `(sqFt × ratePerSqft) + fixedCharge`
- **Late Fees** — Dynamically calculated on fetch: `max(0, daysSinceDue − graceDays) × lateFeePerDay`
- **Visitor Management** — Guards log entry/exit; residents get in-app notifications
- **Complaints** — Residents raise complaints; admin manages status
- **Asset Tracking** — Track lifts, borewells, tanks with service-due alerts
- **Parking** — Slot management with flat/vehicle assignment
- **Notice Board** — Admin posts notices with priority levels
- **ACL / Access Control** — Fine-grained per-module permissions for sub-admins and members
- **2FA** — Optional TOTP two-factor authentication per user
- **Society Onboarding Wizard** — Step-by-step setup for new societies
- **Account-based Login** — Societies identified by account number (AWS IAM-style)
- **Expense & Income Tracking** — Full finance module with CSV import and bulk entry
- **Invoices** — Generate and print professional invoices
- **Society Card** — Printable identity card for the society with portal URL

For the complete module inventory, role behavior, workflows, security controls, data model, and deployment scope, see [FEATURES.md](FEATURES.md).

---

## Stopping

```bash
# Stop containers (data is preserved)
docker compose down

# Stop and wipe all data (fresh start)
docker compose down -v
```

---

## Going to Production?

Read **[DEPLOYMENT.md](DEPLOYMENT.md)** — it covers:

- Production Docker Compose with multi-stage builds
- nginx reverse proxy with SSL/TLS (Let's Encrypt)
- Environment variable reference for every setting
- Database backup, migration, and seed commands
- Bare-metal (no Docker) deployment with PM2
- Troubleshooting guide for common issues
- Production security checklist

---

## API Reference

All endpoints are prefixed with `/api/v1/`. Interactive docs available at **http://localhost:3000/api-docs**.

| Resource | Base Path | Auth |
|----------|-----------|------|
| Auth | `/auth` | Public (login), Protected (logout/me) |
| Onboarding | `/onboarding` | Public (register/validate), JWT (steps 3+) |
| Flats | `/flats` | Admin |
| Blocks | `/blocks` | Admin |
| Residents | `/residents` | Admin |
| Billing | `/billing` | Admin (manage), Owner/Tenant (view own) |
| Visitors | `/visitors` | Security/Admin (log), Owner/Tenant (view own) |
| Assets | `/assets` | Admin |
| Parking | `/parking` | Admin |
| Notices | `/notices` | Admin (manage), All (read) |
| Complaints | `/complaints` | Owner/Tenant (raise), Admin (manage) |
| Staff | `/staff` | Admin |
| Notifications | `/notifications` | All residents |
| Settings | `/settings` | All (read), Admin (write) |
| Directory | `/directory` | All residents |
| Expenses | `/expenses` | Admin |
| Income | `/income` | Admin |
| Invoices | `/invoices` | Admin |
| Vendors | `/vendors` | Admin |
| Events | `/events` | Admin |
| Committee | `/committee` | Admin |
| ACL | `/acl` | Admin |
| Users | `/users` | Admin |
| Helpers | `/helpers` | Admin |
