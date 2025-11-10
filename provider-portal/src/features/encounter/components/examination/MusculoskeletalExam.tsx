import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const MusculoskeletalExam: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const msk = examination.musculoskeletalExam;

  const handleChange = (field: keyof typeof msk, value: string) => {
    updateExamination('musculoskeletalExam', {
      ...msk,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Musculoskeletal Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Joints</label>
          <textarea
            value={msk.joints}
            onChange={(e) => handleChange('joints', e.target.value)}
            placeholder="e.g., No swelling, erythema, or warmth"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Range of Motion</label>
          <textarea
            value={msk.rangeOfMotion}
            onChange={(e) => handleChange('rangeOfMotion', e.target.value)}
            placeholder="e.g., Full ROM all joints, no limitations"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Muscle Strength</label>
          <textarea
            value={msk.muscleStrength}
            onChange={(e) => handleChange('muscleStrength', e.target.value)}
            placeholder="e.g., 5/5 throughout, no atrophy"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Deformities</label>
          <textarea
            value={msk.deformities}
            onChange={(e) => handleChange('deformities', e.target.value)}
            placeholder="e.g., No deformities, no clubbing"
            className={styles.textarea}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};
