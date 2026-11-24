-- Migration: Add UNIQUE constraint on societies.contactEmail
-- This enforces that no two societies can register with the same email address.
-- The application-level duplicate check in onboarding.service.ts now relies on
-- Prisma P2002 (unique constraint violation) rather than a separate findFirst guard.

-- Add unique index on contactEmail (nullable columns can still be NULL multiple times in Postgres)
CREATE UNIQUE INDEX IF NOT EXISTS "societies_contactEmail_key"
  ON "societies" ("contactEmail")
  WHERE "contactEmail" IS NOT NULL;