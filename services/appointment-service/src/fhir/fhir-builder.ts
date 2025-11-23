/**
 * FHIR R4 Resource Builders
 * Converts internal domain models to FHIR R4-compliant resources
 * @see https://www.hl7.org/fhir/R4/
 */

import { Appointment, AppointmentStatus } from "@prisma/client";

// ============================================================================
// FHIR TYPE DEFINITIONS
// ============================================================================

export interface FHIRAppointment {
  resourceType: "Appointment";
  id: string;
  identifier?: FHIRIdentifier[];
  status: FHIRAppointmentStatus;
  serviceType?: FHIRCodeableConcept[];
  appointmentType?: FHIRCodeableConcept;
  reasonCode?: FHIRCodeableConcept[];
  description?: string;
  start?: string; // ISO 8601
  end?: string; // ISO 8601
  minutesDuration?: number;
  comment?: string;
  participant: FHIRParticipant[];
  meta?: {
    lastUpdated: string;
    versionId?: string;
  };
}

export interface FHIRCommunication {
  resourceType: "Communication";
  id: string;
  identifier?: FHIRIdentifier[];
  status:
    | "preparation"
    | "in-progress"
    | "completed"
    | "suspended"
    | "aborted"
    | "entered-in-error";
  priority?: "routine" | "urgent" | "asap" | "stat";
  subject?: FHIRReference;
  topic?: FHIRCodeableConcept;
  sent?: string; // ISO 8601
  received?: string; // ISO 8601
  sender?: FHIRReference;
  recipient?: FHIRReference[];
  payload?: FHIRPayload[];
  meta?: {
    lastUpdated: string;
  };
}

export interface FHIRObservation {
  resourceType: "Observation";
  id: string;
  identifier?: FHIRIdentifier[];
  status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "cancelled";
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: FHIRQuantity;
  valueString?: string;
  interpretation?: FHIRCodeableConcept[];
  referenceRange?: FHIRReferenceRange[];
}

interface FHIRIdentifier {
  system: string;
  value: string;
}

interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

interface FHIRCoding {
  system: string;
  code: string;
  display?: string;
}

interface FHIRReference {
  reference: string;
  display?: string;
}

interface FHIRParticipant {
  actor?: FHIRReference;
  required?: "required" | "optional" | "information-only";
  status: "accepted" | "declined" | "tentative" | "needs-action";
  type?: FHIRCodeableConcept[];
}

interface FHIRPayload {
  contentString?: string;
  contentAttachment?: {
    contentType: string;
    url: string;
    title?: string;
    size?: number;
  };
}

interface FHIRQuantity {
  value: number;
  unit: string;
  system?: string;
  code?: string;
}

interface FHIRReferenceRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
  text?: string;
}

type FHIRAppointmentStatus =
  | "proposed"
  | "pending"
  | "booked"
  | "arrived"
  | "fulfilled"
  | "cancelled"
  | "noshow"
  | "entered-in-error"
  | "checked-in"
  | "waitlist";

// ============================================================================
// FHIR APPOINTMENT BUILDER
// ============================================================================

export class FHIRAppointmentBuilder {
  /**
   * Convert internal Appointment to FHIR R4 Appointment resource
   */
  static toFHIR(appointment: Appointment): FHIRAppointment {
    return {
      resourceType: "Appointment",
      id: appointment.fhirResourceId || appointment.id,
      identifier: [
        {
          system: "urn:emr-hms:appointment",
          value: appointment.appointmentNumber,
        },
      ],
      status: this.mapStatusToFHIR(appointment.status),
      serviceType: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/service-type",
              code: appointment.appointmentType,
              display: appointment.appointmentType.replace(/_/g, " "),
            },
          ],
        },
      ],
      appointmentType: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0276",
            code: this.mapTypeToHL7(appointment.appointmentType),
            display: appointment.appointmentType,
          },
        ],
      },
      reasonCode: appointment.reason
        ? [
            {
              text: appointment.reason,
            },
          ]
        : undefined,
      description: appointment.notes || undefined,
      start: appointment.scheduledDate?.toISOString(),
      end: appointment.scheduledDate
        ? new Date(
            appointment.scheduledDate.getTime() + appointment.duration * 60000
          ).toISOString()
        : undefined,
      minutesDuration: appointment.duration,
      comment: appointment.instructions || undefined,
      participant: [
        {
          actor: {
            reference: `Patient/${appointment.patientId}`,
            display: "Patient",
          },
          required: "required",
          status: this.mapParticipantStatus(appointment.status),
        },
        ...(appointment.providerId
          ? [
              {
                actor: {
                  reference: `Practitioner/${appointment.providerId}`,
                  display: "Provider",
                },
                required: "required" as const,
                status: "accepted" as const,
              },
            ]
          : []),
      ],
      meta: {
        lastUpdated: appointment.updatedAt.toISOString(),
        versionId: "1",
      },
    };
  }

  private static mapStatusToFHIR(
    status: AppointmentStatus
  ): FHIRAppointmentStatus {
    const mapping: Record<AppointmentStatus, FHIRAppointmentStatus> = {
      REQUESTED: "proposed",
      PENDING_APPROVAL: "pending",
      CONFIRMED: "booked",
      CHECKED_IN: "arrived",
      IN_PROGRESS: "fulfilled",
      COMPLETED: "fulfilled",
      CANCELLED: "cancelled",
      NO_SHOW: "noshow",
      RESCHEDULED: "booked",
    };
    return mapping[status] || "proposed";
  }

  private static mapTypeToHL7(type: string): string {
    const mapping: Record<string, string> = {
      GENERAL_CHECKUP: "CHECKUP",
      FOLLOW_UP: "FOLLOWUP",
      URGENT_CARE: "EMERGENCY",
      ANNUAL_PHYSICAL: "CHECKUP",
      SPECIALIST_CONSULTATION: "CONSULTATION",
      LAB_WORK: "LAB",
      RADIOLOGY: "RADIOLOGY",
      TELEMEDICINE: "VIRTUAL",
      VACCINATION: "VACCINATION",
      PROCEDURE: "PROCEDURE",
      OTHER: "OTHER",
    };
    return mapping[type] || "ROUTINE";
  }

  private static mapParticipantStatus(
    status: AppointmentStatus
  ): "accepted" | "declined" | "tentative" | "needs-action" {
    if (
      status === "CONFIRMED" ||
      status === "CHECKED_IN" ||
      status === "IN_PROGRESS" ||
      status === "COMPLETED"
    ) {
      return "accepted";
    }
    if (status === "CANCELLED") {
      return "declined";
    }
    if (status === "REQUESTED" || status === "PENDING_APPROVAL") {
      return "needs-action";
    }
    return "tentative";
  }
}

// ============================================================================
// FHIR COMMUNICATION BUILDER (for Messaging)
// ============================================================================

export class FHIRCommunicationBuilder {
  /**
   * Convert internal Message to FHIR R4 Communication resource
   */
  static toFHIR(message: any): FHIRCommunication {
    return {
      resourceType: "Communication",
      id: message.fhirResourceId || message.id,
      identifier: [
        {
          system: "urn:emr-hms:message",
          value: message.id,
        },
      ],
      status: this.mapStatusToFHIR(message.status),
      priority: this.mapPriorityToFHIR(message.priority),
      subject: {
        reference: `Patient/${message.senderId}`,
      },
      topic: {
        text: message.subject,
      },
      sent: message.sentAt,
      received: message.deliveredAt,
      sender: {
        reference: `${message.senderType === "patient" ? "Patient" : "Practitioner"}/${message.senderId}`,
      },
      recipient: message.recipients?.map((r: any) => ({
        reference: `${r.recipientType === "patient" ? "Patient" : "Practitioner"}/${r.recipientId}`,
      })),
      payload: [
        {
          contentString: message.body,
        },
        ...(message.attachments?.map((att: any) => ({
          contentAttachment: {
            contentType: att.mimeType,
            url: att.storageUrl,
            title: att.fileName,
            size: att.fileSize,
          },
        })) || []),
      ],
      meta: {
        lastUpdated: message.updatedAt,
      },
    };
  }

  private static mapStatusToFHIR(
    status: string
  ):
    | "preparation"
    | "in-progress"
    | "completed"
    | "suspended"
    | "aborted"
    | "entered-in-error" {
    const mapping: Record<
      string,
      | "preparation"
      | "in-progress"
      | "completed"
      | "suspended"
      | "aborted"
      | "entered-in-error"
    > = {
      DRAFT: "preparation",
      SENT: "in-progress",
      DELIVERED: "in-progress",
      READ: "completed",
      ARCHIVED: "completed",
      DELETED: "entered-in-error",
    };
    return mapping[status] || "preparation";
  }

  private static mapPriorityToFHIR(
    priority: string
  ): "routine" | "urgent" | "asap" | "stat" {
    const mapping: Record<string, "routine" | "urgent" | "asap" | "stat"> = {
      LOW: "routine",
      NORMAL: "routine",
      HIGH: "asap",
      URGENT: "urgent",
    };
    return mapping[priority] || "routine";
  }
}

// ============================================================================
// FHIR OBSERVATION BUILDER (for Vitals)
// ============================================================================

export class FHIRObservationBuilder {
  /**
   * Build FHIR Observation for vital signs
   */
  static buildVitalSign(params: {
    patientId: string;
    code: string; // LOINC code
    display: string;
    value: number;
    unit: string;
    effectiveDateTime?: Date;
  }): FHIRObservation {
    return {
      resourceType: "Observation",
      id: `obs-${Date.now()}`,
      status: "final",
      category: [
        {
          coding: [
            {
              system:
                "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
              display: "Vital Signs",
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: "http://loinc.org",
            code: params.code,
            display: params.display,
          },
        ],
      },
      subject: {
        reference: `Patient/${params.patientId}`,
      },
      effectiveDateTime: (params.effectiveDateTime || new Date()).toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: params.value,
        unit: params.unit,
        system: "http://unitsofmeasure.org",
        code: params.unit,
      },
    };
  }

  /**
   * Common vital sign codes (LOINC)
   */
  static LOINC_CODES = {
    BLOOD_PRESSURE_SYSTOLIC: "8480-6",
    BLOOD_PRESSURE_DIASTOLIC: "8462-4",
    HEART_RATE: "8867-4",
    RESPIRATORY_RATE: "9279-1",
    BODY_TEMPERATURE: "8310-5",
    BODY_WEIGHT: "29463-7",
    BODY_HEIGHT: "8302-2",
    BMI: "39156-5",
    OXYGEN_SATURATION: "2708-6",
  };
}
