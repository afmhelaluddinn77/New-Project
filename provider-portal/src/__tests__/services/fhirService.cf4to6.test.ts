import {
  buildAllClinicalResourcesForSteps1to3,
  buildCarePlanForAdvice,
  buildInvestigationDiagnosticReports,
  buildInvestigationServiceRequests,
  buildMedicationRequests,
  buildPersonalHistoryObservations,
  buildPhysicalExamObservations,
  buildSocialHistoryObservations,
  type FhirBuildContext,
} from "../../services/fhirService";

function makeBaseContext(): FhirBuildContext {
  return {
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

describe("FHIR builders CF4–CF6", () => {
  it("builds social and personal history observations", () => {
    const ctx = makeBaseContext();
    ctx.history.familyHistory = [
      { relation: "Father", condition: "Hypertension", age: "55" },
    ];
    ctx.history.socialHistory = {
      occupation: "Engineer",
      tobacco: "Never",
      alcohol: "Occasional",
      drugs: "None",
      livingConditions: "Lives with family",
    };

    const socialObs = buildSocialHistoryObservations(ctx);
    const personalObs = buildPersonalHistoryObservations(ctx);

    expect(socialObs.length).toBeGreaterThanOrEqual(3);
    const occupation = socialObs.find((o) => o.code.text === "Occupation");
    expect(occupation?.valueString).toBe("Engineer");

    expect(personalObs).toHaveLength(1);
    expect(personalObs[0].valueString).toContain("Family history entries: 1");
    expect(personalObs[0].category?.[0].coding?.[0].code).toBe(
      "social-history"
    );
  });

  it("builds physical exam observations for vitals and exam sections", () => {
    const ctx = makeBaseContext();
    ctx.examination = {
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
        heartSounds: "Normal S1 S2",
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
    };

    const obs = buildPhysicalExamObservations(ctx);

    const hr = obs.find((o) => o.code.text === "Heart rate");
    expect(hr?.valueQuantity?.value).toBe(72);
    const appearance = obs.find((o) =>
      o.code.text?.startsWith("General examination: appearance")
    );
    expect(appearance?.valueString).toBe("Well appearing");
  });

  it("builds investigation ServiceRequests and DiagnosticReports", () => {
    const ctx = makeBaseContext();
    ctx.investigations = {
      investigations: [
        {
          testName: "Complete Blood Count",
          testCode: "CBC",
          urgency: "stat",
          notes: "Rule out anemia",
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
    };

    const srs = buildInvestigationServiceRequests(ctx);
    expect(srs).toHaveLength(1);
    expect(srs[0].resourceType).toBe("ServiceRequest");
    expect(srs[0].code.text).toBe("Complete Blood Count");
    expect(srs[0].note?.[0].text).toContain("Urgency");

    const drs = buildInvestigationDiagnosticReports(ctx);
    expect(drs).toHaveLength(1);
    expect(drs[0].resourceType).toBe("DiagnosticReport");
    expect(drs[0].code.text).toBe("Hemoglobin");
    expect(drs[0].conclusion).toContain("11.0 g/dL");
    expect(drs[0].conclusion).toContain("Ref: 12-16");
  });

  it("builds MedicationRequests from active prescriptions", () => {
    const ctx = makeBaseContext();
    ctx.medications = {
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
    };

    const mrs = buildMedicationRequests(ctx);
    expect(mrs).toHaveLength(1);
    const mr = mrs[0];
    expect(mr.resourceType).toBe("MedicationRequest");
    expect(mr.medicationCodeableConcept.text).toBe("Amoxicillin 500mg");
    expect(mr.dosageInstruction?.[0].text).toContain("500 mg");
    expect(mr.dosageInstruction?.[0].text).toContain("8 hourly");
    expect(mr.dosageInstruction?.[0].text).toContain("for 5 days");
  });

  it("builds CarePlan from assessment and plan text", () => {
    const ctx = makeBaseContext();
    ctx.assessment = "Acute tonsillitis";
    ctx.plan = "Start antibiotics and review in 5 days";

    const carePlan = buildCarePlanForAdvice(ctx);
    expect(carePlan).toBeDefined();
    expect(carePlan?.resourceType).toBe("CarePlan");
    expect(carePlan?.description).toContain("Assessment: Acute tonsillitis");
    expect(carePlan?.description).toContain(
      "Plan: Start antibiotics and review in 5 days"
    );
  });

  it("includes new resources in the aggregate builder", () => {
    const ctx = makeBaseContext();
    ctx.history.familyHistory = [
      { relation: "Father", condition: "Hypertension", age: "55" },
    ];
    ctx.history.socialHistory = {
      occupation: "Engineer",
      tobacco: "Never",
      alcohol: "Occasional",
      drugs: "None",
      livingConditions: "Lives with family",
    };
    ctx.examination = {
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
        heartSounds: "Normal S1 S2",
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
    };
    ctx.investigations = {
      investigations: [
        {
          testName: "Complete Blood Count",
          testCode: "CBC",
          urgency: "routine",
          notes: "",
        },
      ],
      results: [],
    };
    ctx.medications = {
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
    };
    ctx.assessment = "Acute tonsillitis";
    ctx.plan = "Start antibiotics and review in 5 days";

    const result = buildAllClinicalResourcesForSteps1to3(ctx);

    expect(result.familyHistories.length).toBe(1);
    expect(result.serviceRequests.length).toBe(1);
    expect(result.medicationRequests.length).toBe(1);
    expect(result.carePlans.length).toBe(1);
    expect(result.observations.length).toBeGreaterThan(0);
  });
});
