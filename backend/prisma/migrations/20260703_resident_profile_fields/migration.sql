-- Add profile fields to residents table
ALTER TABLE "residents"
  ADD COLUMN IF NOT EXISTS "dateOfBirth"           TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "idProofType"           TEXT,
  ADD COLUMN IF NOT EXISTS "idProofNumber"         TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactName"  TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyContactPhone" TEXT;

-- Create family_members table
CREATE TABLE IF NOT EXISTS "family_members" (
  "id"          TEXT NOT NULL,
  "residentId"  TEXT NOT NULL,
  "name"        TEXT NOT NULL,
  "relation"    TEXT NOT NULL,
  "phone"       TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "isEmergency" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL,

  CONSTRAINT "family_members_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "family_members_residentId_fkey"
    FOREIGN KEY ("residentId") REFERENCES "residents"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);