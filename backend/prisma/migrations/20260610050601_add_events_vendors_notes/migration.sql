-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('planning', 'active', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "AMCStatus" AS ENUM ('active', 'expired', 'cancelled', 'pending_renewal');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'planning',
    "budgetTarget" DOUBLE PRECISION,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_contributions" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "contributorName" TEXT NOT NULL,
    "flatId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMode" "PaymentMode" NOT NULL DEFAULT 'cash',
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_expenses" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vendor" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_team_members" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "serviceType" TEXT NOT NULL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amc_contracts" (
    "id" TEXT NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "vendorId" TEXT NOT NULL,
    "assetId" TEXT,
    "contractNumber" TEXT,
    "serviceType" TEXT NOT NULL,
    "annualCost" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "serviceFrequencyDays" INTEGER NOT NULL DEFAULT 90,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDue" TIMESTAMP(3),
    "status" "AMCStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "amc_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "amc_service_logs" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "technicianName" TEXT,
    "workDone" TEXT NOT NULL,
    "serviceCost" DOUBLE PRECISION,
    "nextServiceDue" TIMESTAMP(3),
    "remarks" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "amc_service_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "societyId" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'yellow',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_team_members_eventId_residentId_key" ON "event_team_members"("eventId", "residentId");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_contributions" ADD CONSTRAINT "event_contributions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_contributions" ADD CONSTRAINT "event_contributions_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_expenses" ADD CONSTRAINT "event_expenses_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_team_members" ADD CONSTRAINT "event_team_members_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_team_members" ADD CONSTRAINT "event_team_members_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "amc_service_logs" ADD CONSTRAINT "amc_service_logs_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "amc_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notes" ADD CONSTRAINT "user_notes_societyId_fkey" FOREIGN KEY ("societyId") REFERENCES "societies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
