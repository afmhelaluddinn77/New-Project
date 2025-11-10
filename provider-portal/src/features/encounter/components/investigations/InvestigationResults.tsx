import React, { useState } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/investigations.module.css';

export const InvestigationResults: React.FC = () => {
  const { investigations, updateInvestigations } = useEncounterStore();
  const results = investigations.results;

  const [newResult, setNewResult] = useState({
    testName: '',
    value: '',
    unit: '',
    referenceRange: '',
    status: 'pending' as 'pending' | 'completed' | 'abnormal',
  });

  const handleAddResult = () => {
    if (newResult.testName.trim() && newResult.value.trim()) {
      updateInvestigations('results', [
        ...results,
        newResult,
      ]);
      setNewResult({
        testName: '',
        value: '',
        unit: '',
        referenceRange: '',
        status: 'pending',
      });
    }
  };

  const handleRemoveResult = (index: number) => {
    updateInvestigations('results', results.filter((_, i) => i !== index));
  };

  const handleUpdateResult = (index: number, field: string, value: any) => {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    updateInvestigations('results', updated);
  };

  return (
    <div className={styles.section}>
      <h3>Investigation Results</h3>

      <div className={styles.formGrid}>
        <input
          type="text"
          value={newResult.testName}
          onChange={(e) => setNewResult({ ...newResult, testName: e.target.value })}
          placeholder="Test name"
          className={styles.input}
        />
        <input
          type="text"
          value={newResult.value}
          onChange={(e) => setNewResult({ ...newResult, value: e.target.value })}
          placeholder="Result value"
          className={styles.input}
        />
        <input
          type="text"
          value={newResult.unit}
          onChange={(e) => setNewResult({ ...newResult, unit: e.target.value })}
          placeholder="Unit (e.g., mg/dL)"
          className={styles.input}
        />
        <input
          type="text"
          value={newResult.referenceRange}
          onChange={(e) => setNewResult({ ...newResult, referenceRange: e.target.value })}
          placeholder="Reference range"
          className={styles.input}
        />
        <select
          value={newResult.status}
          onChange={(e) => setNewResult({ ...newResult, status: e.target.value as any })}
          className={styles.select}
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="abnormal">Abnormal</option>
        </select>
        <button
          onClick={handleAddResult}
          className={styles.addButton}
          type="button"
        >
          Add Result
        </button>
      </div>

      <div className={styles.resultsList}>
        {results.length === 0 ? (
          <p className={styles.emptyMessage}>No results entered</p>
        ) : (
          results.map((result, index) => (
            <div key={index} className={styles.resultItem}>
              <div className={styles.resultContent}>
                <strong>{result.testName}</strong>
                <div className={styles.resultMeta}>
                  <span className={styles.value}>
                    {result.value} {result.unit}
                  </span>
                  {result.referenceRange && (
                    <span className={styles.reference}>
                      Ref: {result.referenceRange}
                    </span>
                  )}
                  <span className={`${styles.status} ${styles[result.status]}`}>
                    {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className={styles.resultActions}>
                <select
                  value={result.status}
                  onChange={(e) =>
                    handleUpdateResult(index, 'status', e.target.value)
                  }
                  className={styles.statusSelect}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="abnormal">Abnormal</option>
                </select>
                <button
                  onClick={() => handleRemoveResult(index)}
                  className={styles.removeButton}
                  type="button"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
