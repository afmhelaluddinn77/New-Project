import React, { useState } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/history.module.css';

const RELATIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Grandfather', 'Grandmother'];
const COMMON_CONDITIONS = ['Hypertension', 'Diabetes', 'Heart Disease', 'Stroke', 'Cancer', 'Asthma', 'Arthritis', 'Thyroid Disease'];

export const FamilyHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const fh = history.familyHistory;
  
  const [newFamily, setNewFamily] = useState({
    relation: '',
    condition: '',
    age: '',
  });

  const handleAddFamily = () => {
    if (newFamily.relation && newFamily.condition) {
      updateHistory('familyHistory', [
        ...fh,
        newFamily,
      ]);
      setNewFamily({ relation: '', condition: '', age: '' });
    }
  };

  const handleRemoveFamily = (index: number) => {
    updateHistory('familyHistory', fh.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.section}>
      <h3>Family History</h3>

      <div className={styles.formGrid}>
        <select
          value={newFamily.relation}
          onChange={(e) => setNewFamily({ ...newFamily, relation: e.target.value })}
          className={styles.select}
        >
          <option value="">Select Relation</option>
          {RELATIONS.map((rel) => (
            <option key={rel} value={rel}>
              {rel}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={newFamily.condition}
          onChange={(e) => setNewFamily({ ...newFamily, condition: e.target.value })}
          placeholder="Condition (e.g., Diabetes)"
          className={styles.input}
          list="conditions-list"
        />
        <datalist id="conditions-list">
          {COMMON_CONDITIONS.map((cond) => (
            <option key={cond} value={cond} />
          ))}
        </datalist>

        <input
          type="number"
          value={newFamily.age}
          onChange={(e) => setNewFamily({ ...newFamily, age: e.target.value })}
          placeholder="Age at diagnosis (optional)"
          className={styles.input}
        />
      </div>

      <button
        onClick={handleAddFamily}
        className={styles.addButton}
        type="button"
      >
        Add Family Member
      </button>

      <div className={styles.itemsList}>
        {fh.length === 0 ? (
          <p className={styles.emptyMessage}>No family history added</p>
        ) : (
          fh.map((item, index) => (
            <div key={index} className={styles.listItem}>
              <div className={styles.itemContent}>
                <strong>{item.relation}</strong>
                <div className={styles.itemMeta}>
                  <span>{item.condition}</span>
                  {item.age && <span>Age: {item.age}</span>}
                </div>
              </div>
              <button
                onClick={() => handleRemoveFamily(index)}
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
