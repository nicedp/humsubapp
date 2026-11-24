/*
  Warnings:

  - A unique constraint covering the columns `[societyId,flatNumber]` on the table `flats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[societyId,slotNumber]` on the table `parking_slots` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `societyId` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `flats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `notices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `parking_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `staff` table without a default value. This is not possible if the table is not empty.
  - Added the required column `societyId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "flats_flatNumber_key";

-- DropIndex
DROP INDEX "parking_slots_slotNumber_key";

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "flats" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "notices" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "parking_slots" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "societyId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "flats_societyId_flatNumber_key" ON "flats"("societyId", "flatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_societyId_slotNumber_key" ON "parking_slots"("societyId", "slotNumber");

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
