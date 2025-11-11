import { Controller, Get, Param, Req } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Patient Aggregate Controller
 *
 * Provides aggregated patient views (CQRS read models)
 * Development Law: HIPAA audit logging for all PHI access
 */
@Controller("api/aggregate/patients")
export class PatientAggregateController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get complete patient aggregate view
   * Single API call returns all patient data (allergies, meds, vitals, diagnoses)
   */
  @Get(":patientId")
  async getPatientAggregate(
    @Param("patientId") patientId: string,
    @Req() req: any
  ) {
    // HIPAA Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId: req.user?.id || "anonymous",
        action: "VIEW_PATIENT_CHART",
        resourceType: "PatientAggregateView",
        resourceId: patientId,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"] || "",
        portalType: req.headers["x-portal-type"] || "PROVIDER",
      },
    });

    // Get patient aggregate
    const patient = await this.prisma.patientAggregateView.findUnique({
      where: { patientId },
    });

    if (!patient) {
      return { error: "Patient not found", statusCode: 404 };
    }

    // Get recent lab results
    const labResults = await this.prisma.labResultView.findMany({
      where: { patientId },
      orderBy: { resultDate: "desc" },
      take: 10,
    });

    // Get recent imaging studies
    const imagingStudies = await this.prisma.imagingStudyView.findMany({
      where: { patientId },
      orderBy: { studyDate: "desc" },
      take: 10,
    });

    // Get active medications
    const medications = await this.prisma.medicationView.findMany({
      where: {
        patientId,
        status: "active",
      },
      orderBy: { prescribedAt: "desc" },
    });

    // Get recent encounters
    const encounters = await this.prisma.encounterView.findMany({
      where: { patientId },
      orderBy: { startTime: "desc" },
      take: 5,
    });

    // Return aggregated view
    return {
      patient: {
        id: patient.patientId,
        mrn: patient.mrn,
        fullName: patient.fullName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        allergies: patient.allergies,
        medications: patient.medications,
        latestVitals: patient.latestVitals,
        latestVitalsDate: patient.latestVitalsDate,
        diagnoses: patient.diagnoses,
        lastEncounterDate: patient.lastEncounterDate,
        encounterCount: patient.encounterCount,
        alerts: {
          critical: patient.criticalAlerts,
          unreadResults: patient.unreadResults,
          pendingLabOrders: patient.pendingLabOrders,
          pendingImagingOrders: patient.pendingImagingOrders,
        },
      },
      labResults: labResults.map((lr) => ({
        reportId: lr.reportId,
        status: lr.status,
        criticalValues: lr.criticalValues,
        abnormalResults: lr.abnormalResults,
        resultCount: lr.resultCount,
        resultDate: lr.resultDate,
      })),
      imagingStudies: imagingStudies.map((is) => ({
        studyId: is.studyId,
        modality: is.modality,
        bodyPart: is.bodyPart,
        thumbnailUrl: is.thumbnailUrl,
        reportFinalized: is.reportFinalized,
        criticalFindings: is.criticalFindings,
        studyDate: is.studyDate,
      })),
      medications: medications.map((m) => ({
        requestId: m.requestId,
        medicationName: m.medicationName,
        dosage: m.dosage,
        frequency: m.frequency,
        dispensed: m.dispensed,
        prescribedAt: m.prescribedAt,
      })),
      encounters: encounters.map((e) => ({
        encounterId: e.encounterId,
        encounterType: e.encounterType,
        status: e.status,
        startTime: e.startTime,
        endTime: e.endTime,
      })),
    };
  }

  /**
   * Get critical alerts for a patient
   */
  @Get(":patientId/alerts")
  async getCriticalAlerts(@Param("patientId") patientId: string) {
    // Get critical lab values
    const criticalLabs = await this.prisma.labResultView.findMany({
      where: {
        patientId,
        criticalValues: true,
      },
      orderBy: { resultDate: "desc" },
      take: 5,
    });

    // Get critical imaging findings
    const criticalImaging = await this.prisma.imagingStudyView.findMany({
      where: {
        patientId,
        criticalFindings: true,
      },
      orderBy: { studyDate: "desc" },
      take: 5,
    });

    return {
      criticalLabs: criticalLabs.map((cl) => ({
        reportId: cl.reportId,
        resultDate: cl.resultDate,
        alerts: cl.criticalAlerts,
      })),
      criticalImaging: criticalImaging.map((ci) => ({
        studyId: ci.studyId,
        modality: ci.modality,
        bodyPart: ci.bodyPart,
        studyDate: ci.studyDate,
      })),
    };
  }
}
