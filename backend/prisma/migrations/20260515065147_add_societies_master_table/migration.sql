-- CreateTable
CREATE TABLE "societies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "registrationNumber" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "societies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "societies_registrationNumber_key" ON "societies"("registrationNumber");

-- AddForeignKey
ALTER TABLE "society_settings" ADD CONSTRAINT "society_settings_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
