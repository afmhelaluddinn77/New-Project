-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('OPD', 'IPD');

-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('NEW', 'REVIEW_PENDING', 'VERIFIED', 'DISPENSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('ACTIVE', 'MODIFIED', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "InteractionSeverity" AS ENUM ('MINOR', 'MODERATE', 'MAJOR', 'CONTRAINDICATED');

-- CreateTable
CREATE TABLE "PrescriptionOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "orderType" "OrderType" NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "dispensedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationItem" (
    "id" TEXT NOT NULL,
    "prescriptionOrderId" TEXT NOT NULL,
    "rxNormId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "instructions" TEXT,
    "status" "MedicationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInteractionCheck" (
    "id" TEXT NOT NULL,
    "prescriptionOrderId" TEXT NOT NULL,
    "severity" "InteractionSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugInteractionCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionOrder_orderNumber_key" ON "PrescriptionOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "MedicationItem_prescriptionOrderId_idx" ON "MedicationItem"("prescriptionOrderId");

-- CreateIndex
CREATE INDEX "DrugInteractionCheck_prescriptionOrderId_idx" ON "DrugInteractionCheck"("prescriptionOrderId");

-- AddForeignKey
ALTER TABLE "MedicationItem" ADD CONSTRAINT "MedicationItem_prescriptionOrderId_fkey" FOREIGN KEY ("prescriptionOrderId") REFERENCES "PrescriptionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugInteractionCheck" ADD CONSTRAINT "DrugInteractionCheck_prescriptionOrderId_fkey" FOREIGN KEY ("prescriptionOrderId") REFERENCES "PrescriptionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
