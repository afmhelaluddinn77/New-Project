import React from "react";
import { SocialHistory } from "../encounter/components/history";

export const WizardStep10SocialHistory: React.FC = () => {
  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 10: Social History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Capture occupation, tobacco/alcohol/drug use, and living conditions.
        This step reuses the same social history data as the tabbed editor, so
        information stays in sync across views.
      </p>

      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--color-border-light)",
          padding: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <SocialHistory />
      </div>
    </div>
  );
};
