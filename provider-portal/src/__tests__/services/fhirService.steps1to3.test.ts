import {
  buildAllClinicalResourcesForSteps1to3,
  buildFhirBundleForSteps1to3,
  exportEncounterNdjsonForSteps1to3,
  type FhirBuildContext,
  type NdjsonExportForSteps1to3,
} from "../../services/fhirService";

function makeContextWithSurgicalAndImmunization(): FhirBuildContext {
  return {
    encounterId: "enc-1",
    encounterDate: "2025-01-01",
    encounterType: "OUTPATIENT",
    patientId: "pat-1",
    providerId: "prov-1",
    history: {
      chiefComplaint: "",
      chiefComplaintSymptoms: [],
      historyOfPresentIllness: {
        onset: "",
        character: "",
        quality: "",
        radiation: "",
        severity: 5,
        timing: "",
        context: "",
        symptomFeatures: {},
      },
      pastMedicalHistory: [],
      medicationHistory: [],
      surgicalHistory: [
        {
          procedure: "Appendectomy",
          snomedCode: "80146002",
          date: "2020-01-01",
          bodySite: "Abdomen",
          outcome: "Recovered",
          notes: "Laparoscopic procedure",
        },
      ],
      obgynHistory: {
        obstetric: {},
        gynecologic: {},
      },
      immunizationHistory: [
        {
          vaccineName: "Influenza",
          cvxCode: "88",
          status: "completed",
          date: "2024-10-01",
          notes: "Annual",
        },
      ],
      familyHistory: [],
      socialHistory: {
        occupation: "",
        tobacco: "",
        alcohol: "",
        drugs: "",
        livingConditions: "",
      },
      systemEnquiry: {} as any,
      reviewOfSystems: {
        general: "",
        cardiovascular: "",
        respiratory: "",
        gastrointestinal: "",
        genitourinary: "",
        neurological: "",
        psychiatric: "",
        musculoskeletal: "",
        skin: "",
        endocrine: "",
      },
    },
  };
}

describe("buildAllClinicalResourcesForSteps1to3", () => {
  it("includes procedures and immunizations derived from history", () => {
    const ctx = makeContextWithSurgicalAndImmunization();
    const result = buildAllClinicalResourcesForSteps1to3(ctx);

    expect(result.procedures).toHaveLength(1);
    const procedure = result.procedures[0];
    expect(procedure.resourceType).toBe("Procedure");
    expect(procedure.code.text).toBe("Appendectomy");

    expect(result.immunizations).toHaveLength(1);
    const immunization = result.immunizations[0];
    expect(immunization.resourceType).toBe("Immunization");
    expect(immunization.vaccineCode.text).toBe("Influenza");
  });
});

describe("buildFhirBundleForSteps1to3", () => {
  it("places procedures and immunizations into bundle entries", () => {
    const ctx = makeContextWithSurgicalAndImmunization();
    const bundle = buildFhirBundleForSteps1to3(ctx, "bundle-1");

    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");

    const resources = bundle.entry.map((e) => e.resource as any);
    const procedureResources = resources.filter(
      (r) => r.resourceType === "Procedure"
    );
    const immunizationResources = resources.filter(
      (r) => r.resourceType === "Immunization"
    );

    expect(
      procedureResources.some((p) => p.code && p.code.text === "Appendectomy")
    ).toBe(true);
    expect(
      immunizationResources.some(
        (i) => i.vaccineCode && i.vaccineCode.text === "Influenza"
      )
    ).toBe(true);
  });

  it("includes extended CF4–CF6 resources in the bundle when present", () => {
    const ctx: FhirBuildContext = {
      encounterId: "enc-all",
      encounterDate: "2025-01-01",
      encounterType: "OUTPATIENT",
      patientId: "pat-1",
      providerId: "prov-1",
      history: {
        chiefComplaint: "",
        chiefComplaintSymptoms: [],
        historyOfPresentIllness: {
          onset: "",
          character: "",
          quality: "",
          radiation: "",
          severity: 5,
          timing: "",
          context: "",
          symptomFeatures: {},
        },
        pastMedicalHistory: [],
        medicationHistory: [],
        surgicalHistory: [],
        obgynHistory: {
          obstetric: {},
          gynecologic: {},
        },
        immunizationHistory: [],
        familyHistory: [
          { relation: "Father", condition: "Hypertension", age: "55" },
        ],
        socialHistory: {
          occupation: "Engineer",
          tobacco: "Never",
          alcohol: "Occasional",
          drugs: "None",
          livingConditions: "Lives with family",
        },
        systemEnquiry: {} as any,
        reviewOfSystems: {
          general: "",
          cardiovascular: "",
          respiratory: "",
          gastrointestinal: "",
          genitourinary: "",
          neurological: "",
          psychiatric: "",
          musculoskeletal: "",
          skin: "",
          endocrine: "",
        },
      },
      examination: {
        vitalSigns: {
          bloodPressure: "120/80",
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 37,
          spO2: 98,
          bmi: 24,
        },
        generalExamination: {
          appearance: "Well appearing",
          consciousness: "Alert",
          nutritionalStatus: "Normal",
          hydration: "Normal",
        },
        cardiovascularExam: {
          heartSounds: "Normal",
          pulses: "Normal",
          bloodPressure: "120/80",
          edema: "None",
        },
        respiratoryExam: {
          breathSounds: "Vesicular",
          chestExpansion: "Symmetric",
          percussion: "Resonant",
          fremitus: "Normal",
        },
        abdominalExam: {
          inspection: "Soft",
          palpation: "Non-tender",
          percussion: "Tympanic",
          auscultation: "Normal bowel sounds",
        },
        neurologicalExam: {
          cranialNerves: "Intact",
          motorFunction: "Normal",
          sensory: "Normal",
          reflexes: "2+",
          gait: "Normal",
        },
        musculoskeletalExam: {
          joints: "No swelling",
          rangeOfMotion: "Full",
          muscleStrength: "5/5",
          deformities: "None",
        },
      },
      investigations: {
        investigations: [
          {
            testName: "Complete Blood Count",
            testCode: "CBC",
            urgency: "routine",
            notes: "",
          },
        ],
        results: [
          {
            testName: "Hemoglobin",
            value: "11.0",
            unit: "g/dL",
            referenceRange: "12-16",
            status: "abnormal",
          },
        ],
      },
      medications: {
        prescriptions: [
          {
            medicationName: "Amoxicillin 500mg",
            genericName: "Amoxicillin",
            dosage: "500 mg",
            frequency: "8 hourly",
            duration: "5 days",
            route: "Oral",
            indication: "Tonsillitis",
            notes: "Take after food",
          },
        ],
      },
      assessment: "Acute tonsillitis",
      plan: "Start antibiotics and review in 5 days",
    };

    const bundle = buildFhirBundleForSteps1to3(ctx, "bundle-all");
    const resources = bundle.entry.map((e) => e.resource as any);

    expect(
      resources.some((r) => r.resourceType === "FamilyMemberHistory")
    ).toBe(true);
    expect(resources.some((r) => r.resourceType === "ServiceRequest")).toBe(
      true
    );
    expect(resources.some((r) => r.resourceType === "DiagnosticReport")).toBe(
      true
    );
    expect(resources.some((r) => r.resourceType === "MedicationRequest")).toBe(
      true
    );
    expect(resources.some((r) => r.resourceType === "CarePlan")).toBe(true);
  });
});

describe("exportEncounterNdjsonForSteps1to3", () => {
  it("serializes extended resource types into NDJSON streams", () => {
    const ctx: FhirBuildContext = {
      encounterId: "enc-all",
      encounterDate: "2025-01-01",
      encounterType: "OUTPATIENT",
      patientId: "pat-1",
      providerId: "prov-1",
      history: {
        chiefComplaint: "",
        chiefComplaintSymptoms: [],
        historyOfPresentIllness: {
          onset: "",
          character: "",
          quality: "",
          radiation: "",
          severity: 5,
          timing: "",
          context: "",
          symptomFeatures: {},
        },
        pastMedicalHistory: [],
        medicationHistory: [],
        surgicalHistory: [],
        obgynHistory: {
          obstetric: {},
          gynecologic: {},
        },
        immunizationHistory: [],
        familyHistory: [
          { relation: "Father", condition: "Hypertension", age: "55" },
        ],
        socialHistory: {
          occupation: "Engineer",
          tobacco: "Never",
          alcohol: "Occasional",
          drugs: "None",
          livingConditions: "Lives with family",
        },
        systemEnquiry: {} as any,
        reviewOfSystems: {
          general: "",
          cardiovascular: "",
          respiratory: "",
          gastrointestinal: "",
          genitourinary: "",
          neurological: "",
          psychiatric: "",
          musculoskeletal: "",
          skin: "",
          endocrine: "",
        },
      },
      investigations: {
        investigations: [
          {
            testName: "Complete Blood Count",
            testCode: "CBC",
            urgency: "routine",
            notes: "",
          },
        ],
        results: [],
      },
      medications: {
        prescriptions: [
          {
            medicationName: "Amoxicillin 500mg",
            genericName: "Amoxicillin",
            dosage: "500 mg",
            frequency: "8 hourly",
            duration: "5 days",
            route: "Oral",
            indication: "Tonsillitis",
            notes: "Take after food",
          },
        ],
      },
      assessment: "Acute tonsillitis",
      plan: "Start antibiotics and review in 5 days",
    };

    const ndjson: NdjsonExportForSteps1to3 =
      exportEncounterNdjsonForSteps1to3(ctx);

    const parseFirst = (content: string | undefined) => {
      if (!content) return undefined;
      const firstLine = content.split("\n").filter(Boolean)[0];
      return firstLine ? JSON.parse(firstLine) : undefined;
    };

    const fam = parseFirst(ndjson.familyMemberHistoryNdjson);
    const sr = parseFirst(ndjson.serviceRequestNdjson);
    const mr = parseFirst(ndjson.medicationRequestNdjson);
    const cp = parseFirst(ndjson.carePlanNdjson);

    expect(fam?.resourceType).toBe("FamilyMemberHistory");
    expect(sr?.resourceType).toBe("ServiceRequest");
    expect(mr?.resourceType).toBe("MedicationRequest");
    expect(cp?.resourceType).toBe("CarePlan");
  });
});
