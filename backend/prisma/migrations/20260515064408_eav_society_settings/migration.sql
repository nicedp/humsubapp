/*
  Warnings:

  - The primary key for the `society_settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `fixedCharge` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeeGraceDays` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `lateFeePerDay` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `ratePerSqft` on the `society_settings` table. All the data in the column will be lost.
  - You are about to drop the column `societyName` on the `society_settings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[societyId,varName]` on the table `society_settings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `varName` to the `society_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `varValue` to the `society_settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "society_settings" DROP CONSTRAINT "society_settings_pkey",
DROP COLUMN "address",
DROP COLUMN "createdAt",
DROP COLUMN "fixedCharge",
DROP COLUMN "lateFeeGraceDays",
DROP COLUMN "lateFeePerDay",
DROP COLUMN "ratePerSqft",
DROP COLUMN "societyName",
ADD COLUMN     "societyId" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "varName" TEXT NOT NULL,
ADD COLUMN     "varValue" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "society_settings_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "society_settings_societyId_varName_key" ON "society_settings"("societyId", "varName");
