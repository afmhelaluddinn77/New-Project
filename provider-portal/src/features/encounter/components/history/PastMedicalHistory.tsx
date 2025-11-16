import React, { useState } from "react";
import { useEncounterStore } from "../../../../store/encounterStore";
import styles from "../../styles/history.module.css";

export const PastMedicalHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const pmh = history.pastMedicalHistory;

  const [newCondition, setNewCondition] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear().toString());
  const [newStatus, setNewStatus] = useState<
    "active" | "resolved" | "remission"
  >("active");
  const [newNotes, setNewNotes] = useState("");

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      updateHistory("pastMedicalHistory", [
        ...pmh,
        {
          condition: newCondition,
          yearDiagnosed: newYear,
          status: newStatus,
          notes: newNotes,
        },
      ]);
      setNewCondition("");
      setNewYear(new Date().getFullYear().toString());
      setNewStatus("active");
      setNewNotes("");
    }
  };

  const handleRemoveCondition = (index: number) => {
    updateHistory(
      "pastMedicalHistory",
      pmh.filter((_, i) => i !== index)
    );
  };

  const handleUpdateCondition = (index: number, field: string, value: any) => {
    const updated = [...pmh];
    updated[index] = { ...updated[index], [field]: value };
    updateHistory("pastMedicalHistory", updated);
  };

  return (
    <div className={styles.section}>
      <h3>Past Medical History</h3>

      <div className={styles.addItemContainer}>
        <input
          type="text"
          value={newCondition}
          onChange={(e) => setNewCondition(e.target.value)}
          placeholder="Enter condition (e.g., Hypertension, Diabetes)"
          className={styles.input}
        />
        <input
          type="number"
          value={newYear}
          onChange={(e) => setNewYear(e.target.value)}
          placeholder="Year"
          className={styles.input}
          style={{ width: "100px" }}
        />
        <select
          value={newStatus}
          onChange={(e) =>
            setNewStatus(e.target.value as "active" | "resolved" | "remission")
          }
          className={styles.select}
        >
          <option value="active">Active</option>
          <option value="resolved">Resolved</option>
          <option value="remission">Remission</option>
        </select>
        <input
          type="text"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
          placeholder="Notes (optional)"
          className={styles.input}
        />
        <button
          onClick={handleAddCondition}
          className={styles.addButton}
          type="button"
        >
          Add
        </button>
      </div>

      <div className={styles.itemsList}>
        {pmh.length === 0 ? (
          <p className={styles.emptyMessage}>No past medical history added</p>
        ) : (
          pmh.map((item, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.itemContent}>
                <strong>{item.condition}</strong>
                <span className={styles.itemMeta}>
                  {item.yearDiagnosed} • {item.status}
                  {item.notes ? ` • ${item.notes}` : ""}
                </span>
              </div>
              <button
                onClick={() => handleRemoveCondition(index)}
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
