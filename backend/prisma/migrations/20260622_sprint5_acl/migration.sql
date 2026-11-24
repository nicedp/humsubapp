-- Sprint 5: ACL + Persistent JWT Blacklist + New Roles
-- Migration: 20260622_sprint5_acl

-- ─── Extend Role enum ─────────────────────────────────────────────────────────
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'sub_admin';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'member';

-- ─── Blacklisted Tokens (persistent JWT blacklist) ───────────────────────────
CREATE TABLE IF NOT EXISTS "blacklisted_tokens" (
    "id"        TEXT NOT NULL,
    "token"     TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "blacklisted_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "blacklisted_tokens_token_key" ON "blacklisted_tokens"("token");

-- ─── Permission Module enum ───────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE "PermissionModule" AS ENUM (
        'billing', 'residents', 'flats', 'visitors', 'notices', 'complaints',
        'staff', 'assets', 'parking', 'expenses', 'income', 'invoices',
        'events', 'vendors', 'committee', 'helpers', 'settings', 'users', 'reports'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ─── Role Permissions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "id"        TEXT NOT NULL,
    "societyId" INTEGER NOT NULL,
    "role"      TEXT NOT NULL,
    "module"    "PermissionModule" NOT NULL,
    "canView"   BOOLEAN NOT NULL DEFAULT false,
    "canCreate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit"   BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "canExport" BOOLEAN NOT NULL DEFAULT false,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "role_permissions_societyId_role_module_key"
    ON "role_permissions"("societyId", "role", "module");

-- ─── Default Permission Presets for societyId=1 ──────────────────────────────
-- sub_admin defaults
INSERT INTO "role_permissions" ("id","societyId","role","module","canView","canCreate","canEdit","canDelete","canExport","updatedAt")
VALUES
  (gen_random_uuid(),1,'sub_admin','billing',  true, true, true, false,true, NOW()),
  (gen_random_uuid(),1,'sub_admin','residents',true, true, true, false,true, NOW()),
  (gen_random_uuid(),1,'sub_admin','flats',    true, true, true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','visitors', true, true, false,false,true, NOW()),
  (gen_random_uuid(),1,'sub_admin','notices',  true, true, true, true, false,NOW()),
  (gen_random_uuid(),1,'sub_admin','complaints',true,false,true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','staff',    true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','assets',   true, false,true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','parking',  true, false,true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','expenses', true, true, false,false,true, NOW()),
  (gen_random_uuid(),1,'sub_admin','income',   true, true, false,false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','invoices', true, true, false,false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','events',   true, true, true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','vendors',  true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','committee',true, false,true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','helpers',  true, true, true, false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','reports',  true, false,false,false,true, NOW()),
  (gen_random_uuid(),1,'sub_admin','settings', false,false,false,false,false,NOW()),
  (gen_random_uuid(),1,'sub_admin','users',    false,false,false,false,false,NOW())
ON CONFLICT ("societyId","role","module") DO NOTHING;

-- member defaults
INSERT INTO "role_permissions" ("id","societyId","role","module","canView","canCreate","canEdit","canDelete","canExport","updatedAt")
VALUES
  (gen_random_uuid(),1,'member','billing',   true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','residents', true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','flats',     true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','visitors',  true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','notices',   true, true, false,false,false,NOW()),
  (gen_random_uuid(),1,'member','complaints',true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','staff',     true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','assets',    true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','parking',   true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','expenses',  true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','income',    true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','invoices',  true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','events',    true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','vendors',   true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','committee', true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','helpers',   true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','reports',   true, false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','settings',  false,false,false,false,false,NOW()),
  (gen_random_uuid(),1,'member','users',     false,false,false,false,false,NOW())
ON CONFLICT ("societyId","role","module") DO NOTHING;