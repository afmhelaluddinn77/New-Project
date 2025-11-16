import React, { useState } from "react";
import { useEncounterStore } from "../../../../store/encounterStore";
import styles from "../../styles/history.module.css";

export const MedicationHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const medHistory = history.medicationHistory;

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

  const handleAddMedication = () => {
    if (newMed.medicationName.trim() && newMed.dosage.trim()) {
      updateHistory("medicationHistory", [...medHistory, newMed]);
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
    }
  };

  const handleRemoveMedication = (index: number) => {
    updateHistory(
      "medicationHistory",
      medHistory.filter((_, i) => i !== index)
    );
  };

  const handleUpdateMedication = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...medHistory];
    updated[index] = { ...updated[index], [field]: value };
    updateHistory("medicationHistory", updated);
  };

  return (
    <div className={styles.section}>
      <h3>Medication History</h3>

      <div className={styles.formGrid}>
        <input
          type="text"
          value={newMed.medicationName}
          onChange={(e) =>
            setNewMed({ ...newMed, medicationName: e.target.value })
          }
          placeholder="Medication name"
          className={styles.input}
        />
        <input
          type="text"
          value={newMed.dosage}
          onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
          placeholder="Dosage (e.g., 500mg)"
          className={styles.input}
        />
        <input
          type="text"
          value={newMed.frequency}
          onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
          placeholder="Frequency (e.g., 3 times daily)"
          className={styles.input}
        />
        <input
          type="text"
          value={newMed.route}
          onChange={(e) => setNewMed({ ...newMed, route: e.target.value })}
          placeholder="Route (e.g., oral)"
          className={styles.input}
        />
        <input
          type="text"
          value={newMed.indication}
          onChange={(e) => setNewMed({ ...newMed, indication: e.target.value })}
          placeholder="Indication"
          className={styles.input}
        />
        <input
          type="date"
          value={newMed.startDate}
          onChange={(e) => setNewMed({ ...newMed, startDate: e.target.value })}
          className={styles.input}
        />
        <input
          type="date"
          value={newMed.endDate}
          onChange={(e) => setNewMed({ ...newMed, endDate: e.target.value })}
          placeholder="End date (if discontinued)"
          className={styles.input}
        />
        <select
          value={newMed.status}
          onChange={(e) =>
            setNewMed({
              ...newMed,
              status: e.target.value as "current" | "stopped",
            })
          }
          className={styles.select}
        >
          <option value="current">Current</option>
          <option value="stopped">Stopped</option>
        </select>
      </div>

      <input
        type="text"
        value={newMed.notes}
        onChange={(e) => setNewMed({ ...newMed, notes: e.target.value })}
        placeholder="Notes (optional)"
        className={styles.input}
        style={{ marginTop: 8 }}
      />

      <button
        onClick={handleAddMedication}
        className={styles.addButton}
        type="button"
      >
        Add Medication
      </button>

      <div className={styles.itemsList}>
        {medHistory.length === 0 ? (
          <p className={styles.emptyMessage}>No medication history added</p>
        ) : (
          medHistory.map((med, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.itemContent}>
                <strong>{med.medicationName}</strong>
                <div className={styles.itemMeta}>
                  <span>{med.dosage}</span>
                  <span>{med.frequency}</span>
                  {med.indication && <span>For: {med.indication}</span>}
                  {med.route && <span>Route: {med.route}</span>}
                  {(med as any).status && (
                    <span>Status: {(med as any).status}</span>
                  )}
                  {(med as any).notes && <span>{(med as any).notes}</span>}
                </div>
              </div>
              <button
                onClick={() => handleRemoveMedication(index)}
                className={styles.removeButton}
                type="button"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
