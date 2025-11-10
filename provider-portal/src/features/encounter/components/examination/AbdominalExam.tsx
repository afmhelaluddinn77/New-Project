import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const AbdominalExam: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const abd = examination.abdominalExam;

  const handleChange = (field: keyof typeof abd, value: string) => {
    updateExamination('abdominalExam', {
      ...abd,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Abdominal Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Inspection</label>
          <textarea
            value={abd.inspection}
            onChange={(e) => handleChange('inspection', e.target.value)}
            placeholder="e.g., Flat, no scars, no distension"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Palpation</label>
          <textarea
            value={abd.palpation}
            onChange={(e) => handleChange('palpation', e.target.value)}
            placeholder="e.g., Soft, non-tender, no masses, liver not palpable"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Percussion</label>
          <textarea
            value={abd.percussion}
            onChange={(e) => handleChange('percussion', e.target.value)}
            placeholder="e.g., Tympanic throughout, no dullness"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Auscultation</label>
          <textarea
            value={abd.auscultation}
            onChange={(e) => handleChange('auscultation', e.target.value)}
            placeholder="e.g., Bowel sounds present and normal"
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
