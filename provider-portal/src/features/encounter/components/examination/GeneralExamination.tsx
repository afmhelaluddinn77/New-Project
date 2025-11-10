import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const GeneralExamination: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const general = examination.generalExamination;

  const handleChange = (field: keyof typeof general, value: string) => {
    updateExamination('generalExamination', {
      ...general,
      [field]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>General Examination</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Appearance</label>
          <textarea
            value={general.appearance}
            onChange={(e) => handleChange('appearance', e.target.value)}
            placeholder="Describe general appearance (e.g., well-built, obese, cachectic)"
            className={styles.textarea}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Consciousness/Mental Status</label>
          <select
            value={general.consciousness}
            onChange={(e) => handleChange('consciousness', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="alert">Alert and oriented</option>
            <option value="drowsy">Drowsy</option>
            <option value="lethargic">Lethargic</option>
            <option value="stuporous">Stuporous</option>
            <option value="comatose">Comatose</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Nutritional Status</label>
          <select
            value={general.nutritionalStatus}
            onChange={(e) => handleChange('nutritionalStatus', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="well-nourished">Well-nourished</option>
            <option value="adequately-nourished">Adequately nourished</option>
            <option value="malnourished">Malnourished</option>
            <option value="obese">Obese</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Hydration Status</label>
          <select
            value={general.hydration}
            onChange={(e) => handleChange('hydration', e.target.value)}
            className={styles.select}
          >
            <option value="">Select</option>
            <option value="well-hydrated">Well-hydrated</option>
            <option value="adequately-hydrated">Adequately hydrated</option>
            <option value="dehydrated">Dehydrated</option>
            <option value="severely-dehydrated">Severely dehydrated</option>
          </select>
        </div>
      </div>
    </div>
  );
};
