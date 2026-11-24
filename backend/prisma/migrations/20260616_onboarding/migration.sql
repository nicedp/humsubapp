-- CreateEnum
CREATE TYPE "SocietyStatus" AS ENUM ('pending', 'setup', 'active', 'suspended');

-- AlterTable: Add onboarding fields to societies
-- DEFAULT 'active' ensures existing rows (id=1) remain unaffected
ALTER TABLE "societies"
  ADD COLUMN "status"           "SocietyStatus" NOT NULL DEFAULT 'active',
  ADD COLUMN "setupToken"       TEXT,
  ADD COLUMN "setupTokenExpiry" TIMESTAMP(3),
  ADD COLUMN "logoUrl"          TEXT,
  ADD COLUMN "activatedAt"      TIMESTAMP(3);

-- Unique constraint on setupToken
CREATE UNIQUE INDEX "societies_setupToken_key" ON "societies"("setupToken");

-- CreateTable: onboarding_sessions
CREATE TABLE "onboarding_sessions" (
    "id"           TEXT NOT NULL,
    "societyId"    INTEGER NOT NULL,
    "currentStep"  INTEGER NOT NULL DEFAULT 1,
    "step1Data"    JSONB,
    "step2Data"    JSONB,
    "step3Data"    JSONB,
    "completedAt"  TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_sessions_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one session per society
CREATE UNIQUE INDEX "onboarding_sessions_societyId_key" ON "onboarding_sessions"("societyId");

-- AddForeignKey
ALTER TABLE "onboarding_sessions"
  ADD CONSTRAINT "onboarding_sessions_societyId_fkey"
  FOREIGN KEY ("societyId") REFERENCES "societies"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;