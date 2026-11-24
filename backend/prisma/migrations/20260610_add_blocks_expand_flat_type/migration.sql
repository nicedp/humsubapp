-- Migration: add_blocks_expand_flat_type
-- 1. Add BlockType enum
DO $$ BEGIN
  CREATE TYPE "BlockType" AS ENUM ('flats', 'rowhouses', 'mixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create blocks table
CREATE TABLE IF NOT EXISTS "blocks" (
  "id"          TEXT NOT NULL,
  "societyId"   INTEGER NOT NULL DEFAULT 1,
  "name"        TEXT NOT NULL,
  "description" TEXT,
  "blockType"   "BlockType" NOT NULL DEFAULT 'flats',
  "totalFloors" INTEGER,
  "isActive"    BOOLEAN NOT NULL DEFAULT true,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "blocks_pkey" PRIMARY KEY ("id")
);

-- 3. Add unique constraint on blocks(societyId, name)
DO $$ BEGIN
  ALTER TABLE "blocks" ADD CONSTRAINT "blocks_societyId_name_key" UNIQUE ("societyId", "name");
EXCEPTION
  WHEN duplicate_table THEN null;
END $$;

-- 4. Add FK from blocks to societies
DO $$ BEGIN
  ALTER TABLE "blocks" ADD CONSTRAINT "blocks_societyId_fkey"
    FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 5. Add blockId column to flats (nullable FK)
ALTER TABLE "flats" ADD COLUMN IF NOT EXISTS "blockId" TEXT;

-- 6. Make floor nullable in flats
ALTER TABLE "flats" ALTER COLUMN "floor" DROP NOT NULL;

-- 7. Add FK from flats.blockId to blocks.id
DO $$ BEGIN
  ALTER TABLE "flats" ADD CONSTRAINT "flats_blockId_fkey"
    FOREIGN KEY ("blockId") REFERENCES "blocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Replace FlatType to remove 'regular' while adding the new values.
-- Creating the replacement enum avoids using uncommitted values from ALTER TYPE ADD VALUE.
ALTER TABLE "flats" ALTER COLUMN "type" DROP DEFAULT;
ALTER TYPE "FlatType" RENAME TO "FlatType_old";

CREATE TYPE "FlatType" AS ENUM ('flat', 'single', 'duplex', 'triplex', 'bungalow', 'penthouse');

ALTER TABLE "flats" ALTER COLUMN "type" TYPE "FlatType"
  USING (CASE WHEN "type"::text = 'regular' THEN 'flat' ELSE "type"::text END)::"FlatType";
ALTER TABLE "flats" ALTER COLUMN "type" SET DEFAULT 'flat'::"FlatType";

DROP TYPE "FlatType_old";