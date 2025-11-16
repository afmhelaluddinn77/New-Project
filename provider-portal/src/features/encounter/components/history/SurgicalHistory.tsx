import React, { useState } from "react";
import { useEncounterStore } from "../../../../store/encounterStore";
import styles from "../../styles/history.module.css";

export const SurgicalHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const surgical = history.surgicalHistory || [];

  const [newEntry, setNewEntry] = useState({
    procedure: "",
    date: "",
    bodySite: "",
    outcome: "",
    notes: "",
  });

  const handleAdd = () => {
    if (!newEntry.procedure.trim()) return;

    updateHistory("surgicalHistory", [
      ...surgical,
      {
        procedure: newEntry.procedure.trim(),
        date: newEntry.date || undefined,
        bodySite: newEntry.bodySite || undefined,
        outcome: newEntry.outcome || undefined,
        notes: newEntry.notes || undefined,
      },
    ]);

    setNewEntry({
      procedure: "",
      date: "",
      bodySite: "",
      outcome: "",
      notes: "",
    });
  };

  const handleRemove = (index: number) => {
    updateHistory(
      "surgicalHistory",
      surgical.filter((_, i) => i !== index)
    );
  };

  return (
    <div className={styles.section}>
      <h3>Surgical History</h3>

      <div className={styles.addItemContainer}>
        <input
          type="text"
          value={newEntry.procedure}
          onChange={(e) =>
            setNewEntry({ ...newEntry, procedure: e.target.value })
          }
          placeholder="Procedure (e.g., Appendectomy)"
          className={styles.input}
        />
        <input
          type="date"
          value={newEntry.date}
          onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
          className={styles.input}
        />
        <input
          type="text"
          value={newEntry.bodySite}
          onChange={(e) =>
            setNewEntry({ ...newEntry, bodySite: e.target.value })
          }
          placeholder="Body site (optional)"
          className={styles.input}
        />
        <input
          type="text"
          value={newEntry.outcome}
          onChange={(e) =>
            setNewEntry({ ...newEntry, outcome: e.target.value })
          }
          placeholder="Outcome (optional)"
          className={styles.input}
        />
        <input
          type="text"
          value={newEntry.notes}
          onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          placeholder="Notes (optional)"
          className={styles.input}
        />
        <button onClick={handleAdd} className={styles.addButton} type="button">
          Add Surgery
        </button>
      </div>

      <div className={styles.itemsList}>
        {surgical.length === 0 ? (
          <p className={styles.emptyMessage}>No surgical history added</p>
        ) : (
          surgical.map((item, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.itemContent}>
                <strong>{item.procedure}</strong>
                <div className={styles.itemMeta}>
                  {item.date && <span>{item.date}</span>}
                  {item.bodySite && <span> • {item.bodySite}</span>}
                  {item.outcome && <span> • {item.outcome}</span>}
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
