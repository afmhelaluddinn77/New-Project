-- CreateTable
CREATE TABLE "LabResultComponent" (
    "id" TEXT NOT NULL,
    "labResultId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT NOT NULL,
    "referenceRangeLow" DOUBLE PRECISION,
    "referenceRangeHigh" DOUBLE PRECISION,
    "referenceRangeText" TEXT,
    "interpretation" TEXT NOT NULL,
    "trend" TEXT,
    "criticalValue" BOOLEAN NOT NULL DEFAULT false,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabResultComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResultHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "componentCode" TEXT NOT NULL,
    "value" TEXT,
    "numericValue" DOUBLE PRECISION,
    "unit" TEXT,
    "interpretation" TEXT,
    "performedAt" TIMESTAMP(3) NOT NULL,
    "orderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LabResultHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestTemplate" (
    "id" TEXT NOT NULL,
    "loincCode" TEXT NOT NULL,
    "testName" TEXT NOT NULL,

    CONSTRAINT "LabTestTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestTemplateComponent" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "unit" TEXT,
    "referenceRangeLow" DOUBLE PRECISION,
    "referenceRangeHigh" DOUBLE PRECISION,
    "referenceRangeText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LabTestTemplateComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabResultExport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "orderIds" TEXT[],
    "format" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "parameters" JSONB,
    "status" TEXT NOT NULL,
    "filePath" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LabResultExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabResultComponent_labResultId_idx" ON "LabResultComponent"("labResultId");

-- CreateIndex
CREATE INDEX "LabResultComponent_code_idx" ON "LabResultComponent"("code");

-- CreateIndex
CREATE INDEX "LabResultHistory_patientId_idx" ON "LabResultHistory"("patientId");

-- CreateIndex
CREATE INDEX "LabResultHistory_componentCode_idx" ON "LabResultHistory"("componentCode");

-- CreateIndex
CREATE INDEX "LabResultHistory_performedAt_idx" ON "LabResultHistory"("performedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabTestTemplate_loincCode_key" ON "LabTestTemplate"("loincCode");

-- CreateIndex
CREATE INDEX "LabTestTemplateComponent_templateId_idx" ON "LabTestTemplateComponent"("templateId");

-- CreateIndex
CREATE INDEX "LabTestTemplateComponent_code_idx" ON "LabTestTemplateComponent"("code");

-- AddForeignKey
ALTER TABLE "LabResultComponent" ADD CONSTRAINT "LabResultComponent_labResultId_fkey" FOREIGN KEY ("labResultId") REFERENCES "LabResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestTemplateComponent" ADD CONSTRAINT "LabTestTemplateComponent_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "LabTestTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
