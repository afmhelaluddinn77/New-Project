import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const RespiratoryExam: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const resp = examination.respiratoryExam;

  const handleChange = (field: keyof typeof resp, value: string) => {
    updateExamination('respiratoryExam', {
      ...resp,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Respiratory Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Breath Sounds</label>
          <textarea
            value={resp.breathSounds}
            onChange={(e) => handleChange('breathSounds', e.target.value)}
            placeholder="e.g., Bilateral vesicular breath sounds, no wheezes"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Chest Expansion</label>
          <textarea
            value={resp.chestExpansion}
            onChange={(e) => handleChange('chestExpansion', e.target.value)}
            placeholder="e.g., Symmetrical, equal bilaterally"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Percussion</label>
          <textarea
            value={resp.percussion}
            onChange={(e) => handleChange('percussion', e.target.value)}
            placeholder="e.g., Resonant throughout"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tactile Fremitus</label>
          <textarea
            value={resp.fremitus}
            onChange={(e) => handleChange('fremitus', e.target.value)}
            placeholder="e.g., Normal and equal bilaterally"
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
