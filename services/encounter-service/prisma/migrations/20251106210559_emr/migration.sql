-- CreateEnum
CREATE TYPE "EncounterType" AS ENUM ('OUTPATIENT', 'INPATIENT', 'EMERGENCY', 'TELEMEDICINE', 'HOME_VISIT', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "EncounterClass" AS ENUM ('AMBULATORY', 'EMERGENCY', 'INPATIENT', 'OBSERVATION', 'VIRTUAL');

-- CreateEnum
CREATE TYPE "EncounterStatus" AS ENUM ('PLANNED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ENTERED_IN_ERROR');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('ROUTINE', 'URGENT', 'ASAP', 'STAT');

-- CreateEnum
CREATE TYPE "InvestigationType" AS ENUM ('LABORATORY', 'IMAGING', 'PATHOLOGY', 'PROCEDURE', 'OTHER');

-- CreateEnum
CREATE TYPE "InvestigationStatus" AS ENUM ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ENTERED_IN_ERROR');

-- CreateEnum
CREATE TYPE "ResultInterpretation" AS ENUM ('NORMAL', 'ABNORMAL', 'CRITICAL', 'HIGH', 'LOW');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'ENTERED_IN_ERROR', 'STOPPED');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('PROGRESS_NOTE', 'CONSULTATION_NOTE', 'DISCHARGE_SUMMARY', 'PROCEDURE_NOTE', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'PRINT', 'EXPORT', 'LOGIN', 'LOGOUT');

-- CreateTable
CREATE TABLE "encounters" (
    "id" TEXT NOT NULL,
    "encounterNumber" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "facilityId" TEXT,
    "encounterDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encounterType" "EncounterType" NOT NULL,
    "encounterClass" "EncounterClass" NOT NULL,
    "status" "EncounterStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "priority" "Priority" NOT NULL DEFAULT 'ROUTINE',
    "chiefComplaint" TEXT,
    "historyOfPresentIllness" JSONB,
    "pastMedicalHistory" JSONB,
    "medicationHistory" JSONB,
    "familyHistory" JSONB,
    "socialHistory" JSONB,
    "reviewOfSystems" JSONB,
    "vitalSigns" JSONB,
    "generalExamination" JSONB,
    "systemicExamination" JSONB,
    "assessment" TEXT,
    "diagnosisCodes" JSONB,
    "plan" TEXT,
    "fhirResourceId" TEXT,
    "fhirVersion" TEXT DEFAULT 'R4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "encounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investigations" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "investigationType" "InvestigationType" NOT NULL,
    "loincCode" TEXT,
    "snomedCode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orderedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orderedBy" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'ROUTINE',
    "status" "InvestigationStatus" NOT NULL DEFAULT 'ORDERED',
    "resultDate" TIMESTAMP(3),
    "resultValue" TEXT,
    "resultUnit" TEXT,
    "referenceRange" TEXT,
    "interpretation" "ResultInterpretation",
    "resultNotes" TEXT,
    "imagingModality" TEXT,
    "imagingBodySite" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investigations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "medicationId" TEXT,
    "rxNormCode" TEXT,
    "genericName" TEXT NOT NULL,
    "brandName" TEXT,
    "dosage" TEXT NOT NULL,
    "dosageForm" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "refills" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "indication" TEXT,
    "prescribedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prescribedBy" TEXT NOT NULL,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "allergyChecked" BOOLEAN NOT NULL DEFAULT false,
    "interactionChecked" BOOLEAN NOT NULL DEFAULT false,
    "dispensedDate" TIMESTAMP(3),
    "dispensedBy" TEXT,
    "pharmacyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prescriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "encounter_notes" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT NOT NULL,
    "noteType" "NoteType" NOT NULL,
    "noteText" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "encounter_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "encounterId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "userIp" TEXT,
    "userAgent" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "encounters_encounterNumber_key" ON "encounters"("encounterNumber");

-- CreateIndex
CREATE UNIQUE INDEX "encounters_fhirResourceId_key" ON "encounters"("fhirResourceId");

-- CreateIndex
CREATE INDEX "encounters_patientId_idx" ON "encounters"("patientId");

-- CreateIndex
CREATE INDEX "encounters_providerId_idx" ON "encounters"("providerId");

-- CreateIndex
CREATE INDEX "encounters_encounterDate_idx" ON "encounters"("encounterDate");

-- CreateIndex
CREATE INDEX "encounters_status_idx" ON "encounters"("status");

-- CreateIndex
CREATE INDEX "encounters_encounterNumber_idx" ON "encounters"("encounterNumber");

-- CreateIndex
CREATE INDEX "investigations_encounterId_idx" ON "investigations"("encounterId");

-- CreateIndex
CREATE INDEX "investigations_status_idx" ON "investigations"("status");

-- CreateIndex
CREATE INDEX "investigations_loincCode_idx" ON "investigations"("loincCode");

-- CreateIndex
CREATE INDEX "prescriptions_encounterId_idx" ON "prescriptions"("encounterId");

-- CreateIndex
CREATE INDEX "prescriptions_status_idx" ON "prescriptions"("status");

-- CreateIndex
CREATE INDEX "prescriptions_prescribedDate_idx" ON "prescriptions"("prescribedDate");

-- CreateIndex
CREATE INDEX "encounter_notes_encounterId_idx" ON "encounter_notes"("encounterId");

-- CreateIndex
CREATE INDEX "encounter_notes_noteType_idx" ON "encounter_notes"("noteType");

-- CreateIndex
CREATE INDEX "audit_logs_encounterId_idx" ON "audit_logs"("encounterId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "investigations" ADD CONSTRAINT "investigations_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "encounter_notes" ADD CONSTRAINT "encounter_notes_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_encounterId_fkey" FOREIGN KEY ("encounterId") REFERENCES "encounters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
