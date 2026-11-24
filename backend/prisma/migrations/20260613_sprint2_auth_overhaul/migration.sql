-- Sprint 2: Auth Overhaul
-- Creates: login_sessions, password_reset_tokens, totp_secrets

-- ─── login_sessions ────────────────────────────────────────────────────────
CREATE TABLE "login_sessions" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,
  "browser"   TEXT,
  "device"    TEXT,
  "city"      TEXT,
  "loggedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "isActive"  BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "login_sessions_pkey" PRIMARY KEY ("id")
);

-- ─── password_reset_tokens ─────────────────────────────────────────────────
CREATE TABLE "password_reset_tokens" (
  "id"        TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "token"     TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- ─── totp_secrets ──────────────────────────────────────────────────────────
CREATE TABLE "totp_secrets" (
  "userId"      TEXT NOT NULL,
  "secret"      TEXT NOT NULL,
  "isEnabled"   BOOLEAN NOT NULL DEFAULT false,
  "backupCodes" TEXT[],

  CONSTRAINT "totp_secrets_pkey" PRIMARY KEY ("userId")
);

-- ─── Foreign Keys ──────────────────────────────────────────────────────────
ALTER TABLE "login_sessions"
  ADD CONSTRAINT "login_sessions_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "password_reset_tokens"
  ADD CONSTRAINT "password_reset_tokens_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "totp_secrets"
  ADD CONSTRAINT "totp_secrets_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Seed: require_2fa society setting (default false) ────────────────────
INSERT INTO "society_settings" ("id", "societyId", "varName", "varValue", "updatedAt")
SELECT gen_random_uuid(), "id", 'require_2fa', 'false', NOW()
FROM "societies"
WHERE "id" = 1
ON CONFLICT ("societyId", "varName") DO NOTHING;