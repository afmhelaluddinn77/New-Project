import React from "react";
import type { SystemEnquiryEntry } from "../../store/encounterStore";
import { useEncounterStore } from "../../store/encounterStore";

const SYSTEMS: Array<{
  key: keyof typeof DEFAULT_SYSTEM_ENQUIRY;
  label: string;
  symptoms: Array<{ snomedCode: string; label: string }>;
}> = [
  {
    key: "general",
    label: "General",
    symptoms: [
      { snomedCode: "84229001", label: "Fatigue" },
      { snomedCode: "422587007", label: "Weight loss" },
      { snomedCode: "271807003", label: "Night sweats" },
    ],
  },
  {
    key: "cardiovascular",
    label: "Cardiovascular",
    symptoms: [
      { snomedCode: "29857009", label: "Chest pain" },
      { snomedCode: "60845006", label: "Palpitations" },
      { snomedCode: "267036007", label: "Shortness of breath" },
    ],
  },
  {
    key: "respiratory",
    label: "Respiratory",
    symptoms: [
      { snomedCode: "49727002", label: "Cough" },
      { snomedCode: "267036007", label: "Dyspnea" },
      { snomedCode: "56018004", label: "Wheeze" },
    ],
  },
  {
    key: "gastrointestinal",
    label: "Gastrointestinal",
    symptoms: [
      { snomedCode: "21522001", label: "Abdominal pain" },
      { snomedCode: "422400008", label: "Nausea" },
      { snomedCode: "42203002", label: "Vomiting" },
    ],
  },
  {
    key: "genitourinary",
    label: "Genitourinary",
    symptoms: [
      { snomedCode: "49650001", label: "Dysuria" },
      { snomedCode: "49727002", label: "Frequency" },
    ],
  },
  {
    key: "neurological",
    label: "Neurological",
    symptoms: [
      { snomedCode: "25064002", label: "Headache" },
      { snomedCode: "267064002", label: "Dizziness" },
    ],
  },
  {
    key: "psychiatric",
    label: "Psychiatric",
    symptoms: [
      { snomedCode: "35489007", label: "Low mood" },
      { snomedCode: "191997003", label: "Anxiety" },
    ],
  },
  {
    key: "musculoskeletal",
    label: "Musculoskeletal",
    symptoms: [
      { snomedCode: "57676002", label: "Joint pain" },
      { snomedCode: "279039007", label: "Back pain" },
    ],
  },
  {
    key: "skin",
    label: "Skin",
    symptoms: [
      { snomedCode: "271807003", label: "Rash" },
      { snomedCode: "271807003", label: "Itching" },
    ],
  },
  {
    key: "endocrine",
    label: "Endocrine",
    symptoms: [
      { snomedCode: "267064002", label: "Heat intolerance" },
      { snomedCode: "165816005", label: "Cold intolerance" },
    ],
  },
];

const DEFAULT_SYSTEM_ENQUIRY: Record<string, SystemEnquiryEntry> = {
  general: { normal: false, positiveSymptoms: [], summaryText: "" },
  cardiovascular: { normal: false, positiveSymptoms: [], summaryText: "" },
  respiratory: { normal: false, positiveSymptoms: [], summaryText: "" },
  gastrointestinal: { normal: false, positiveSymptoms: [], summaryText: "" },
  genitourinary: { normal: false, positiveSymptoms: [], summaryText: "" },
  neurological: { normal: false, positiveSymptoms: [], summaryText: "" },
  psychiatric: { normal: false, positiveSymptoms: [], summaryText: "" },
  musculoskeletal: { normal: false, positiveSymptoms: [], summaryText: "" },
  skin: { normal: false, positiveSymptoms: [], summaryText: "" },
  endocrine: { normal: false, positiveSymptoms: [], summaryText: "" },
};

export const WizardStep3OtherSystems: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const systemEnquiry = history.systemEnquiry || DEFAULT_SYSTEM_ENQUIRY;

  const setSystemEnquiry = (key: string, value: SystemEnquiryEntry) => {
    updateHistory("systemEnquiry", {
      ...systemEnquiry,
      [key]: value,
    });
  };

  const toggleNormal = (key: string) => {
    const current = systemEnquiry[key] || DEFAULT_SYSTEM_ENQUIRY[key];
    setSystemEnquiry(key, {
      ...current,
      normal: !current.normal,
      positiveSymptoms: !current.normal ? [] : current.positiveSymptoms,
    });
  };

  const toggleSymptom = (
    systemKey: string,
    snomedCode: string,
    label: string
  ) => {
    const current =
      systemEnquiry[systemKey] || DEFAULT_SYSTEM_ENQUIRY[systemKey];
    const exists = current.positiveSymptoms.find(
      (s) => s.snomedCode === snomedCode
    );

    let updatedSymptoms;
    if (exists) {
      updatedSymptoms = current.positiveSymptoms.filter(
        (s) => s.snomedCode !== snomedCode
      );
    } else {
      updatedSymptoms = [...current.positiveSymptoms, { snomedCode, label }];
    }

    setSystemEnquiry(systemKey, {
      ...current,
      normal: false,
      positiveSymptoms: updatedSymptoms,
    });
  };

  const updateSummary = (systemKey: string, summaryText: string) => {
    const current =
      systemEnquiry[systemKey] || DEFAULT_SYSTEM_ENQUIRY[systemKey];
    setSystemEnquiry(systemKey, {
      ...current,
      summaryText,
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 3: Other Systems Enquiry</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        System-wise review of other symptoms. Mark systems as normal or select
        key positive symptoms. This will be mapped to FHIR Observations (normal
        vs abnormal) per system.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
        }}
      >
        {SYSTEMS.map((system) => {
          const entry =
            systemEnquiry[system.key] || DEFAULT_SYSTEM_ENQUIRY[system.key];
          return (
            <div
              key={system.key}
              style={{
                borderRadius: 12,
                border: "1px solid var(--color-border-light)",
                padding: 12,
                background: "rgba(255,255,255,0.95)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <span style={{ fontWeight: 600 }}>{system.label}</span>
                <label
                  style={{
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={entry.normal}
                    onChange={() => toggleNormal(system.key)}
                  />
                  Normal
                </label>
              </div>

              <div style={{ marginBottom: 8, opacity: entry.normal ? 0.4 : 1 }}>
                <div style={{ fontSize: 12, marginBottom: 4 }}>
                  Common symptoms
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {system.symptoms.map((symptom) => {
                    const active = entry.positiveSymptoms.some(
                      (s) => s.snomedCode === symptom.snomedCode
                    );
                    return (
                      <button
                        key={symptom.snomedCode}
                        type="button"
                        disabled={entry.normal}
                        onClick={() =>
                          toggleSymptom(
                            system.key,
                            symptom.snomedCode,
                            symptom.label
                          )
                        }
                        style={{
                          padding: "4px 8px",
                          borderRadius: 9999,
                          border: active
                            ? "1px solid var(--color-provider)"
                            : "1px solid var(--color-border-light)",
                          background: active
                            ? "var(--color-provider-light)"
                            : "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          color: "#0F172A",
                        }}
                      >
                        {symptom.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <textarea
                  value={entry.summaryText ?? ""}
                  onChange={(e) => updateSummary(system.key, e.target.value)}
                  placeholder={
                    entry.normal
                      ? "System normal. You can leave this blank or add notes."
                      : "Describe additional symptoms or context."
                  }
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border-light)",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
