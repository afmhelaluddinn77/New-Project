import React from "react";
import { useEncounterStore } from "../../store/encounterStore";

export const WizardStep15AdviceFollowUp: React.FC = () => {
  const {
    assessment,
    plan,
    setAssessment,
    setPlan,
    history,
    investigations,
    medications,
  } = useEncounterStore();

  const hasInvestigations =
    investigations.investigations.length > 0 ||
    investigations.results.length > 0;
  const hasMedications = medications.prescriptions.length > 0;

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 15: Advice, Follow-up & Summary</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Record your overall impression, patient advice, and follow-up plan. This
        information is shared with the SOAP note and will be included in
        downstream FHIR exports.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
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
          <h4 style={{ marginBottom: 8 }}>Assessment</h4>
          <textarea
            value={assessment}
            onChange={(e) => setAssessment(e.target.value)}
            placeholder="Clinical assessment / diagnosis summary"
            rows={4}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
              fontSize: 14,
            }}
          />

          <h4 style={{ marginTop: 16, marginBottom: 8 }}>
            Advice & Follow-up Plan
          </h4>
          <textarea
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            placeholder="Advice given, follow-up interval, safety-netting, referrals"
            rows={5}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
              fontSize: 14,
            }}
          />
        </div>

        <div
          style={{
            borderRadius: 12,
            border: "1px solid var(--color-border-light)",
            padding: 16,
            background: "rgba(255,255,255,0.95)",
            fontSize: 14,
            color: "#374151",
          }}
        >
          <h4 style={{ marginBottom: 8 }}>Encounter Summary</h4>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <strong>Chief complaint:</strong>{" "}
              {history.chiefComplaint || "Not recorded"}
            </li>
            <li>
              <strong>Symptoms selected:</strong>{" "}
              {history.chiefComplaintSymptoms.length}
            </li>
            <li>
              <strong>Past conditions:</strong>{" "}
              {history.pastMedicalHistory.length}
            </li>
            <li>
              <strong>Medications in history:</strong>{" "}
              {history.medicationHistory.length}
            </li>
            <li>
              <strong>Surgical history entries:</strong>{" "}
              {history.surgicalHistory.length}
            </li>
            <li>
              <strong>Immunizations recorded:</strong>{" "}
              {history.immunizationHistory.length}
            </li>
          </ul>

          <div style={{ marginTop: 12 }}>
            <strong>Orders & prescriptions</strong>
            <ul style={{ margin: 4, paddingLeft: 20 }}>
              <li>
                Investigations present: {hasInvestigations ? "Yes" : "No"}
              </li>
              <li>Active prescriptions: {hasMedications ? "Yes" : "No"}</li>
            </ul>
          </div>

          <p style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>
            Digital signature and encounter locking will be added in a later
            phase, building on this summary.
          </p>
        </div>
      </div>
    </div>
  );
};
