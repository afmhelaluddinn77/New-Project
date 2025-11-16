import React from "react";
import {
  DrugInteractionChecker,
  MedicationList,
  MedicationPrescription,
  MedicationSearch,
} from "../encounter/components/medications";

export const WizardStep14Medications: React.FC = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 14: Medications</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Prescribe, review, and reconcile medications. This step reuses the same
        prescribing components as the Medications tab so all orders and lists
        stay synchronized.
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <MedicationSearch />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <MedicationPrescription />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <DrugInteractionChecker />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <MedicationList />
        </div>
      </div>
    </div>
  );
};
