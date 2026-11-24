# Tech Context — Society Management Portal

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | SPA framework |
| TypeScript | 5.x | Type safety |
| React Router v6 | 6.x | Client-side routing |
| Axios | latest | HTTP client for API calls |
| TailwindCSS | 3.x | Utility-first styling |
| React Query (TanStack) | 5.x | Server state management + caching |
| React Hook Form | 7.x | Form handling and validation |
| Zod | 3.x | Schema validation (paired with RHF) |
| Recharts | 2.x | Charts for admin dashboard |
| date-fns | 3.x | Date formatting and manipulation |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| Express.js | 4.x | Web framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM + database migrations |
| jsonwebtoken | 9.x | JWT encode/decode |
| bcryptjs | 2.x | Password hashing |
| zod | 3.x | Request DTO validation |
| dotenv | 16.x | Environment variable management |
| cors | 2.x | CORS middleware |
| helmet | 7.x | HTTP security headers |
| express-async-errors | 3.x | Async error handling middleware |

### Database
| Technology | Purpose |
|-----------|---------|
| PostgreSQL 15+ | Primary relational database |

### Infrastructure / Dev Tools
| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Local dev environment (DB + backend + frontend) |
| Prisma Migrate | DB schema migrations |
| tsx / ts-node-dev | TypeScript live reload for development |
| Vite | React project bundler |

## Backend Architecture — Layer Structure

The backend follows a strict layered architecture: DTOs (input validation) + Transformers (output shaping) + Controllers + Services + Utils + Models + Helpers:

```
backend/
├── src/
│   ├── server.ts                  # HTTP server entry point
│   ├── app.ts                     # Express app setup (middleware, routes)
│   ├── config/
│   │   └── db.ts                  # Prisma client singleton
│   ├── models/                    # Prisma-generated types + model helpers
│   │   └── (re-exports from @prisma/client)
│   ├── dtos/                      # Zod schemas for REQUEST validation (input only)
│   │   ├── auth.dto.ts
│   │   ├── flat.dto.ts
│   │   ├── resident.dto.ts
│   │   ├── billing.dto.ts
│   │   ├── visitor.dto.ts
│   │   ├── asset.dto.ts
│   │   ├── parking.dto.ts
│   │   ├── notice.dto.ts
│   │   ├── complaint.dto.ts
│   │   ├── staff.dto.ts
│   │   ├── notification.dto.ts
│   │   └── settings.dto.ts
│   ├── transformers/              # Response shaping (output only) — strip PII, add computed fields
│   │   ├── flat.transformer.ts
│   │   ├── resident.transformer.ts
│   │   ├── billing.transformer.ts
│   │   ├── visitor.transformer.ts
│   │   ├── asset.transformer.ts
│   │   ├── parking.transformer.ts
│   │   ├── notice.transformer.ts
│   │   ├── complaint.transformer.ts
│   │   ├── staff.transformer.ts
│   │   ├── notification.transformer.ts
│   │   └── directory.transformer.ts
│   ├── controllers/               # Express route handlers (thin — delegate to services + transformers)
│   │   ├── auth.controller.ts
│   │   ├── flat.controller.ts
│   │   ├── resident.controller.ts
│   │   ├── billing.controller.ts
│   │   ├── visitor.controller.ts
│   │   ├── asset.controller.ts
│   │   ├── parking.controller.ts
│   │   ├── notice.controller.ts
│   │   ├── complaint.controller.ts
│   │   ├── staff.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── settings.controller.ts
│   │   └── directory.controller.ts
│   ├── services/                  # Business logic layer — returns raw Prisma objects
│   │   ├── auth.service.ts
│   │   ├── flat.service.ts
│   │   ├── resident.service.ts
│   │   ├── billing.service.ts
│   │   ├── visitor.service.ts
│   │   ├── asset.service.ts
│   │   ├── parking.service.ts
│   │   ├── notice.service.ts
│   │   ├── complaint.service.ts
│   │   ├── staff.service.ts
│   │   ├── notification.service.ts
│   │   ├── settings.service.ts
│   │   └── directory.service.ts
│   ├── routes/                    # Express Router definitions
│   │   ├── auth.routes.ts
│   │   ├── flat.routes.ts
│   │   ├── resident.routes.ts
│   │   ├── billing.routes.ts
│   │   ├── visitor.routes.ts
│   │   ├── asset.routes.ts
│   │   ├── parking.routes.ts
│   │   ├── notice.routes.ts
│   │   ├── complaint.routes.ts
│   │   ├── staff.routes.ts
│   │   ├── notification.routes.ts
│   │   ├── settings.routes.ts
│   │   └── directory.routes.ts
│   ├── middleware/                # Express middleware
│   │   ├── auth.middleware.ts     # JWT verify + attach user to req
│   │   ├── role.middleware.ts     # Role-based access guard
│   │   ├── validate.middleware.ts # Zod DTO validation middleware
│   │   └── error.middleware.ts    # Global error handler
│   ├── utils/                     # Pure utility functions
│   │   ├── jwt.utils.ts           # sign/verify JWT
│   │   ├── hash.utils.ts          # bcrypt hash/compare
│   │   └── date.utils.ts          # date helpers (late fee calc)
│   └── helpers/                   # Domain-specific helpers
│       ├── billing.helper.ts      # Maintenance amount + late fee calculation
│       └── pagination.helper.ts   # skip/limit pagination helper
├── prisma/
│   ├── schema.prisma              # Prisma schema (all 13 models)
│   └── seed.ts                    # Seed script (societySettings defaults)
├── .env
├── package.json
├── tsconfig.json
└── Dockerfile
```

### Frontend
```
frontend/
├── src/
│   ├── api/                       # Axios API layer (one file per resource)
│   ├── components/                # Reusable UI components
│   ├── pages/
│   │   ├── admin/
│   │   ├── resident/
│   │   └── guard/
│   ├── hooks/                     # Custom React hooks
│   ├── context/                   # AuthContext
│   ├── types/                     # TypeScript type definitions
│   └── utils/                     # Frontend helpers
├── public/
├── package.json
├── tsconfig.json
└── Dockerfile
```

## Development Setup

### Prerequisites
- Docker Desktop installed
- Node.js 20+ (for backend/frontend dev without Docker)

### Environment Variables (Backend `.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/society_db
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=8h
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3000
```

### Environment Variables (Frontend `.env`)
```
VITE_API_URL=http://localhost:3000
```

### Running Locally (Docker)
```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### Running Migrations
```bash
# Inside backend container or locally
npx prisma migrate deploy
```

### Seeding Database
```bash
npx prisma db seed
```

## Technical Constraints
- No external payment gateway integration in v1 (payments recorded manually by admin)
- No SMS/email notifications in v1 (in-app notifications only)
- No file upload for receipts in v1 (text-based payment records)
- Single-society deployment (no multi-tenancy)
- No mobile app — responsive web only
- UUID primary keys throughout (Prisma `@id @default(uuid())`)
- All timestamps: `createdAt`, `updatedAt` on all models

## API Conventions
- All endpoints prefixed with `/api/v1/`
- JSON request and response bodies
- Auth header: `Authorization: Bearer <token>`
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500)
- Paginated list endpoints use `?skip=0&limit=20` query params
- DTO validation via Zod in `validate.middleware.ts` — controllers receive typed, validated data
- All responses shaped by transformers before `res.json()` — no raw Prisma objects sent to client

## Security Considerations
- Passwords hashed with bcrypt (never stored plain)
- JWT access tokens expire in 8h; refresh token for 7 days
- Role checked server-side via `role.middleware.ts` on every protected endpoint
- CORS configured to allow only frontend origin
- Helmet.js sets secure HTTP headers
- Transformers ensure `passwordHash` and other sensitive fields are NEVER sent in responses