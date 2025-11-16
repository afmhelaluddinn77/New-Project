import React, { useState } from "react";
import { useEncounterStore } from "../../store/encounterStore";

const COMMON_MEDICATIONS: Array<{
  label: string;
  rxNormCode?: string;
  defaultRoute?: string;
}> = [
  { label: "Metformin", rxNormCode: "860975", defaultRoute: "oral" },
  { label: "Amlodipine", rxNormCode: "197361", defaultRoute: "oral" },
  { label: "Atorvastatin", rxNormCode: "83367", defaultRoute: "oral" },
  { label: "Omeprazole", rxNormCode: "9679", defaultRoute: "oral" },
];

export const WizardStep5DrugHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const entries = history.medicationHistory || [];

  const [newMed, setNewMed] = useState<{
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string;
    indication: string;
    startDate: string;
    endDate: string;
    status: "current" | "stopped";
    notes: string;
  }>({
    medicationName: "",
    dosage: "",
    frequency: "",
    route: "",
    indication: "",
    startDate: "",
    endDate: "",
    status: "current",
    notes: "",
  });

  const addEntry = (entry: {
    medicationName: string;
    rxNormCode?: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    indication?: string;
    startDate?: string;
    endDate?: string;
    status: "current" | "stopped";
    notes?: string;
  }) => {
    if (!entry.medicationName.trim()) return;

    updateHistory("medicationHistory", [...entries, entry]);
  };

  const handleQuickAdd = (item: {
    label: string;
    rxNormCode?: string;
    defaultRoute?: string;
  }) => {
    const exists = entries.some(
      (m) =>
        m.medicationName === item.label ||
        (m as any).rxNormCode === item.rxNormCode
    );
    if (exists) return;

    addEntry({
      medicationName: item.label,
      rxNormCode: item.rxNormCode,
      route: item.defaultRoute,
      status: "current",
    });
  };

  const handleAddCustom = () => {
    if (!newMed.medicationName.trim() || !newMed.dosage.trim()) return;

    addEntry({
      medicationName: newMed.medicationName.trim(),
      dosage: newMed.dosage || undefined,
      frequency: newMed.frequency || undefined,
      route: newMed.route || undefined,
      indication: newMed.indication || undefined,
      startDate: newMed.startDate || undefined,
      endDate: newMed.endDate || undefined,
      status: newMed.status,
      notes: newMed.notes || undefined,
    });

    setNewMed({
      medicationName: "",
      dosage: "",
      frequency: "",
      route: "",
      indication: "",
      startDate: "",
      endDate: "",
      status: "current",
      notes: "",
    });
  };

  const handleRemove = (index: number) => {
    updateHistory(
      "medicationHistory",
      entries.filter((_, i) => i !== index)
    );
  };

  const currentMeds = entries.filter((m) => (m as any).status !== "stopped");
  const stoppedMeds = entries.filter((m) => (m as any).status === "stopped");

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Step 5: Drug History</h3>
      <p style={{ marginBottom: 16, color: "#64748B" }}>
        Record chronic medications, including current and stopped drugs. These
        entries are mapped to FHIR MedicationStatement resources.
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
            Common medications
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {COMMON_MEDICATIONS.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => handleQuickAdd(m)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 9999,
                  border: "1px solid var(--color-border-light)",
                  background: "var(--color-provider-light)",
                  fontSize: 13,
                }}
              >
                {m.label}
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
            value={newMed.medicationName}
            onChange={(e) =>
              setNewMed({ ...newMed, medicationName: e.target.value })
            }
            placeholder="Medication name"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={newMed.dosage}
            onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
            placeholder="Dosage (e.g., 500mg)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={newMed.frequency}
            onChange={(e) =>
              setNewMed({ ...newMed, frequency: e.target.value })
            }
            placeholder="Frequency (e.g., once daily)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={newMed.route}
            onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
            placeholder="Route (e.g., oral)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="text"
            value={newMed.indication}
            onChange={(e) =>
              setNewMed({ ...newMed, indication: e.target.value })
            }
            placeholder="Indication"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="date"
            value={newMed.startDate}
            onChange={(e) =>
              setNewMed({ ...newMed, startDate: e.target.value })
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <input
            type="date"
            value={newMed.endDate}
            onChange={(e) => setNewMed({ ...newMed, endDate: e.target.value })}
            placeholder="End date (if stopped)"
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          />
          <select
            value={newMed.status}
            onChange={(e) =>
              setNewMed({
                ...newMed,
                status: e.target.value as "current" | "stopped",
              })
            }
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid var(--color-border-light)",
            }}
          >
            <option value="current">Current</option>
            <option value="stopped">Stopped</option>
          </select>
          <input
            type="text"
            value={newMed.notes}
            onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
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
            Add medication
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
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
          <h4 style={{ marginBottom: 8 }}>Current medications</h4>
          {currentMeds.length === 0 && (
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              No current medications recorded.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentMeds.map((m, index) => (
              <div
                key={`current-${index}`}
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
                  <div style={{ fontWeight: 500 }}>{m.medicationName}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {m.dosage && <span>{m.dosage} </span>}
                    {m.frequency && <span>{m.frequency} </span>}
                    {m.route && <span>({m.route}) </span>}
                    {(m as any).notes && <span> b7 {(m as any).notes}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(entries.indexOf(m))}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#DC2626",
                    fontSize: 13,
                  }}
                >
                   d7
                </button>
              </div>
            ))}
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
          <h4 style={{ marginBottom: 8 }}>Stopped medications</h4>
          {stoppedMeds.length === 0 && (
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              No stopped medications recorded.
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stoppedMeds.map((m, index) => (
              <div
                key={`stopped-${index}`}
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
                  <div style={{ fontWeight: 500 }}>{m.medicationName}</div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    {m.dosage && <span>{m.dosage} </span>}
                    {m.frequency && <span>{m.frequency} </span>}
                    {m.route && <span>({m.route}) </span>}
                    {(m as any).notes && <span> b7 {(m as any).notes}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(entries.indexOf(m))}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#DC2626",
                    fontSize: 13,
                  }}
                >
                   d7
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
