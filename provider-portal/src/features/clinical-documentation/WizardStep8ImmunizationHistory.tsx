import React, { useState } from "react";
import { useEncounterStore } from "../../store/encounterStore";

const COMMON_VACCINES: Array<{
  label: string;
  cvxCode?: string;
}> = [
  { label: "DTaP", cvxCode: "20" },
  { label: "MMR", cvxCode: "03" },
  { label: "Polio (IPV)", cvxCode: "10" },
  { label: "Hepatitis B", cvxCode: "08" },
  { label: "Influenza", cvxCode: "88" },
  { label: "COVID-19", cvxCode: "207" },
  { label: "Pneumococcal", cvxCode: "33" },
  { label: "Tdap", cvxCode: "115" },
];

export const WizardStep8ImmunizationHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const entries = history.immunizationHistory || [];

  const [vaccineName, setVaccineName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<
    "completed" | "partial" | "due" | "declined"
  >("completed");
  const [notes, setNotes] = useState("");

  const addEntry = (entry: {
    vaccineName: string;
    cvxCode?: string;
    date?: string;
    status: "completed" | "partial" | "due" | "declined";
    lotNumber?: string;
    manufacturer?: string;
    site?: string;
    route?: string;
    notes?: string;
  }) => {
    if (!entry.vaccineName.trim()) return;

    updateHistory("immunizationHistory", [...entries, entry]);
  };

  const handleQuickAdd = (item: { label: string; cvxCode?: string }) => {
    const exists = entries.some(
      (e) => e.vaccineName === item.label || (e as any).cvxCode === item.cvxCode
    );
    if (exists) return;

    addEntry({
      vaccineName: item.label,
      cvxCode: item.cvxCode,
      status: "completed",
    });
  };

  const handleAddCustom = () => {
    if (!vaccineName.trim()) return;

    addEntry({
      vaccineName: vaccineName.trim(),
      date: date || undefined,
      status,
      notes: notes || undefined,
    });

    setVaccineName("");
    setDate("");
    setStatus("completed");
    setNotes("");
  };

  const handleRemove = (index: number) => {
    updateHistory(
      "immunizationHistory",
      entries.filter((_, i) => i !== index)
    );
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 8: Immunization History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Capture key vaccines given or due. Completed entries are mapped to FHIR
        Immunization resources.
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
            Common vaccines
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COMMON_VACCINES.map((vaccine) => (
              <button
                key={vaccine.label}
                type="button"
                onClick={() => handleQuickAdd(vaccine)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--color-border-light)",
                  background: "var(--color-provider-light)",
                  fontSize: 13,
                }}
              >
                {vaccine.label}
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
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            placeholder="Vaccine name"
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
          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as "completed" | "partial" | "due" | "declined"
              )
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          >
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="due">Due</option>
            <option value="declined">Declined</option>
          </select>
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
            Add vaccine
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
        <h4 style={{ marginBottom: 8 }}>Recorded immunizations</h4>
        {entries.length === 0 && (
          <p style={{ fontSize: 14, color: "#6B7280" }}>
            No immunizations recorded yet.
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
                <div style={{ fontWeight: 500 }}>{entry.vaccineName}</div>
                <div style={{ fontSize: 12, color: "#6B7280" }}>
                  {entry.date && <span>{entry.date} </span>}
                  <span>- {entry.status}</span>
                  {entry.notes && <span> - {entry.notes}</span>}
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
