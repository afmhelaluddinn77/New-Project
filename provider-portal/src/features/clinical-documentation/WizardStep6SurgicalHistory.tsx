import React, { useState } from "react";
import { useEncounterStore } from "../../store/encounterStore";

const COMMON_SURGERIES: Array<{
  label: string;
  snomedCode?: string;
  defaultBodySite?: string;
}> = [
  {
    label: "Appendectomy",
    snomedCode: "80146002",
    defaultBodySite: "Appendix",
  },
  {
    label: "Cholecystectomy",
    snomedCode: "174041007",
    defaultBodySite: "Gallbladder",
  },
  {
    label: "Caesarean section",
    snomedCode: "72410000",
    defaultBodySite: "Uterus",
  },
  { label: "Coronary artery bypass graft", snomedCode: "232717009" },
  {
    label: "Total knee replacement",
    snomedCode: "33677008",
    defaultBodySite: "Knee",
  },
];

export const WizardStep6SurgicalHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const entries = history.surgicalHistory || [];

  const [procedure, setProcedure] = useState("");
  const [date, setDate] = useState("");
  const [bodySite, setBodySite] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");

  const addEntry = (entry: {
    procedure: string;
    snomedCode?: string;
    date?: string;
    bodySite?: string;
    outcome?: string;
    notes?: string;
  }) => {
    if (!entry.procedure.trim()) return;

    updateHistory("surgicalHistory", [...entries, entry]);
  };

  const handleQuickAdd = (item: {
    label: string;
    snomedCode?: string;
    defaultBodySite?: string;
  }) => {
    const exists = entries.some(
      (e) =>
        e.procedure === item.label || (e as any).snomedCode === item.snomedCode
    );
    if (exists) return;

    addEntry({
      procedure: item.label,
      snomedCode: item.snomedCode,
      bodySite: item.defaultBodySite,
    });
  };

  const handleAddCustom = () => {
    if (!procedure.trim()) return;

    addEntry({
      procedure: procedure.trim(),
      date: date || undefined,
      bodySite: bodySite || undefined,
      outcome: outcome || undefined,
      notes: notes || undefined,
    });

    setProcedure("");
    setDate("");
    setBodySite("");
    setOutcome("");
    setNotes("");
  };

  const handleRemove = (index: number) => {
    updateHistory(
      "surgicalHistory",
      entries.filter((_, i) => i !== index)
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 6: Surgical History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Record important past surgeries. These entries are mapped to FHIR
        Procedure resources linked to this encounter.
      </p>

      <div
        style={{
          marginBottom: 16,
          padding: 16,
          borderRadius: 12,
          border: "1px solid var(--color-border-light)",
          background: "rgba(255,255,255,0.95)",
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 13, marginBottom: 4, fontWeight: 500 }}>
            Common surgeries
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COMMON_SURGERIES.map((surgery) => (
              <button
                key={surgery.label}
                type="button"
                onClick={() => handleQuickAdd(surgery)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--color-border-light)",
                  background: "var(--color-provider-light)",
                  fontSize: 13,
                }}
              >
                {surgery.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          <input
            type="text"
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            placeholder="Procedure (e.g., Appendectomy)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Date"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={bodySite}
            onChange={(e) => setBodySite(e.target.value)}
            placeholder="Body site (e.g., Left knee)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value)}
            placeholder="Outcome (e.g., uncomplicated)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            onClick={handleAddCustom}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "var(--color-provider)",
              color: "white",
              fontWeight: 500,
            }}
          >
            Add surgery
          </button>
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
        <h4 style={{ marginBottom: 8 }}>Recorded surgical history</h4>
        {entries.length === 0 && (
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            No surgeries recorded yet.
          </p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {entries.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--color-border-light)",
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500 }}>{entry.procedure}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  {entry.date && <span>{entry.date} </span>}
                  {entry.bodySite && <span>- {entry.bodySite} </span>}
                  {entry.outcome && <span>- {entry.outcome} </span>}
                  {entry.notes && <span>- {entry.notes}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#DC2626",
                  fontSize: 13,
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
