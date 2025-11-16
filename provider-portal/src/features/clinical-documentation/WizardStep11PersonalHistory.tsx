import React from "react";
import { useEncounterStore } from "../../store/encounterStore";

export const WizardStep11PersonalHistory: React.FC = () => {
  const { history } = useEncounterStore();
  const social = history.socialHistory;
  const family = history.familyHistory || [];

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 11: Personal History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Review key aspects of the patient's personal background based on social
        and family history. This step is a summary and does not introduce new
        fields, so the same information is shared with other parts of the
        encounter.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
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
          <h4 style={{ marginBottom: 8 }}>Social background</h4>
          <ul
            style={{
              margin: 0,
              paddingLeft: 20,
              fontSize: 14,
              color: "#374151",
            }}
          >
            <li>
              <strong>Occupation:</strong> {social.occupation || "Not recorded"}
            </li>
            <li>
              <strong>Tobacco:</strong> {social.tobacco || "Not recorded"}
            </li>
            <li>
              <strong>Alcohol:</strong> {social.alcohol || "Not recorded"}
            </li>
            <li>
              <strong>Drugs:</strong> {social.drugs || "Not recorded"}
            </li>
          </ul>
          <div style={{ marginTop: 8, fontSize: 14, color: "#374151" }}>
            <strong>Living conditions:</strong>
            <div style={{ marginTop: 4 }}>
              {social.livingConditions || "Not recorded"}
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Family context</h4>
          {family.length === 0 ? (
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              No family history recorded yet.
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 14,
                color: "#374151",
              }}
            >
              {family.map((item, index) => (
                <li key={index}>
                  <strong>{item.relation}</strong>: {item.condition}
                  {item.age ? ` (age ${item.age})` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
