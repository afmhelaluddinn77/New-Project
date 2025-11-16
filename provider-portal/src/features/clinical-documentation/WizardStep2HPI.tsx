import React, { useState } from "react";
import type { SymptomFeature } from "../../store/encounterStore";
import { useEncounterStore } from "../../store/encounterStore";

export const WizardStep2HPI: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const symptoms = history.chiefComplaintSymptoms;
  const hpi = history.historyOfPresentIllness;
  const features = hpi.symptomFeatures || {};

  const [activeSymptomId, setActiveSymptomId] = useState<string | null>(
    symptoms[0]?.id ?? null
  );

  if (symptoms.length === 0) {
    return (
      <div>
        <h3 style={{ marginBottom: 8 }}>Step 2: Symptom Features</h3>
        <p style={{ color: "#64748B" }}>
          No symptoms selected yet. Please add one or more chief complaints in
          Step 1.
        </p>
      </div>
    );
  }

  const currentId = activeSymptomId ?? symptoms[0].id;
  const currentSymptom =
    symptoms.find((s) => s.id === currentId) ?? symptoms[0];
  const currentFeature: SymptomFeature = features[currentSymptom.id] || {};

  const updateFeature = (changes: Partial<SymptomFeature>) => {
    const updatedFeatures: Record<string, SymptomFeature> = {
      ...features,
      [currentSymptom.id]: {
        ...(features[currentSymptom.id] || {}),
        ...changes,
      },
    };

    updateHistory("historyOfPresentIllness", {
      ...hpi,
      symptomFeatures: updatedFeatures,
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 2: Symptom Features</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Capture structured features for each selected symptom (duration,
        severity, character, aggravating/relieving factors).
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {symptoms.map((s) => {
          const active = s.id === currentSymptom.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSymptomId(s.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                border: active
                  ? "1px solid var(--color-provider)"
                  : "1px solid var(--color-border-light)",
                background: active
                  ? "var(--color-provider-light)"
                  : "rgba(255,255,255,0.9)",
                color: "#0F172A",
                fontSize: 14,
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          border: "1px solid var(--color-border-light)",
          borderRadius: 12,
          padding: 16,
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <h4 style={{ marginBottom: 8 }}>
          Features for:{" "}
          <span style={{ color: "var(--color-provider)" }}>
            {currentSymptom.label}
          </span>
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {/* Duration */}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Duration
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="number"
                min={0}
                value={currentFeature.durationValue ?? ""}
                onChange={(e) =>
                  updateFeature({
                    durationValue: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="e.g. 3"
                style={{
                  flex: 1,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              />
              <select
                value={currentFeature.durationUnit ?? "days"}
                onChange={(e) =>
                  updateFeature({
                    durationUnit: e.target
                      .value as SymptomFeature["durationUnit"],
                  })
                }
                style={{
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-light)",
                }}
              >
                <option value="hours">hours</option>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
              </select>
            </div>
          </div>

          {/* Severity */}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Severity
            </label>
            <select
              value={currentFeature.severity ?? "moderate"}
              onChange={(e) =>
                updateFeature({
                  severity: e.target.value as SymptomFeature["severity"],
                })
              }
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
              }}
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          {/* Character */}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Character
            </label>
            <input
              type="text"
              value={(currentFeature.character || []).join(", ")}
              onChange={(e) =>
                updateFeature({
                  character: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. throbbing, sharp"
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
              }}
            />
          </div>

          {/* Aggravating factors */}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Aggravating factors
            </label>
            <input
              type="text"
              value={(currentFeature.aggravatingFactors || []).join(", ")}
              onChange={(e) =>
                updateFeature({
                  aggravatingFactors: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. exertion, lying flat"
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
              }}
            />
          </div>

          {/* Relieving factors */}
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
              Relieving factors
            </label>
            <input
              type="text"
              value={(currentFeature.relievingFactors || []).join(", ")}
              onChange={(e) =>
                updateFeature({
                  relievingFactors: e.target.value
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean),
                })
              }
              placeholder="e.g. rest, medications"
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
              }}
            />
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", fontSize: 13, marginBottom: 4 }}>
            Notes
          </label>
          <textarea
            value={currentFeature.notes ?? ""}
            onChange={(e) => updateFeature({ notes: e.target.value })}
            rows={3}
            placeholder="Additional details (e.g. associated symptoms, progression)"
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
              resize: "vertical",
            }}
          />
        </div>
      </div>
    </div>
  );
};
