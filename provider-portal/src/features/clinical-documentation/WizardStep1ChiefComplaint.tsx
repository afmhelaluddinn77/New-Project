import React, { useMemo, useState } from "react";
import type { ChiefComplaintSymptom } from "../../store/encounterStore";
import { useEncounterStore } from "../../store/encounterStore";

const SNOMED_SYMPTOMS: ChiefComplaintSymptom[] = [
  { id: "headache", snomedCode: "25064002", label: "Headache" },
  { id: "fever", snomedCode: "386661006", label: "Fever" },
  { id: "cough", snomedCode: "49727002", label: "Cough" },
  { id: "chest_pain", snomedCode: "29857009", label: "Chest pain" },
  { id: "abdominal_pain", snomedCode: "21522001", label: "Abdominal pain" },
  {
    id: "shortness_of_breath",
    snomedCode: "267036007",
    label: "Shortness of breath",
  },
];

export const WizardStep1ChiefComplaint: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const [query, setQuery] = useState("");

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SNOMED_SYMPTOMS;
    return SNOMED_SYMPTOMS.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        s.snomedCode?.toLowerCase().includes(q)
    );
  }, [query]);

  const handleAddSymptom = (symptom: ChiefComplaintSymptom) => {
    const exists = history.chiefComplaintSymptoms.some(
      (s) => s.snomedCode && s.snomedCode === symptom.snomedCode
    );
    if (exists) return;

    const updatedList = [...history.chiefComplaintSymptoms, symptom];
    updateHistory("chiefComplaintSymptoms", updatedList);

    const current = history.chiefComplaint.trim();
    const updatedText = current
      ? `${current}, ${symptom.label}`
      : symptom.label;
    updateHistory("chiefComplaint", updatedText);
  };

  const handleAddCustom = () => {
    const label = query.trim();
    if (!label) return;

    const customSymptom: ChiefComplaintSymptom = {
      id: `custom-${Date.now()}`,
      snomedCode: undefined,
      label,
    };

    const updatedList = [...history.chiefComplaintSymptoms, customSymptom];
    updateHistory("chiefComplaintSymptoms", updatedList);

    const current = history.chiefComplaint.trim();
    const updatedText = current ? `${current}, ${label}` : label;
    updateHistory("chiefComplaint", updatedText);

    setQuery("");
  };

  const handleRemove = (id: string) => {
    const updatedList = history.chiefComplaintSymptoms.filter(
      (s) => s.id !== id
    );
    updateHistory("chiefComplaintSymptoms", updatedList);
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 1: Chief Complaint</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Select or search SNOMED-coded symptoms. You can also add a custom
        description.
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 12,
          border: "1px solid var(--color-border-light)",
          background: "var(--color-provider-light)",
        }}
      >
        <label
          style={{
            display: "block",
            marginBottom: 8,
            fontWeight: 600,
            color: "#0F172A",
          }}
        >
          Symptom search (SNOMED)
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search (e.g., headache, fever)"
            style={{
              flex: 1,
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <button
            type="button"
            onClick={handleAddCustom}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "none",
              background: "var(--color-provider)",
              color: "white",
              fontWeight: 500,
            }}
          >
            Add
          </button>
        </div>

        <div
          style={{
            marginTop: 8,
            maxHeight: 160,
            overflowY: "auto",
            borderRadius: 8,
            border: "1px solid var(--color-border-light)",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleAddSymptom(option)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                border: "none",
                background: "transparent",
                borderBottom: "1px solid var(--color-border-light)",
              }}
            >
              <div style={{ fontWeight: 500 }}>{option.label}</div>
              {option.snomedCode && (
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  SNOMED: {option.snomedCode}
                </div>
              )}
            </button>
          ))}
          {filteredOptions.length === 0 && (
            <div style={{ padding: 8, fontSize: 12, color: "#6B7280" }}>
              No matches. You can add this as a custom symptom.
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: 8 }}>Selected symptoms</h4>
        {history.chiefComplaintSymptoms.length === 0 && (
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            No symptoms selected yet. Add at least one primary complaint to
            continue.
          </p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {history.chiefComplaintSymptoms.map((symptom) => (
            <div
              key={symptom.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 9999,
                background: "var(--color-provider-light)",
                border: "1px solid var(--color-border-light)",
              }}
            >
              <span style={{ fontSize: 14 }}>{symptom.label}</span>
              {symptom.snomedCode && (
                <span style={{ fontSize: 11, color: "#6B7280" }}>
                  ({symptom.snomedCode})
                </span>
              )}
              <button
                type="button"
                onClick={() => handleRemove(symptom.id)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#DC2626",
                  fontSize: 12,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
