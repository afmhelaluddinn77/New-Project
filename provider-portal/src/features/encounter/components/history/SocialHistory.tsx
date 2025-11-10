import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/history.module.css';

export const SocialHistory: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const sh = history.socialHistory;

  const handleChange = (field: keyof typeof sh, value: string) => {
    updateHistory('socialHistory', {
      ...sh,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Social History</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Occupation</label>
          <input
            type="text"
            value={sh.occupation}
            onChange={(e) => handleChange('occupation', e.target.value)}
            placeholder="Current occupation"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tobacco Use</label>
          <select
            value={sh.tobacco}
            onChange={(e) => handleChange('tobacco', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="never">Never</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Alcohol Use</label>
          <select
            value={sh.alcohol}
            onChange={(e) => handleChange('alcohol', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="none">None</option>
            <option value="occasional">Occasional</option>
            <option value="regular">Regular</option>
            <option value="heavy">Heavy</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Drug Use</label>
          <select
            value={sh.drugs}
            onChange={(e) => handleChange('drugs', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="none">None</option>
            <option value="former">Former</option>
            <option value="current">Current</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Living Conditions</label>
          <textarea
            value={sh.livingConditions}
            onChange={(e) => handleChange('livingConditions', e.target.value)}
            placeholder="Describe living conditions, family situation, etc."
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
