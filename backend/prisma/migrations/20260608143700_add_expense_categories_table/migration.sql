-- CreateTable: expense_categories (per-society configurable expense categories)
CREATE TABLE "expense_categories" (
    "id" SERIAL NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique slug per society
CREATE UNIQUE INDEX "expense_categories_societyId_slug_key" ON "expense_categories"("societyId", "slug");

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Migrate expenses.category from enum to TEXT (data-preserving)
-- Step 1: Add a temporary text column
ALTER TABLE "expenses" ADD COLUMN "category_text" TEXT;

-- Step 2: Copy enum value (cast to text) into the new column
UPDATE "expenses" SET "category_text" = "category"::text;

-- Step 3: Drop the old enum column
ALTER TABLE "expenses" DROP COLUMN "category";

-- Step 4: Rename the text column to category
ALTER TABLE "expenses" RENAME COLUMN "category_text" TO "category";

-- Step 5: Make the column NOT NULL (all existing rows now have text values)
ALTER TABLE "expenses" ALTER COLUMN "category" SET NOT NULL;

-- Step 6: Drop the old PostgreSQL enum type
DROP TYPE IF EXISTS "ExpenseCategory";
