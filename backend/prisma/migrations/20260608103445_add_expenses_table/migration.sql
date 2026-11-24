-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('maintenance', 'utility', 'salary', 'repair', 'admin', 'other');

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL,
    "vendor" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
