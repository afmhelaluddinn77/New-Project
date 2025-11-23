-- CreateTable
CREATE TABLE "fhir_resources" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "version" TEXT DEFAULT 'R4',
    "body" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fhir_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fhir_resources_resourceType_idx" ON "fhir_resources"("resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "fhir_resources_resourceType_resourceId_key" ON "fhir_resources"("resourceType", "resourceId");
