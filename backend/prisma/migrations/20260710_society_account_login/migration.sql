-- Migration: Society Account Number + Society URL + Account-Based Login
-- Date: 2026-07-10
-- Account number format: YYYYMMNNN (no slash), counter starts at 1001
-- e.g. first society in Jul 2026 = 2026071001, second = 2026071002
--
-- 1. Add societyUrl and accountNumber columns to societies table (camelCase — Prisma default)
-- 2. Backfill existing society (id=1) with defaults
-- 3. Drop global unique index on users.username
-- 4. Add compound unique index on (societyId, username)

-- Step 1: Add new columns to societies
ALTER TABLE "societies" ADD COLUMN IF NOT EXISTS "societyUrl" VARCHAR(255);
ALTER TABLE "societies" ADD COLUMN IF NOT EXISTS "accountNumber" VARCHAR(20);

-- Step 2: Backfill id=1 (the dev/single-society deployment seed)
-- accountNumber = 202601 (Jan 2026) + 1001 (first counter) = 2026011001
UPDATE "societies"
SET
  "societyUrl"    = 'default-society',
  "accountNumber" = '2026011001'
WHERE id = 1
  AND "societyUrl" IS NULL;

-- Step 3: Add unique constraints (after backfill so existing row is valid)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'societies_societyUrl_key'
  ) THEN
    ALTER TABLE "societies" ADD CONSTRAINT "societies_societyUrl_key" UNIQUE ("societyUrl");
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'societies_accountNumber_key'
  ) THEN
    ALTER TABLE "societies" ADD CONSTRAINT "societies_accountNumber_key" UNIQUE ("accountNumber");
  END IF;
END
$$;

-- Step 4: Drop the old global unique index on username
-- Prisma generates the constraint name as users_username_key for @unique on a single field
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_key";

-- Step 5: Add compound unique index (societyId + username)
-- Prisma maps @@unique([societyId, username]) as "users_societyId_username_key"
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_societyId_username_key'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT "users_societyId_username_key" UNIQUE ("societyId", "username");
  END IF;
END
$$;