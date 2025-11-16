import React from "react";
import {
  ImagingOrders,
  InvestigationOrders,
  InvestigationResults,
  InvestigationSearch,
} from "../encounter/components/investigations";

export const WizardStep13Investigations: React.FC = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 13: Investigations</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Order and review laboratory and imaging investigations. This step reuses
        the same data as the Investigations tab so your orders and results stay
        in sync.
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
          <InvestigationSearch />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <ImagingOrders />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <InvestigationOrders />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <InvestigationResults />
        </div>
      </div>
    </div>
  );
};
