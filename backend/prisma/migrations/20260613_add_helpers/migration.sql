-- Migration: Add HelperCategory enum and helpers table

-- Create the HelperCategory enum
CREATE TYPE "HelperCategory" AS ENUM (
  'electrician',
  'plumber',
  'carpenter',
  'ac_service',
  'motor_binding',
  'generator_service',
  'painting',
  'pest_control',
  'housekeeping',
  'security_service',
  'other'
);

-- Create the helpers table
CREATE TABLE "helpers" (
  "id"             TEXT NOT NULL,
  "societyId"      INTEGER NOT NULL DEFAULT 1,
  "name"           TEXT NOT NULL,
  "phone"          TEXT NOT NULL,
  "alternatePhone" TEXT,
  "email"          TEXT,
  "category"       "HelperCategory" NOT NULL,
  "description"    TEXT,
  "photoUrl"       TEXT,
  "isActive"       BOOLEAN NOT NULL DEFAULT true,
  "addedBy"        TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,

  CONSTRAINT "helpers_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "helpers_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);