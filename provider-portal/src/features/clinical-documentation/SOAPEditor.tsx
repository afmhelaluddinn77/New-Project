import React from "react";
import { useEncounterStore } from "../../store/encounterStore";

export const SOAPEditor: React.FC = () => {
  const { assessment, plan, setAssessment, setPlan } = useEncounterStore();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
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
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Assessment</h3>
        <textarea
          value={assessment}
          onChange={(e) => setAssessment(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1px solid var(--color-border-light)",
            padding: "8px 10px",
            fontSize: 14,
          }}
          placeholder="Clinical assessment / diagnosis summary"
        />
      </div>

      <div
        style={{
          borderRadius: 12,
          border: "1px solid var(--color-border-light)",
          padding: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>Plan</h3>
        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          rows={6}
          style={{
            width: "100%",
            borderRadius: 8,
            border: "1px solid var(--color-border-light)",
            padding: "8px 10px",
            fontSize: 14,
          }}
          placeholder="Investigations, medications, referrals, and follow-up plan"
        />
      </div>
    </div>
  );
};
