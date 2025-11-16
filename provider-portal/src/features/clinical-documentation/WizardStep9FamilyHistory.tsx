import React from "react";
import { FamilyHistory } from "../encounter/components/history";

export const WizardStep9FamilyHistory: React.FC = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 9: Family History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Capture relevant family history, including cardiovascular, metabolic,
        oncologic, and other hereditary conditions. This information is shared
        with the main History tab to avoid duplicate data entry.
      </p>

      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--color-border-light)",
          padding: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <FamilyHistory />
      </div>
    </div>
  );
};
