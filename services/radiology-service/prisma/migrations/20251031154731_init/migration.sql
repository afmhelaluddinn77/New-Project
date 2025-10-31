-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "StudyType" AS ENUM ('XRAY', 'CT', 'MRI', 'ULTRASOUND', 'OTHER');

-- CreateEnum
CREATE TYPE "RadiologyOrderStatus" AS ENUM ('NEW', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'REPORTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'FINAL', 'AMENDED');

-- CreateTable
CREATE TABLE "RadiologyOrder" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "studyType" "StudyType" NOT NULL,
    "bodyPart" TEXT NOT NULL,
    "contrast" BOOLEAN NOT NULL DEFAULT false,
    "priority" "OrderPriority" NOT NULL,
    "status" "RadiologyOrderStatus" NOT NULL DEFAULT 'NEW',
    "clinicalIndication" TEXT,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadiologyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadiologyReport" (
    "id" TEXT NOT NULL,
    "radiologyOrderId" TEXT NOT NULL,
    "reportText" TEXT NOT NULL,
    "impression" TEXT,
    "criticalFinding" BOOLEAN NOT NULL DEFAULT false,
    "reportingRadiologistId" TEXT NOT NULL,
    "reportStatus" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadiologyReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImagingAsset" (
    "id" TEXT NOT NULL,
    "radiologyOrderId" TEXT NOT NULL,
    "uri" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImagingAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RadiologyOrder_orderNumber_key" ON "RadiologyOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "RadiologyOrder_patientId_idx" ON "RadiologyOrder"("patientId");

-- CreateIndex
CREATE INDEX "RadiologyOrder_providerId_idx" ON "RadiologyOrder"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "RadiologyReport_radiologyOrderId_key" ON "RadiologyReport"("radiologyOrderId");

-- CreateIndex
CREATE INDEX "ImagingAsset_radiologyOrderId_idx" ON "ImagingAsset"("radiologyOrderId");

-- AddForeignKey
ALTER TABLE "RadiologyReport" ADD CONSTRAINT "RadiologyReport_radiologyOrderId_fkey" FOREIGN KEY ("radiologyOrderId") REFERENCES "RadiologyOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImagingAsset" ADD CONSTRAINT "ImagingAsset_radiologyOrderId_fkey" FOREIGN KEY ("radiologyOrderId") REFERENCES "RadiologyOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
