import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const CardiovascularExam: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const cardio = examination.cardiovascularExam;

  const handleChange = (field: keyof typeof cardio, value: string) => {
    updateExamination('cardiovascularExam', {
      ...cardio,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Cardiovascular Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Heart Sounds</label>
          <textarea
            value={cardio.heartSounds}
            onChange={(e) => handleChange('heartSounds', e.target.value)}
            placeholder="e.g., S1 normal, S2 normal, no murmurs"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Pulses</label>
          <textarea
            value={cardio.pulses}
            onChange={(e) => handleChange('pulses', e.target.value)}
            placeholder="e.g., Radial 80/min, regular, equal bilaterally"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Blood Pressure (if different)</label>
          <input
            type="text"
            value={cardio.bloodPressure}
            onChange={(e) => handleChange('bloodPressure', e.target.value)}
            placeholder="e.g., 120/80 mmHg"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Edema</label>
          <select
            value={cardio.edema}
            onChange={(e) => handleChange('edema', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="none">None</option>
            <option value="mild">Mild (1+)</option>
            <option value="moderate">Moderate (2+)</option>
            <option value="severe">Severe (3-4+)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
