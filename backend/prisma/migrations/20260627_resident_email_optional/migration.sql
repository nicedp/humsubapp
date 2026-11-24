-- Make resident email nullable (was required String @unique)
ALTER TABLE "residents" ALTER COLUMN "email" DROP NOT NULL;