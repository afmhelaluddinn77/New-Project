import React, { useState } from "react";
import { useEncounterStore } from "../../../../store/encounterStore";
import styles from "../../styles/history.module.css";

export const ImmunizationHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const immunizations = history.immunizationHistory || [];

  const [newEntry, setNewEntry] = useState({
    vaccineName: "",
    date: "",
    status: "completed" as "completed" | "partial" | "due" | "declined",
    notes: "",
  });

  const handleAdd = () => {
    if (!newEntry.vaccineName.trim()) return;

    updateHistory("immunizationHistory", [
      ...immunizations,
      {
        vaccineName: newEntry.vaccineName.trim(),
        date: newEntry.date || undefined,
        status: newEntry.status,
        notes: newEntry.notes || undefined,
      },
    ]);

    setNewEntry({ vaccineName: "", date: "", status: "completed", notes: "" });
  };

  const handleRemove = (index: number) => {
    updateHistory(
      "immunizationHistory",
      immunizations.filter((_, i) => i !== index)
    );
  };

  return (
    <div className={styles.section}>
      <h3>Immunization History</h3>

      <div className={styles.addItemContainer}>
        <input
          type="text"
          value={newEntry.vaccineName}
          onChange={(e) =>
            setNewEntry({ ...newEntry, vaccineName: e.target.value })
          }
          placeholder="Vaccine name"
          className={styles.input}
        />
        <input
          type="date"
          value={newEntry.date}
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
          className={styles.input}
        />
        <select
          value={newEntry.status}
          onChange={(e) =>
            setNewEntry({
              ...newEntry,
              status: e.target.value as
                | "completed"
                | "partial"
                | "due"
                | "declined",
            })
          }
          className={styles.select}
        >
          <option value="completed">Completed</option>
          <option value="partial">Partial</option>
          <option value="due">Due</option>
          <option value="declined">Declined</option>
        </select>
        <input
          type="text"
          value={newEntry.notes}
          onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          placeholder="Notes (optional)"
          className={styles.input}
        />
        <button onClick={handleAdd} className={styles.addButton} type="button">
          Add Immunization
        </button>
      </div>

      <div className={styles.itemsList}>
        {immunizations.length === 0 ? (
          <p className={styles.emptyMessage}>No immunizations recorded</p>
        ) : (
          immunizations.map((item, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.itemContent}>
                <strong>{item.vaccineName}</strong>
                <div className={styles.itemMeta}>
                  {item.date && <span>{item.date}</span>}
                  <span> • {item.status}</span>
                  {item.notes && <span> • {item.notes}</span>}
                </div>
              </div>
              <button
                onClick={() => handleRemove(index)}
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
