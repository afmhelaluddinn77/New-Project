import {
  buildSystemEnquiryObservations,
  type FhirBuildContext,
} from "../../services/fhirService";

// Helper to build a minimal FhirBuildContext focused on systemEnquiry
function makeContext(systemEnquiry: any): FhirBuildContext {
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
      surgicalHistory: [],
      obgynHistory: {
        obstetric: {},
        gynecologic: {},
      },
      immunizationHistory: [],
      familyHistory: [],
      socialHistory: {
        occupation: "",
        tobacco: "",
        alcohol: "",
        drugs: "",
        livingConditions: "",
      },
      systemEnquiry,
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

describe("buildSystemEnquiryObservations (Step 3)", () => {
  it("emits a single 'Normal' Observation when a system is marked normal with no positives", () => {
    const ctx = makeContext({
      cardiovascular: { normal: true, positiveSymptoms: [], summaryText: "" },
    });

    const observations = buildSystemEnquiryObservations(ctx);

    expect(observations).toHaveLength(1);
    const obs = observations[0];
    expect(obs.code.text).toBe("Review of systems: cardiovascular");
    expect(obs.interpretation?.[0].coding?.[0].code).toBe("N");
  });

  it("emits one Observation per positive symptom when a system is abnormal", () => {
    const ctx = makeContext({
      respiratory: {
        normal: false,
        positiveSymptoms: [
          { snomedCode: "49727002", label: "Cough" },
          { snomedCode: "56018004", label: "Wheeze" },
        ],
        summaryText: "Chronic cough, occasional wheeze",
      },
    });

    const observations = buildSystemEnquiryObservations(ctx);

    expect(observations).toHaveLength(2);
    const codes = observations.map((o) => o.code.coding?.[0].code);
    expect(codes).toContain("49727002");
    expect(codes).toContain("56018004");
    observations.forEach((o) => {
      expect(o.valueString).toBe("Chronic cough, occasional wheeze");
    });
  });

  it("handles mixed normal and abnormal systems correctly", () => {
    const ctx = makeContext({
      general: { normal: true, positiveSymptoms: [], summaryText: "" },
      endocrine: { normal: false, positiveSymptoms: [], summaryText: "" },
      neurological: {
        normal: false,
        positiveSymptoms: [{ snomedCode: "25064002", label: "Headache" }],
        summaryText: "Frontal headache",
      },
    });

    const observations = buildSystemEnquiryObservations(ctx);

    // One for general (normal), one for neurological (positive symptom)
    expect(observations).toHaveLength(2);
    const texts = observations.map((o) => o.code.text);
    expect(texts).toContain("Review of systems: general");
    expect(texts).toContain("neurological: Headache");
  });

  it("returns an empty array when systemEnquiry is empty", () => {
    const ctx = makeContext({});
    const observations = buildSystemEnquiryObservations(ctx);
    expect(observations).toHaveLength(0);
  });
});
