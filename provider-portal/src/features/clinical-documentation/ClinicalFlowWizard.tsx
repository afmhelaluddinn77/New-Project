import React from "react";
import { useEncounterStore } from "../../store/encounterStore";
import { WizardStep10SocialHistory } from "./WizardStep10SocialHistory";
import { WizardStep11PersonalHistory } from "./WizardStep11PersonalHistory";
import { WizardStep12PhysicalExamination } from "./WizardStep12PhysicalExamination";
import { WizardStep13Investigations } from "./WizardStep13Investigations";
import { WizardStep14Medications } from "./WizardStep14Medications";
import { WizardStep15AdviceFollowUp } from "./WizardStep15AdviceFollowUp";
import { WizardStep1ChiefComplaint } from "./WizardStep1ChiefComplaint";
import { WizardStep2HPI } from "./WizardStep2HPI";
import { WizardStep3OtherSystems } from "./WizardStep3OtherSystems";
import { WizardStep4PastMedicalHistory } from "./WizardStep4PastMedicalHistory";
import { WizardStep5DrugHistory } from "./WizardStep5DrugHistory";
import { WizardStep6SurgicalHistory } from "./WizardStep6SurgicalHistory";
import { WizardStep7ObgynHistory } from "./WizardStep7ObgynHistory";
import { WizardStep8ImmunizationHistory } from "./WizardStep8ImmunizationHistory";
import { WizardStep9FamilyHistory } from "./WizardStep9FamilyHistory";

const STEPS: string[] = [
  "Chief Complaint",
  "History of Present Illness / Symptom Features",
  "Other Systems Enquiry",
  "Past Medical History",
  "Drug History",
  "Surgical History",
  "OB/GYN History",
  "Immunization History",
  "Family History",
  "Social History",
  "Personal History",
  "Physical Examination",
  "Investigations",
  "Medications",
  "Advice, Follow-up & Digital Signature",
];

export const ClinicalFlowWizard: React.FC = () => {
  const { activeStep, setActiveStep } = useEncounterStore();

  const totalSteps = STEPS.length;
  const currentIndex = Math.min(Math.max(activeStep - 1, 0), totalSteps - 1);
  const currentLabel = STEPS[currentIndex];

  const canGoBack = activeStep > 1;
  const canGoNext = activeStep < totalSteps;

  const handlePrevious = () => {
    if (canGoBack) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setActiveStep(activeStep + 1);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return <WizardStep1ChiefComplaint />;
      case 2:
        return <WizardStep2HPI />;
      case 3:
        return <WizardStep3OtherSystems />;
      case 4:
        return <WizardStep4PastMedicalHistory />;
      case 5:
        return <WizardStep5DrugHistory />;
      case 6:
        return <WizardStep6SurgicalHistory />;
      case 7:
        return <WizardStep7ObgynHistory />;
      case 8:
        return <WizardStep8ImmunizationHistory />;
      case 9:
        return <WizardStep9FamilyHistory />;
      case 10:
        return <WizardStep10SocialHistory />;
      case 11:
        return <WizardStep11PersonalHistory />;
      case 12:
        return <WizardStep12PhysicalExamination />;
      case 13:
        return <WizardStep13Investigations />;
      case 14:
        return <WizardStep14Medications />;
      case 15:
        return <WizardStep15AdviceFollowUp />;
      default:
        return (
          <p style={{ margin: 0, color: "#6b7280" }}>
            Detailed content for <strong>{currentLabel}</strong> will be
            implemented in subsequent phases of the redesign.
          </p>
        );
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Clinical Flow Wizard</h2>
        <p style={{ color: "#64748B" }}>
          Step {activeStep} of {totalSteps}: {currentLabel}
        </p>
      </div>

      <div
        style={{
          border: "1px solid var(--color-border-light)",
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        {renderStep()}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoBack}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            backgroundColor: canGoBack ? "#ffffff" : "#f9fafb",
            color: "#111827",
          }}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            border: "none",
            backgroundColor: canGoNext ? "#2563eb" : "#93c5fd",
            color: "white",
          }}
        >
          {canGoNext ? "Next →" : "End of Wizard"}
        </button>
      </div>
    </div>
  );
};
