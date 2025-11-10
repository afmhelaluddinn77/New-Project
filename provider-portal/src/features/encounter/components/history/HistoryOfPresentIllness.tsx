import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/history.module.css';

export const HistoryOfPresentIllness: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const hpi = history.historyOfPresentIllness;

  const handleChange = (field: keyof typeof hpi, value: any) => {
    updateHistory('historyOfPresentIllness', {
      ...hpi,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>History of Present Illness (OPQRST)</h3>
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Onset</label>
          <input
            type="text"
            value={hpi.onset}
            onChange={(e) => handleChange('onset', e.target.value)}
            placeholder="When did it start? (e.g., 3 days ago)"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Provocation/Palliation</label>
          <input
            type="text"
            value={hpi.character}
            onChange={(e) => handleChange('character', e.target.value)}
            placeholder="What makes it better/worse?"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Quality</label>
          <input
            type="text"
            value={hpi.quality}
            onChange={(e) => handleChange('quality', e.target.value)}
            placeholder="How would you describe it? (e.g., sharp, dull, throbbing)"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Radiation</label>
          <input
            type="text"
            value={hpi.radiation}
            onChange={(e) => handleChange('radiation', e.target.value)}
            placeholder="Does it spread anywhere?"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Severity (1-10)</label>
          <div className={styles.severityContainer}>
            <input
              type="range"
              min="1"
              max="10"
              value={hpi.severity}
              onChange={(e) => handleChange('severity', parseInt(e.target.value))}
              className={styles.slider}
            />
            <span className={styles.severityValue}>{hpi.severity}</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Timing</label>
          <input
            type="text"
            value={hpi.timing}
            onChange={(e) => handleChange('timing', e.target.value)}
            placeholder="When does it occur? (e.g., constant, intermittent)"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Context</label>
          <input
            type="text"
            value={hpi.context}
            onChange={(e) => handleChange('context', e.target.value)}
            placeholder="What were you doing when it started?"
            className={styles.input}
          />
        </div>
      </div>
    </div>
  );
};
