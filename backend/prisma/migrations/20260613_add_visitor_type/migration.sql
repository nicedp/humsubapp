-- Migration: Add VisitorType enum and visitorType column to visitors table
-- Also makes purpose optional (nullable) since visitorType replaces it as the primary category

-- Create the VisitorType enum
CREATE TYPE "VisitorType" AS ENUM (
  'guest',
  'delivery',
  'milkman',
  'service',
  'plumber',
  'electrician',
  'dth',
  'broadband',
  'solar',
  'gas',
  'cab',
  'courier',
  'other'
);

-- Add visitorType column with default 'other' (preserves all existing rows)
ALTER TABLE "visitors" ADD COLUMN "visitorType" "VisitorType" NOT NULL DEFAULT 'other';

-- Make purpose optional (it becomes free-text notes, visitorType is now the category)
ALTER TABLE "visitors" ALTER COLUMN "purpose" DROP NOT NULL;