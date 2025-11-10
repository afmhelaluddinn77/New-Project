import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/examination.module.css';

export const VitalSigns: React.FC = () => {
  const { examination, updateExamination } = useEncounterStore();
  const vitals = examination.vitalSigns;

  const handleChange = (field: keyof typeof vitals, value: any) => {
    updateExamination('vitalSigns', {
      ...vitals,
      [field]: value,
    });
  };

  const calculateBMI = (height: number, weight: number) => {
    if (height > 0 && weight > 0) {
      return (weight / (height * height)).toFixed(1);
    }
    return '0';
  };

  return (
    <div className={styles.section}>
      <h3>Vital Signs</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Blood Pressure (mmHg)</label>
          <input
            type="text"
            value={vitals.bloodPressure}
            onChange={(e) => handleChange('bloodPressure', e.target.value)}
            placeholder="e.g., 120/80"
            className={styles.input}
          />
          <span className={styles.hint}>Systolic/Diastolic</span>
        </div>

        <div className={styles.formGroup}>
          <label>Heart Rate (bpm)</label>
          <input
            type="number"
            value={vitals.heartRate}
            onChange={(e) => handleChange('heartRate', parseInt(e.target.value) || 0)}
            placeholder="60-100"
            className={styles.input}
            min="0"
            max="300"
          />
          <span className={styles.hint}>Normal: 60-100 bpm</span>
        </div>

        <div className={styles.formGroup}>
          <label>Respiratory Rate (breaths/min)</label>
          <input
            type="number"
            value={vitals.respiratoryRate}
            onChange={(e) => handleChange('respiratoryRate', parseInt(e.target.value) || 0)}
            placeholder="12-20"
            className={styles.input}
            min="0"
            max="60"
          />
          <span className={styles.hint}>Normal: 12-20 breaths/min</span>
        </div>

        <div className={styles.formGroup}>
          <label>Temperature (°C)</label>
          <input
            type="number"
            value={vitals.temperature}
            onChange={(e) => handleChange('temperature', parseFloat(e.target.value) || 0)}
            placeholder="36.5"
            className={styles.input}
            min="35"
            max="42"
            step="0.1"
          />
          <span className={styles.hint}>Normal: 36.5-37.5°C</span>
        </div>

        <div className={styles.formGroup}>
          <label>SpO2 (%)</label>
          <input
            type="number"
            value={vitals.spO2}
            onChange={(e) => handleChange('spO2', parseInt(e.target.value) || 0)}
            placeholder="95-100"
            className={styles.input}
            min="0"
            max="100"
          />
          <span className={styles.hint}>Normal: ≥95%</span>
        </div>

        <div className={styles.formGroup}>
          <label>BMI</label>
          <input
            type="number"
            value={vitals.bmi}
            onChange={(e) => handleChange('bmi', parseFloat(e.target.value) || 0)}
            placeholder="18.5-24.9"
            className={styles.input}
            step="0.1"
            readOnly
          />
          <span className={styles.hint}>Auto-calculated</span>
        </div>
      </div>

      <div className={styles.vitalRanges}>
        <h4>Normal Ranges</h4>
        <ul>
          <li><strong>BP:</strong> &lt;120/80 mmHg</li>
          <li><strong>HR:</strong> 60-100 bpm</li>
          <li><strong>RR:</strong> 12-20 breaths/min</li>
          <li><strong>Temp:</strong> 36.5-37.5°C</li>
          <li><strong>SpO2:</strong> ≥95%</li>
          <li><strong>BMI:</strong> 18.5-24.9 kg/m²</li>
        </ul>
      </div>
    </div>
  );
};
