import {
  ChiefComplaintSymptom,
  ExaminationData,
  HistoryData,
  HistoryOfPresentIllnessData,
  InvestigationData,
  MedicationData,
  SystemEnquiryEntry,
} from "../store/encounterStore";
import { useAuthStore } from "../store/authStore";

interface FhirCoding {
  system?: string;
  code?: string;
  display?: string;
}

interface FhirCodeableConcept {
  coding?: FhirCoding[];
  text?: string;
}

interface FhirReference {
  reference: string;
}

interface FhirQuantity {
  value?: number;
  unit?: string;
}

interface FhirObservationComponent {
  code: FhirCodeableConcept;
  valueQuantity?: FhirQuantity;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
}

interface FhirEncounter {
  resourceType: "Encounter";
  id?: string;
  status: "in-progress" | "finished";
  class: {
    system: string;
    code: string;
    display?: string;
  };
  type?: FhirCodeableConcept[];
  subject: FhirReference;
  participant?: Array<{
    individual: FhirReference;
  }>;
  period?: {
    start?: string;
  };
}

interface FhirCondition {
  resourceType: "Condition";
  id?: string;
  subject: FhirReference;
  encounter?: FhirReference;
  code: FhirCodeableConcept;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  onsetDateTime?: string;
}

interface FhirObservation {
  resourceType: "Observation";
  id?: string;
  status: "final";
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  encounter?: FhirReference;
  valueCodeableConcept?: FhirCodeableConcept;
  valueString?: string;
  valueQuantity?: FhirQuantity;
  valueDateTime?: string;
  interpretation?: FhirCodeableConcept[];
  component?: FhirObservationComponent[];
}

interface FhirMedicationStatement {
  resourceType: "MedicationStatement";
  id?: string;
  status: string;
  subject: FhirReference;
  encounter?: FhirReference;
  medicationCodeableConcept: FhirCodeableConcept;
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  reasonCode?: FhirCodeableConcept[];
  note?: Array<{ text: string }>;
}

interface FhirProcedure {
  resourceType: "Procedure";
  id?: string;
  status: string;
  subject: FhirReference;
  encounter?: FhirReference;
  code: FhirCodeableConcept;
  performedDateTime?: string;
  bodySite?: FhirCodeableConcept[];
  outcome?: FhirCodeableConcept;
  note?: Array<{ text: string }>;
}

interface FhirImmunization {
  resourceType: "Immunization";
  id?: string;
  status: string;
  patient: FhirReference;
  encounter?: FhirReference;
  vaccineCode: FhirCodeableConcept;
  occurrenceDateTime?: string;
  lotNumber?: string;
  manufacturer?: {
    display?: string;
  };
  site?: FhirCodeableConcept;
  route?: FhirCodeableConcept;
  note?: Array<{ text: string }>;
}

interface FhirFamilyMemberHistory {
  resourceType: "FamilyMemberHistory";
  id?: string;
  status?: string;
  patient: FhirReference;
  relationship: FhirCodeableConcept;
  condition?: Array<{
    code: FhirCodeableConcept;
    onsetAgeString?: string;
  }>;
}

interface FhirServiceRequest {
  resourceType: "ServiceRequest";
  id?: string;
  status: string;
  intent: string;
  subject: FhirReference;
  encounter?: FhirReference;
  code: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  note?: Array<{ text: string }>;
}

interface FhirDiagnosticReport {
  resourceType: "DiagnosticReport";
  id?: string;
  status: string;
  subject: FhirReference;
  encounter?: FhirReference;
  code: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  conclusion?: string;
}

interface FhirMedicationRequest {
  resourceType: "MedicationRequest";
  id?: string;
  status: string;
  intent: string;
  subject: FhirReference;
  encounter?: FhirReference;
  medicationCodeableConcept: FhirCodeableConcept;
  dosageInstruction?: Array<{
    text?: string;
  }>;
  note?: Array<{ text: string }>;
}

interface FhirCarePlan {
  resourceType: "CarePlan";
  id?: string;
  status: string;
  intent: string;
  subject: FhirReference;
  encounter?: FhirReference;
  title?: string;
  description?: string;
  note?: Array<{ text: string }>;
}

interface FhirBundleEntry {
  resource:
    | FhirEncounter
    | FhirCondition
    | FhirObservation
    | FhirMedicationStatement
    | FhirProcedure
    | FhirImmunization
    | FhirFamilyMemberHistory
    | FhirServiceRequest
    | FhirDiagnosticReport
    | FhirMedicationRequest
    | FhirCarePlan;
}

export interface FhirBundle {
  resourceType: "Bundle";
  type: "collection";
  id?: string;
  entry: FhirBundleEntry[];
}

// Helper – read cookie by name (duplicated here to avoid coupling with api.ts)
const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

// Helper to extract user ID from JWT token
const extractUserIdFromToken = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

// Best-effort upload of a FHIR Bundle to the backend FHIR service.
// Returns true on HTTP 2xx, false otherwise. This never throws, so
// callers can safely use the result only for toasts/logging.
export async function uploadFhirBundleToServer(
  bundle: FhirBundle
): Promise<boolean> {
  const url = "http://localhost:8000/fhir/Bundle";

  try {
    const { accessToken, user } = useAuthStore.getState();

    const headers: Record<string, string> = {
      "Content-Type": "application/fhir+json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    headers["x-user-role"] = user?.role || "PROVIDER";
    headers["x-portal"] = "PROVIDER";

    let userId = user?.id;
    if (!userId && accessToken) {
      userId = extractUserIdFromToken(accessToken) || undefined;
    }
    if (userId) {
      headers["x-user-id"] = userId;
    }

    const csrf = getCookie("XSRF-TOKEN");
    if (csrf) {
      headers["X-XSRF-TOKEN"] = csrf;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bundle),
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        "FHIR bundle upload failed",
        response.status,
        await response.text()
      );
      return false;
    }
    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to upload FHIR bundle to backend FHIR service", error);
    return false;
  }
}

export async function checkFhirHealth(): Promise<boolean> {
  const url = "http://localhost:8000/fhir/health";

  try {
    const { accessToken, user } = useAuthStore.getState();

    const headers: Record<string, string> = {};

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    headers["x-user-role"] = user?.role || "PROVIDER";
    headers["x-portal"] = "PROVIDER";

    let userId = user?.id;
    if (!userId && accessToken) {
      userId = extractUserIdFromToken(accessToken) || undefined;
    }
    if (userId) {
      headers["x-user-id"] = userId;
    }

    const csrf = getCookie("XSRF-TOKEN");
    if (csrf) {
      headers["X-XSRF-TOKEN"] = csrf;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        "FHIR health check failed",
        response.status,
        await response.text()
      );
      return false;
    }

    return true;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to call FHIR health endpoint", error);
    return false;
  }
}

export interface FhirBuildContext {
  encounterId?: string;
  encounterDate?: string;
  encounterType?: string;
  patientId: string;
  providerId: string;
  history: HistoryData;
  examination?: ExaminationData;
  investigations?: InvestigationData;
  medications?: MedicationData;
  assessment?: string;
  plan?: string;
}

const SNOMED_SYSTEM = "http://snomed.info/sct";
const ICD10_SYSTEM = "http://hl7.org/fhir/sid/icd-10";
const RXNORM_SYSTEM = "http://www.nlm.nih.gov/research/umls/rxnorm";
const LOINC_SYSTEM = "http://loinc.org";
const CVX_SYSTEM = "http://hl7.org/fhir/sid/cvx";
const CONDITION_CATEGORY_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/condition-category";
const CONDITION_CLINICAL_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/condition-clinical";
const CONDITION_VER_STATUS_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/condition-ver-status";
const OBS_CAT_SURVEY =
  "http://terminology.hl7.org/CodeSystem/observation-category";
const OBS_INTERPRETATION =
  "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation";

export function buildEncounterResource(ctx: FhirBuildContext): FhirEncounter {
  const classCode = ctx.encounterType === "INPATIENT" ? "IMP" : "AMB";

  return {
    resourceType: "Encounter",
    id: ctx.encounterId,
    status: "in-progress",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: classCode,
    },
    type: ctx.encounterType
      ? [
          {
            text: ctx.encounterType,
          },
        ]
      : undefined,
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    participant: [
      {
        individual: {
          reference: `Practitioner/${ctx.providerId}`,
        },
      },
    ],
    period: {
      start: ctx.encounterDate,
    },
  };
}

function buildChiefComplaintCondition(
  symptom: ChiefComplaintSymptom,
  ctx: FhirBuildContext
): FhirCondition {
  const coding: FhirCoding[] = [];
  if (symptom.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: symptom.snomedCode,
      display: symptom.label,
    });
  }

  return {
    resourceType: "Condition",
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    code: {
      coding: coding.length ? coding : undefined,
      text: symptom.label,
    },
    clinicalStatus: {
      coding: [
        {
          system: CONDITION_CLINICAL_SYSTEM,
          code: "active",
          display: "Active",
        },
      ],
      text: "active",
    },
    verificationStatus: {
      text: "provisional",
    },
  };
}

function buildHpiObservationForSymptom(
  symptom: ChiefComplaintSymptom,
  hpi: HistoryOfPresentIllnessData,
  ctx: FhirBuildContext
): FhirObservation {
  const featureMap = hpi.symptomFeatures || {};
  const feature = featureMap[symptom.id] || {};
  const components: FhirObservationComponent[] = [];

  if (feature.durationValue !== undefined) {
    components.push({
      code: {
        text: "Duration",
      },
      valueQuantity: {
        value: feature.durationValue,
        unit: feature.durationUnit,
      },
    });
  }

  if (feature.severity) {
    components.push({
      code: {
        text: "Severity",
      },
      valueCodeableConcept: {
        text: feature.severity,
      },
    });
  }

  if (feature.character && feature.character.length) {
    components.push({
      code: {
        text: "Character",
      },
      valueString: feature.character.join(", "),
    });
  }

  if (feature.aggravatingFactors && feature.aggravatingFactors.length) {
    components.push({
      code: {
        text: "Aggravating factors",
      },
      valueString: feature.aggravatingFactors.join(", "),
    });
  }

  if (feature.relievingFactors && feature.relievingFactors.length) {
    components.push({
      code: {
        text: "Relieving factors",
      },
      valueString: feature.relievingFactors.join(", "),
    });
  }

  if (feature.notes) {
    components.push({
      code: {
        text: "Notes",
      },
      valueString: feature.notes,
    });
  }

  const coding: FhirCoding[] = [];
  if (symptom.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: symptom.snomedCode,
      display: symptom.label,
    });
  }

  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: OBS_CAT_SURVEY,
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: {
      coding: coding.length ? coding : undefined,
      text: symptom.label,
    },
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    component: components.length ? components : undefined,
  };
}

function buildSystemNormalObservation(
  systemKey: string,
  ctx: FhirBuildContext
): FhirObservation {
  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: OBS_CAT_SURVEY,
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: {
      text: `Review of systems: ${systemKey}`,
    },
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    interpretation: [
      {
        coding: [
          {
            system: OBS_INTERPRETATION,
            code: "N",
            display: "Normal",
          },
        ],
        text: "Normal",
      },
    ],
  };
}

function buildSystemPositiveObservation(
  systemKey: string,
  symptom: { snomedCode: string; label: string },
  entry: SystemEnquiryEntry,
  ctx: FhirBuildContext
): FhirObservation {
  const coding: FhirCoding[] = [];
  if (symptom.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: symptom.snomedCode,
      display: symptom.label,
    });
  }

  return {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: OBS_CAT_SURVEY,
            code: "survey",
            display: "Survey",
          },
        ],
      },
    ],
    code: {
      coding: coding.length ? coding : undefined,
      text: `${systemKey}: ${symptom.label}`,
    },
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    valueString: entry.summaryText,
  };
}

function buildPastMedicalHistoryCondition(
  entry: any,
  ctx: FhirBuildContext
): FhirCondition {
  const coding: FhirCoding[] = [];

  if (entry?.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: entry.snomedCode,
      display: entry.condition,
    });
  }

  if (entry?.icd10Code) {
    coding.push({
      system: ICD10_SYSTEM,
      code: entry.icd10Code,
      display: entry.condition,
    });
  }

  const status: string | undefined = entry?.status;
  let clinicalStatus: FhirCodeableConcept | undefined;

  if (status) {
    let code: string | undefined;
    let display: string | undefined;

    switch (status) {
      case "active":
        code = "active";
        display = "Active";
        break;
      case "remission":
        code = "remission";
        display = "In remission";
        break;
      case "resolved":
        code = "resolved";
        display = "Resolved";
        break;
      default:
        break;
    }

    if (code) {
      clinicalStatus = {
        coding: [
          {
            system: CONDITION_CLINICAL_SYSTEM,
            code,
            display,
          },
        ],
        text: status,
      };
    } else {
      clinicalStatus = {
        text: status,
      };
    }
  }

  const verificationStatus: FhirCodeableConcept = {
    coding: [
      {
        system: CONDITION_VER_STATUS_SYSTEM,
        code: "confirmed",
        display: "Confirmed",
      },
    ],
    text: "confirmed",
  };

  const category: FhirCodeableConcept[] = [
    {
      coding: [
        {
          system: CONDITION_CATEGORY_SYSTEM,
          code: "problem-list-item",
          display: "Problem List Item",
        },
      ],
      text: "Past medical history",
    },
  ];

  return {
    resourceType: "Condition",
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    code: {
      coding: coding.length ? coding : undefined,
      text: entry?.condition || "",
    },
    clinicalStatus,
    verificationStatus,
    category,
    onsetDateTime: entry?.yearDiagnosed,
  };
}

function buildMedicationHistoryStatement(
  entry: any,
  ctx: FhirBuildContext
): FhirMedicationStatement {
  const coding: FhirCoding[] = [];

  if (entry?.rxNormCode) {
    coding.push({
      system: RXNORM_SYSTEM,
      code: entry.rxNormCode,
      display: entry.medicationName,
    });
  }

  let status = "active";
  if (entry?.status === "stopped") {
    status = "stopped";
  }

  const reasonCode: FhirCodeableConcept[] = [];
  if (entry?.indication) {
    reasonCode.push({
      text: entry.indication,
    });
  }

  const noteTexts: string[] = [];
  if (entry?.notes) {
    noteTexts.push(entry.notes);
  }

  return {
    resourceType: "MedicationStatement",
    status,
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    medicationCodeableConcept: {
      coding: coding.length ? coding : undefined,
      text: entry?.medicationName || "",
    },
    effectivePeriod:
      entry?.startDate || entry?.endDate
        ? {
            start: entry.startDate,
            end: entry.endDate,
          }
        : undefined,
    reasonCode: reasonCode.length ? reasonCode : undefined,
    note: noteTexts.length
      ? noteTexts.map((text) => ({
          text,
        }))
      : undefined,
  };
}

function buildSurgicalHistoryProcedure(
  entry: any,
  ctx: FhirBuildContext
): FhirProcedure {
  const coding: FhirCoding[] = [];

  if (entry?.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: entry.snomedCode,
      display: entry.procedure,
    });
  }

  const bodySite: FhirCodeableConcept[] = [];
  if (entry?.bodySiteCode) {
    bodySite.push({
      coding: [
        {
          system: SNOMED_SYSTEM,
          code: entry.bodySiteCode,
          display: entry.bodySite || undefined,
        },
      ],
      text: entry.bodySite,
    });
  } else if (entry?.bodySite) {
    bodySite.push({
      text: entry.bodySite,
    });
  }

  const outcome: FhirCodeableConcept | undefined = entry?.outcome
    ? { text: entry.outcome }
    : undefined;

  const note =
    entry?.notes && entry.notes.length
      ? [
          {
            text: entry.notes,
          },
        ]
      : undefined;

  return {
    resourceType: "Procedure",
    status: "completed",
    subject: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    code: {
      coding: coding.length ? coding : undefined,
      text: entry?.procedure || "",
    },
    performedDateTime: entry?.date,
    bodySite: bodySite.length ? bodySite : undefined,
    outcome,
    note,
  };
}

function buildObgynConditions(ctx: FhirBuildContext): FhirCondition[] {
  const anyHistory: any = ctx.history as any;
  const obgyn = anyHistory.obgynHistory;
  if (!obgyn) {
    return [];
  }

  const conditions: FhirCondition[] = [];
  const obstetric = obgyn.obstetric || {};
  const gynecologic = obgyn.gynecologic || {};

  if (obstetric.currentlyPregnant) {
    conditions.push({
      resourceType: "Condition",
      subject: {
        reference: `Patient/${ctx.patientId}`,
      },
      encounter: ctx.encounterId
        ? {
            reference: `Encounter/${ctx.encounterId}`,
          }
        : undefined,
      code: {
        coding: [
          {
            system: SNOMED_SYSTEM,
            code: "77386006",
            display: "Pregnant",
          },
        ],
        text: "Pregnancy",
      },
      clinicalStatus: {
        coding: [
          {
            system: CONDITION_CLINICAL_SYSTEM,
            code: "active",
            display: "Active",
          },
        ],
        text: "active",
      },
      verificationStatus: {
        coding: [
          {
            system: CONDITION_VER_STATUS_SYSTEM,
            code: "confirmed",
            display: "Confirmed",
          },
        ],
        text: "confirmed",
      },
      category: [
        {
          coding: [
            {
              system: CONDITION_CATEGORY_SYSTEM,
              code: "problem-list-item",
              display: "Problem List Item",
            },
          ],
          text: "OB/GYN history",
        },
      ],
      onsetDateTime: obstetric.lastMenstrualPeriod,
    });
  }

  const gynConditions = (gynecologic.gynecologicConditions || []) as any[];
  gynConditions.forEach((entry) => {
    if (!entry || !entry.condition) return;

    const coding: FhirCoding[] = [];
    if (entry.snomedCode) {
      coding.push({
        system: SNOMED_SYSTEM,
        code: entry.snomedCode,
        display: entry.condition,
      });
    }

    conditions.push({
      resourceType: "Condition",
      subject: {
        reference: `Patient/${ctx.patientId}`,
      },
      encounter: ctx.encounterId
        ? {
            reference: `Encounter/${ctx.encounterId}`,
          }
        : undefined,
      code: {
        coding: coding.length ? coding : undefined,
        text: entry.condition,
      },
      category: [
        {
          coding: [
            {
              system: CONDITION_CATEGORY_SYSTEM,
              code: "problem-list-item",
              display: "Problem List Item",
            },
          ],
          text: "Gynecologic history",
        },
      ],
    });
  });

  return conditions;
}

function buildObgynObservations(ctx: FhirBuildContext): FhirObservation[] {
  const anyHistory: any = ctx.history as any;
  const obgyn = anyHistory.obgynHistory;
  if (!obgyn) {
    return [];
  }

  const obstetric = obgyn.obstetric || {};
  const gynecologic = obgyn.gynecologic || {};

  const observations: FhirObservation[] = [];

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  const makeObservation = (
    code: FhirCodeableConcept,
    partial: Partial<FhirObservation>
  ): FhirObservation => ({
    resourceType: "Observation",
    status: "final",
    code,
    subject,
    encounter: encounterRef,
    ...partial,
  });

  if (typeof obstetric.gravida === "number") {
    observations.push(
      makeObservation(
        {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: "11996-6",
              display: "Gravida",
            },
          ],
          text: "Gravida",
        },
        {
          valueQuantity: {
            value: obstetric.gravida,
          },
        }
      )
    );
  }

  if (typeof obstetric.para === "number") {
    observations.push(
      makeObservation(
        {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: "11977-6",
              display: "Para",
            },
          ],
          text: "Para",
        },
        {
          valueQuantity: {
            value: obstetric.para,
          },
        }
      )
    );
  }

  if (obstetric.lastMenstrualPeriod) {
    observations.push(
      makeObservation(
        {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: "8665-2",
              display: "Last menstrual period",
            },
          ],
          text: "Last menstrual period",
        },
        {
          valueDateTime: obstetric.lastMenstrualPeriod,
        }
      )
    );
  }

  if (obstetric.estimatedDueDate) {
    observations.push(
      makeObservation(
        {
          coding: [
            {
              system: LOINC_SYSTEM,
              code: "11778-8",
              display: "Estimated date of delivery",
            },
          ],
          text: "Estimated date of delivery",
        },
        {
          valueDateTime: obstetric.estimatedDueDate,
        }
      )
    );
  }

  if (obstetric.contraceptionMethod || obstetric.contraceptionCode) {
    const coding: FhirCoding[] = [];
    if (obstetric.contraceptionCode) {
      coding.push({
        system: SNOMED_SYSTEM,
        code: obstetric.contraceptionCode,
        display: obstetric.contraceptionMethod,
      });
    }

    observations.push(
      makeObservation(
        {
          text: "Contraception method",
          coding: coding.length ? coding : undefined,
        },
        {
          valueCodeableConcept: {
            text: obstetric.contraceptionMethod,
          },
        }
      )
    );
  }

  if (typeof gynecologic.menarcheAge === "number") {
    observations.push(
      makeObservation(
        {
          text: "Age at menarche",
        },
        {
          valueQuantity: {
            value: gynecologic.menarcheAge,
          },
        }
      )
    );
  }

  if (typeof gynecologic.menopauseAge === "number") {
    observations.push(
      makeObservation(
        {
          text: "Age at menopause",
        },
        {
          valueQuantity: {
            value: gynecologic.menopauseAge,
          },
        }
      )
    );
  }

  if (gynecologic.lastPapSmearDate) {
    observations.push(
      makeObservation(
        {
          text: "Last Pap smear date",
        },
        {
          valueDateTime: gynecologic.lastPapSmearDate,
        }
      )
    );
  }

  if (gynecologic.lastPapSmearResult) {
    observations.push(
      makeObservation(
        {
          text: "Last Pap smear result",
        },
        {
          valueString: gynecologic.lastPapSmearResult,
        }
      )
    );
  }

  return observations;
}

function mapImmunizationStatus(status?: string): {
  fhirStatus: string;
  extraNote?: string;
} {
  switch (status) {
    case "completed":
      return { fhirStatus: "completed" };
    case "partial":
      return { fhirStatus: "completed", extraNote: "Partial series" };
    case "due":
      return { fhirStatus: "not-done", extraNote: "Due" };
    case "declined":
      return { fhirStatus: "not-done", extraNote: "Declined" };
    default:
      return { fhirStatus: "completed" };
  }
}

function buildImmunization(
  entry: any,
  ctx: FhirBuildContext
): FhirImmunization {
  const { fhirStatus, extraNote } = mapImmunizationStatus(entry?.status);

  const coding: FhirCoding[] = [];
  if (entry?.cvxCode) {
    coding.push({
      system: CVX_SYSTEM,
      code: entry.cvxCode,
      display: entry.vaccineName,
    });
  }

  if (entry?.snomedCode) {
    coding.push({
      system: SNOMED_SYSTEM,
      code: entry.snomedCode,
      display: entry.vaccineName,
    });
  }

  const noteTexts: string[] = [];
  if (entry?.notes) {
    noteTexts.push(entry.notes);
  }
  if (extraNote) {
    noteTexts.push(extraNote);
  }

  return {
    resourceType: "Immunization",
    status: fhirStatus,
    patient: {
      reference: `Patient/${ctx.patientId}`,
    },
    encounter: ctx.encounterId
      ? {
          reference: `Encounter/${ctx.encounterId}`,
        }
      : undefined,
    vaccineCode: {
      coding: coding.length ? coding : undefined,
      text: entry?.vaccineName || "",
    },
    occurrenceDateTime: entry?.date,
    lotNumber: entry?.lotNumber,
    manufacturer: entry?.manufacturer
      ? {
          display: entry.manufacturer,
        }
      : undefined,
    site: entry?.site
      ? {
          text: entry.site,
        }
      : undefined,
    route: entry?.route
      ? {
          text: entry.route,
        }
      : undefined,
    note: noteTexts.length
      ? noteTexts.map((text) => ({
          text,
        }))
      : undefined,
  };
}

export function buildChiefComplaintConditions(
  ctx: FhirBuildContext
): FhirCondition[] {
  const symptoms = ctx.history.chiefComplaintSymptoms || [];
  return symptoms
    .filter((s) => !!s.label)
    .map((s) => buildChiefComplaintCondition(s, ctx));
}

export function buildPastMedicalHistoryConditions(
  ctx: FhirBuildContext
): FhirCondition[] {
  const entries = (ctx.history.pastMedicalHistory || []) as any[];
  if (!entries.length) {
    return [];
  }

  return entries
    .filter((entry) => entry && entry.condition)
    .map((entry) => buildPastMedicalHistoryCondition(entry, ctx));
}

export function buildMedicationHistoryStatements(
  ctx: FhirBuildContext
): FhirMedicationStatement[] {
  const entries = (ctx.history.medicationHistory || []) as any[];
  if (!entries.length) {
    return [];
  }

  return entries
    .filter((entry) => entry && entry.medicationName)
    .map((entry) => buildMedicationHistoryStatement(entry, ctx));
}

export function buildSurgicalHistoryProcedures(
  ctx: FhirBuildContext
): FhirProcedure[] {
  const entries = (ctx.history.surgicalHistory || []) as any[];
  if (!entries.length) {
    return [];
  }

  return entries
    .filter((entry) => entry && entry.procedure)
    .map((entry) => buildSurgicalHistoryProcedure(entry, ctx));
}

export function buildObgynConditionResources(
  ctx: FhirBuildContext
): FhirCondition[] {
  return buildObgynConditions(ctx);
}

export function buildObgynObservationResources(
  ctx: FhirBuildContext
): FhirObservation[] {
  return buildObgynObservations(ctx);
}

export function buildImmunizations(ctx: FhirBuildContext): FhirImmunization[] {
  const entries = (ctx.history as any).immunizationHistory as any[] | undefined;
  if (!entries || !entries.length) {
    return [];
  }

  return entries
    .filter((entry) => entry && entry.vaccineName)
    .map((entry) => buildImmunization(entry, ctx));
}

export function buildHpiObservations(ctx: FhirBuildContext): FhirObservation[] {
  const symptoms = ctx.history.chiefComplaintSymptoms || [];
  const hpi = ctx.history.historyOfPresentIllness;
  if (!symptoms.length) {
    return [];
  }
  return symptoms.map((s) => buildHpiObservationForSymptom(s, hpi, ctx));
}

export function buildSystemEnquiryObservations(
  ctx: FhirBuildContext
): FhirObservation[] {
  const entries = ctx.history.systemEnquiry || {};
  const observations: FhirObservation[] = [];

  Object.keys(entries).forEach((systemKey) => {
    const entry = entries[systemKey];
    if (!entry) {
      return;
    }

    if (
      entry.normal &&
      (!entry.positiveSymptoms || entry.positiveSymptoms.length === 0)
    ) {
      observations.push(buildSystemNormalObservation(systemKey, ctx));
      return;
    }

    if (entry.positiveSymptoms && entry.positiveSymptoms.length) {
      entry.positiveSymptoms.forEach((symptom) => {
        if (!symptom.snomedCode && !symptom.label) {
          return;
        }
        observations.push(
          buildSystemPositiveObservation(systemKey, symptom, entry, ctx)
        );
      });
    }
  });

  return observations;
}

export function buildSocialHistoryObservations(
  ctx: FhirBuildContext
): FhirObservation[] {
  const social = (ctx.history as any).socialHistory || {};
  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  const makeObservation = (
    codeText: string,
    value: string
  ): FhirObservation => ({
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: OBS_CAT_SURVEY,
            code: "social-history",
            display: "Social History",
          },
        ],
      },
    ],
    code: {
      text: codeText,
    },
    subject,
    encounter: encounterRef,
    valueString: value,
  });

  const observations: FhirObservation[] = [];

  if (social.occupation) {
    observations.push(makeObservation("Occupation", social.occupation));
  }
  if (social.tobacco) {
    observations.push(makeObservation("Tobacco use", social.tobacco));
  }
  if (social.alcohol) {
    observations.push(makeObservation("Alcohol use", social.alcohol));
  }
  if (social.drugs) {
    observations.push(makeObservation("Substance use (drugs)", social.drugs));
  }
  if (social.livingConditions) {
    observations.push(
      makeObservation("Living conditions", social.livingConditions)
    );
  }

  return observations;
}

export function buildPersonalHistoryObservations(
  ctx: FhirBuildContext
): FhirObservation[] {
  const history = ctx.history as any;
  const family = (history.familyHistory || []) as any[];
  const social = history.socialHistory || {};

  const familyCount = family.length;
  const hasSocial = !!(
    social.occupation ||
    social.tobacco ||
    social.alcohol ||
    social.drugs ||
    social.livingConditions
  );

  if (!familyCount && !hasSocial) {
    return [];
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  const parts: string[] = [];
  if (familyCount) {
    parts.push(`Family history entries: ${familyCount}`);
  }
  if (hasSocial) {
    parts.push("Social history recorded");
  }

  return [
    {
      resourceType: "Observation",
      status: "final",
      category: [
        {
          coding: [
            {
              system: OBS_CAT_SURVEY,
              code: "social-history",
              display: "Social History",
            },
          ],
        },
      ],
      code: {
        text: "Personal history summary",
      },
      subject,
      encounter: encounterRef,
      valueString: parts.join("; "),
    },
  ];
}

export function buildPhysicalExamObservations(
  ctx: FhirBuildContext
): FhirObservation[] {
  const exam = ctx.examination;
  if (!exam) {
    return [];
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  const makeObservation = (
    code: FhirCodeableConcept,
    categoryCode: "vital-signs" | "exam",
    partial: Partial<FhirObservation>
  ): FhirObservation => ({
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: OBS_CAT_SURVEY,
            code: categoryCode,
            display: categoryCode === "vital-signs" ? "Vital Signs" : "Exam",
          },
        ],
      },
    ],
    code,
    subject,
    encounter: encounterRef,
    ...partial,
  });

  const observations: FhirObservation[] = [];

  const vitals = exam.vitalSigns;
  if (vitals) {
    if (typeof vitals.heartRate === "number" && vitals.heartRate > 0) {
      observations.push(
        makeObservation(
          {
            coding: [
              {
                system: LOINC_SYSTEM,
                code: "8867-4",
                display: "Heart rate",
              },
            ],
            text: "Heart rate",
          },
          "vital-signs",
          {
            valueQuantity: {
              value: vitals.heartRate,
              unit: "beats/minute",
            },
          }
        )
      );
    }

    if (
      typeof vitals.respiratoryRate === "number" &&
      vitals.respiratoryRate > 0
    ) {
      observations.push(
        makeObservation(
          {
            coding: [
              {
                system: LOINC_SYSTEM,
                code: "9279-1",
                display: "Respiratory rate",
              },
            ],
            text: "Respiratory rate",
          },
          "vital-signs",
          {
            valueQuantity: {
              value: vitals.respiratoryRate,
              unit: "breaths/minute",
            },
          }
        )
      );
    }

    if (typeof vitals.temperature === "number" && vitals.temperature > 0) {
      observations.push(
        makeObservation(
          {
            coding: [
              {
                system: LOINC_SYSTEM,
                code: "8310-5",
                display: "Body temperature",
              },
            ],
            text: "Body temperature",
          },
          "vital-signs",
          {
            valueQuantity: {
              value: vitals.temperature,
              unit: "°C",
            },
          }
        )
      );
    }

    if (typeof vitals.spO2 === "number" && vitals.spO2 > 0) {
      observations.push(
        makeObservation(
          {
            coding: [
              {
                system: LOINC_SYSTEM,
                code: "59408-5",
                display: "Oxygen saturation",
              },
            ],
            text: "Oxygen saturation",
          },
          "vital-signs",
          {
            valueQuantity: {
              value: vitals.spO2,
              unit: "%",
            },
          }
        )
      );
    }

    if (typeof vitals.bmi === "number" && vitals.bmi > 0) {
      observations.push(
        makeObservation(
          {
            coding: [
              {
                system: LOINC_SYSTEM,
                code: "39156-5",
                display: "Body mass index (BMI)",
              },
            ],
            text: "Body mass index (BMI)",
          },
          "vital-signs",
          {
            valueQuantity: {
              value: vitals.bmi,
              unit: "kg/m2",
            },
          }
        )
      );
    }

    if (vitals.bloodPressure) {
      observations.push(
        makeObservation(
          {
            text: "Blood pressure",
          },
          "vital-signs",
          {
            valueString: vitals.bloodPressure,
          }
        )
      );
    }
  }

  const pushSection = (sectionName: string, fields: Record<string, string>) => {
    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      if (!value) return;
      const label = key.replace(/([A-Z])/g, " $1").toLowerCase();
      observations.push(
        makeObservation(
          {
            text: `${sectionName}: ${label}`,
          },
          "exam",
          {
            valueString: value,
          }
        )
      );
    });
  };

  pushSection("General examination", exam.generalExamination || {});
  pushSection("Cardiovascular exam", exam.cardiovascularExam || {});
  pushSection("Respiratory exam", exam.respiratoryExam || {});
  pushSection("Abdominal exam", exam.abdominalExam || {});
  pushSection("Neurological exam", exam.neurologicalExam || {});
  pushSection("Musculoskeletal exam", exam.musculoskeletalExam || {});

  return observations;
}

export function buildFamilyHistoryResources(
  ctx: FhirBuildContext
): FhirFamilyMemberHistory[] {
  const entries = (ctx.history.familyHistory || []) as any[];
  if (!entries.length) {
    return [];
  }

  return entries
    .filter((entry) => entry && (entry.relation || entry.condition))
    .map((entry) => ({
      resourceType: "FamilyMemberHistory",
      status: "completed",
      patient: {
        reference: `Patient/${ctx.patientId}`,
      },
      relationship: {
        text: entry.relation || "",
      },
      condition: entry.condition
        ? [
            {
              code: {
                text: entry.condition,
              },
              onsetAgeString: entry.age,
            },
          ]
        : undefined,
    }));
}

function mapInvestigationResultStatus(status?: string): string {
  switch (status) {
    case "completed":
      return "final";
    case "abnormal":
      return "final";
    case "pending":
    default:
      return "registered";
  }
}

export function buildInvestigationServiceRequests(
  ctx: FhirBuildContext
): FhirServiceRequest[] {
  const data = ctx.investigations;
  if (!data || !data.investigations || !data.investigations.length) {
    return [];
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  return data.investigations
    .filter((inv) => inv && (inv.testName || inv.testCode))
    .map((inv) => {
      const coding: FhirCoding[] = [];
      if (inv.testCode) {
        coding.push({
          code: inv.testCode,
          display: inv.testName,
        });
      }

      const noteTexts: string[] = [];
      if (inv.urgency) {
        noteTexts.push(`Urgency: ${inv.urgency.toUpperCase()}`);
      }
      if (inv.notes) {
        noteTexts.push(inv.notes);
      }

      return {
        resourceType: "ServiceRequest",
        status: "active",
        intent: "order",
        subject,
        encounter: encounterRef,
        code: {
          coding: coding.length ? coding : undefined,
          text: inv.testName || inv.testCode,
        },
        note: noteTexts.length
          ? noteTexts.map((text) => ({ text }))
          : undefined,
      };
    });
}

export function buildInvestigationDiagnosticReports(
  ctx: FhirBuildContext
): FhirDiagnosticReport[] {
  const data = ctx.investigations;
  if (!data || !data.results || !data.results.length) {
    return [];
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  return data.results
    .filter((res) => res && res.testName)
    .map((res) => {
      const conclusionParts: string[] = [];
      if (res.value) {
        conclusionParts.push(`${res.value}${res.unit ? " " + res.unit : ""}`);
      }
      if (res.referenceRange) {
        conclusionParts.push(`Ref: ${res.referenceRange}`);
      }
      if (res.status) {
        conclusionParts.push(`Status: ${res.status}`);
      }

      return {
        resourceType: "DiagnosticReport",
        status: mapInvestigationResultStatus(res.status),
        subject,
        encounter: encounterRef,
        code: {
          text: res.testName,
        },
        conclusion: conclusionParts.join(" | "),
      };
    });
}

export function buildMedicationRequests(
  ctx: FhirBuildContext
): FhirMedicationRequest[] {
  const meds = ctx.medications;
  if (!meds || !meds.prescriptions || !meds.prescriptions.length) {
    return [];
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  return meds.prescriptions
    .filter((p) => p && p.medicationName)
    .map((p) => {
      const segments: string[] = [];
      if (p.dosage) segments.push(p.dosage);
      if (p.route) segments.push(p.route);
      if (p.frequency) segments.push(p.frequency);
      if (p.duration) segments.push(`for ${p.duration}`);
      if (p.indication) segments.push(`Indication: ${p.indication}`);

      const noteTexts: string[] = [];
      if (p.notes) noteTexts.push(p.notes);

      return {
        resourceType: "MedicationRequest",
        status: "active",
        intent: "order",
        subject,
        encounter: encounterRef,
        medicationCodeableConcept: {
          text: p.medicationName,
        },
        dosageInstruction: segments.length
          ? [
              {
                text: segments.join(", "),
              },
            ]
          : undefined,
        note: noteTexts.length
          ? noteTexts.map((text) => ({ text }))
          : undefined,
      };
    });
}

export function buildCarePlanForAdvice(
  ctx: FhirBuildContext
): FhirCarePlan | undefined {
  const hasAssessment = !!ctx.assessment;
  const hasPlan = !!ctx.plan;
  if (!hasAssessment && !hasPlan) {
    return undefined;
  }

  const subject: FhirReference = {
    reference: `Patient/${ctx.patientId}`,
  };
  const encounterRef: FhirReference | undefined = ctx.encounterId
    ? { reference: `Encounter/${ctx.encounterId}` }
    : undefined;

  const descriptionParts: string[] = [];
  if (hasAssessment) {
    descriptionParts.push(`Assessment: ${ctx.assessment}`);
  }
  if (hasPlan) {
    descriptionParts.push(`Plan: ${ctx.plan}`);
  }

  return {
    resourceType: "CarePlan",
    status: "active",
    intent: "plan",
    subject,
    encounter: encounterRef,
    title: "Encounter advice and follow-up plan",
    description: descriptionParts.join("\n\n"),
  };
}

export function buildAllClinicalResourcesForSteps1to3(ctx: FhirBuildContext) {
  const encounter = buildEncounterResource(ctx);
  const chiefComplaintConditions = buildChiefComplaintConditions(ctx);
  const pastMedicalConditions = buildPastMedicalHistoryConditions(ctx);
  const obgynConditions = buildObgynConditions(ctx);
  const conditions = [
    ...chiefComplaintConditions,
    ...pastMedicalConditions,
    ...obgynConditions,
  ];
  const hpiObservations = buildHpiObservations(ctx);
  const systemEnquiryObservations = buildSystemEnquiryObservations(ctx);
  const obgynObservations = buildObgynObservations(ctx);
  const socialHistoryObservations = buildSocialHistoryObservations(ctx);
  const personalHistoryObservations = buildPersonalHistoryObservations(ctx);
  const physicalExamObservations = buildPhysicalExamObservations(ctx);
  const observations = [
    ...hpiObservations,
    ...systemEnquiryObservations,
    ...obgynObservations,
    ...socialHistoryObservations,
    ...personalHistoryObservations,
    ...physicalExamObservations,
  ];
  const medicationStatements = buildMedicationHistoryStatements(ctx);
  const procedures = buildSurgicalHistoryProcedures(ctx);
  const immunizations = buildImmunizations(ctx);
  const familyHistories = buildFamilyHistoryResources(ctx);
  const serviceRequests = buildInvestigationServiceRequests(ctx);
  const diagnosticReports = buildInvestigationDiagnosticReports(ctx);
  const medicationRequests = buildMedicationRequests(ctx);
  const carePlan = buildCarePlanForAdvice(ctx);
  const carePlans = carePlan ? [carePlan] : [];

  return {
    encounter,
    conditions,
    observations,
    medicationStatements,
    procedures,
    immunizations,
    familyHistories,
    serviceRequests,
    diagnosticReports,
    medicationRequests,
    carePlans,
  };
}

export interface NdjsonExportForSteps1to3 {
  encounterNdjson: string;
  conditionNdjson: string;
  observationNdjson: string;
  medicationStatementNdjson: string;
  procedureNdjson: string;
  immunizationNdjson: string;
  familyMemberHistoryNdjson: string;
  serviceRequestNdjson: string;
  diagnosticReportNdjson: string;
  medicationRequestNdjson: string;
  carePlanNdjson: string;
}

export function buildFhirBundleForSteps1to3(
  ctx: FhirBuildContext,
  bundleId?: string
): FhirBundle {
  const {
    encounter,
    conditions,
    observations,
    medicationStatements,
    procedures,
    immunizations,
    familyHistories,
    serviceRequests,
    diagnosticReports,
    medicationRequests,
    carePlans,
  } = buildAllClinicalResourcesForSteps1to3(ctx);

  // Ensure encounter has a local id for internal references
  if (!encounter.id) {
    encounter.id = "encounter-local";
  }

  const entries: FhirBundleEntry[] = [
    { resource: encounter },
    ...conditions.map((c) => ({ resource: c })),
    ...observations.map((o) => ({ resource: o })),
    ...medicationStatements.map((m) => ({ resource: m })),
    ...procedures.map((p) => ({ resource: p })),
    ...immunizations.map((i) => ({ resource: i })),
    ...familyHistories.map((f) => ({ resource: f })),
    ...serviceRequests.map((s) => ({ resource: s })),
    ...diagnosticReports.map((d) => ({ resource: d })),
    ...medicationRequests.map((mr) => ({ resource: mr })),
    ...carePlans.map((cp) => ({ resource: cp })),
  ];

  return {
    resourceType: "Bundle",
    type: "collection",
    id: bundleId,
    entry: entries,
  };
}

export function exportEncounterNdjsonForSteps1to3(
  ctx: FhirBuildContext
): NdjsonExportForSteps1to3 {
  const {
    encounter,
    conditions,
    observations,
    medicationStatements,
    procedures,
    immunizations,
    familyHistories,
    serviceRequests,
    diagnosticReports,
    medicationRequests,
    carePlans,
  } = buildAllClinicalResourcesForSteps1to3(ctx);

  const encounterNdjson = JSON.stringify(encounter);
  const conditionNdjson = conditions.map((c) => JSON.stringify(c)).join("\n");
  const observationNdjson = observations
    .map((o) => JSON.stringify(o))
    .join("\n");
  const medicationStatementNdjson = medicationStatements
    .map((m) => JSON.stringify(m))
    .join("\n");
  const procedureNdjson = procedures.map((p) => JSON.stringify(p)).join("\n");
  const immunizationNdjson = immunizations
    .map((i) => JSON.stringify(i))
    .join("\n");
  const familyMemberHistoryNdjson = familyHistories
    .map((f) => JSON.stringify(f))
    .join("\n");
  const serviceRequestNdjson = serviceRequests
    .map((s) => JSON.stringify(s))
    .join("\n");
  const diagnosticReportNdjson = diagnosticReports
    .map((d) => JSON.stringify(d))
    .join("\n");
  const medicationRequestNdjson = medicationRequests
    .map((mr) => JSON.stringify(mr))
    .join("\n");
  const carePlanNdjson = carePlans.map((cp) => JSON.stringify(cp)).join("\n");

  return {
    encounterNdjson,
    conditionNdjson,
    observationNdjson,
    medicationStatementNdjson,
    procedureNdjson,
    immunizationNdjson,
    familyMemberHistoryNdjson,
    serviceRequestNdjson,
    diagnosticReportNdjson,
    medicationRequestNdjson,
    carePlanNdjson,
  };
}
