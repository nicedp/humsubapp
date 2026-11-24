-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'owner', 'tenant', 'security');

-- CreateEnum
CREATE TYPE "FlatStatus" AS ENUM ('occupied', 'vacant');

-- CreateEnum
CREATE TYPE "FlatType" AS ENUM ('regular', 'penthouse');

-- CreateEnum
CREATE TYPE "ResidentType" AS ENUM ('owner', 'tenant');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('unpaid', 'paid', 'overdue');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('cash', 'upi', 'bank_transfer', 'cheque');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('car', 'bike', 'scooter', 'other');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('lift', 'borewell', 'water_tank', 'generator', 'other');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('operational', 'under_maintenance', 'out_of_service');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('maintenance', 'noise', 'cleanliness', 'security', 'billing', 'other');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateTable
CREATE TABLE "flats" (
    "id" TEXT NOT NULL,
    "flatNumber" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "type" "FlatType" NOT NULL DEFAULT 'regular',
    "sqFt" DOUBLE PRECISION NOT NULL,
    "status" "FlatStatus" NOT NULL DEFAULT 'vacant',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "flatId" TEXT NOT NULL,
    "residentType" "ResidentType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "moveInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moveOutDate" TIMESTAMP(3),
    "numCars" INTEGER NOT NULL DEFAULT 0,
    "numBikes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "residentId" TEXT,
    "staffId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_bills" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'unpaid',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMode" "PaymentMode" NOT NULL,
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "phone" TEXT,
    "vehicleNumber" TEXT,
    "purpose" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitTime" TIMESTAMP(3),
    "loggedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "status" "AssetStatus" NOT NULL DEFAULT 'operational',
    "location" TEXT,
    "lastServiceDate" TIMESTAMP(3),
    "nextServiceDue" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "id" TEXT NOT NULL,
    "slotNumber" TEXT NOT NULL,
    "flatId" TEXT,
    "vehicleNumber" TEXT,
    "vehicleType" TEXT,
    "isOccupied" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "priority" "NoticePriority" NOT NULL DEFAULT 'normal',
    "postedBy" TEXT,
    "postedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "raisedBy" TEXT,
    "category" "ComplaintCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ComplaintStatus" NOT NULL DEFAULT 'open',
    "adminRemark" TEXT,
    "raisedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedOn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "shift" TEXT,
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flatId" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "flatId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "society_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "ratePerSqft" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "fixedCharge" DOUBLE PRECISION NOT NULL DEFAULT 700.0,
    "lateFeeGraceDays" INTEGER NOT NULL DEFAULT 10,
    "lateFeePerDay" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "societyName" TEXT NOT NULL DEFAULT 'Residential Society',
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "society_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flats_flatNumber_key" ON "flats"("flatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "residents_email_key" ON "residents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_residentId_key" ON "users"("residentId");

-- CreateIndex
CREATE UNIQUE INDEX "users_staffId_key" ON "users"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_bills_flatId_month_year_key" ON "maintenance_bills"("flatId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payments_billId_key" ON "payments"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "parking_slots_slotNumber_key" ON "parking_slots"("slotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicleNumber_key" ON "vehicles"("vehicleNumber");

-- AddForeignKey
ALTER TABLE "residents" ADD CONSTRAINT "residents_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_bills" ADD CONSTRAINT "maintenance_bills_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_billId_fkey" FOREIGN KEY ("billId") REFERENCES "maintenance_bills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_flatId_fkey" FOREIGN KEY ("flatId") REFERENCES "flats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
