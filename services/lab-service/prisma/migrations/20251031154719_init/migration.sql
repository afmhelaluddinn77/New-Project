-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESULT_READY', 'VERIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabTestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AbnormalFlag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "LabOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "priority" "OrderPriority" NOT NULL,
    "status" "LabOrderStatus" NOT NULL DEFAULT 'NEW',
    "clinicalNotes" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resultedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabOrderTest" (
    "id" TEXT NOT NULL,
    "labOrderId" TEXT NOT NULL,
    "loincCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "specimenType" TEXT,
    "status" "LabTestStatus" NOT NULL DEFAULT 'PENDING',
    "performedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabOrderTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResult" (
    "id" TEXT NOT NULL,
    "labOrderTestId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceRange" TEXT,
    "abnormalFlag" "AbnormalFlag" NOT NULL DEFAULT 'NORMAL',
    "comment" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LabOrder_orderNumber_key" ON "LabOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "LabOrder_patientId_idx" ON "LabOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabOrder_providerId_idx" ON "LabOrder"("providerId");

-- CreateIndex
CREATE INDEX "LabOrderTest_labOrderId_idx" ON "LabOrderTest"("labOrderId");

-- CreateIndex
CREATE INDEX "LabOrderTest_loincCode_idx" ON "LabOrderTest"("loincCode");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_labOrderTestId_key" ON "LabResult"("labOrderTestId");

-- AddForeignKey
ALTER TABLE "LabOrderTest" ADD CONSTRAINT "LabOrderTest_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES "LabOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_labOrderTestId_fkey" FOREIGN KEY ("labOrderTestId") REFERENCES "LabOrderTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
