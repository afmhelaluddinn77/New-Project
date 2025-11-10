import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const NeurologicalExam: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const neuro = examination.neurologicalExam;

  const handleChange = (field: keyof typeof neuro, value: string) => {
    updateExamination('neurologicalExam', {
      ...neuro,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Neurological Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Cranial Nerves (CN I-XII)</label>
          <textarea
            value={neuro.cranialNerves}
            onChange={(e) => handleChange('cranialNerves', e.target.value)}
            placeholder="e.g., CN I-XII intact, no deficits"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Motor Function</label>
          <textarea
            value={neuro.motorFunction}
            onChange={(e) => handleChange('motorFunction', e.target.value)}
            placeholder="e.g., Strength 5/5 throughout, normal tone"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Sensory</label>
          <textarea
            value={neuro.sensory}
            onChange={(e) => handleChange('sensory', e.target.value)}
            placeholder="e.g., Intact to light touch and pinprick"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Reflexes</label>
          <textarea
            value={neuro.reflexes}
            onChange={(e) => handleChange('reflexes', e.target.value)}
            placeholder="e.g., Biceps 2+, triceps 2+, patellar 2+, ankle 2+"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Gait & Coordination</label>
          <textarea
            value={neuro.gait}
            onChange={(e) => handleChange('gait', e.target.value)}
            placeholder="e.g., Normal gait, steady, no ataxia"
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
