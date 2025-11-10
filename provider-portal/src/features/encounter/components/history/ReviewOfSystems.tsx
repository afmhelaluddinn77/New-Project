import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/history.module.css';

const SYSTEMS = [
  { key: 'general', label: 'General' },
  { key: 'cardiovascular', label: 'Cardiovascular' },
  { key: 'respiratory', label: 'Respiratory' },
  { key: 'gastrointestinal', label: 'Gastrointestinal' },
  { key: 'genitourinary', label: 'Genitourinary' },
  { key: 'neurological', label: 'Neurological' },
  { key: 'psychiatric', label: 'Psychiatric' },
  { key: 'musculoskeletal', label: 'Musculoskeletal' },
  { key: 'skin', label: 'Skin' },
  { key: 'endocrine', label: 'Endocrine' },
];

export const ReviewOfSystems: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const ros = history.reviewOfSystems;

  const handleChange = (system: keyof typeof ros, value: string) => {
    updateHistory('reviewOfSystems', {
      ...ros,
      [system]: value,
    });
  };

  return (
    <div className={styles.section}>
      <h3>Review of Systems</h3>
      <p className={styles.sectionDescription}>
        Document symptoms or lack thereof for each system
      </p>

      <div className={styles.rosGrid}>
        {SYSTEMS.map((system) => (
          <div key={system.key} className={styles.rosItem}>
            <label>{system.label}</label>
            <textarea
              value={ros[system.key as keyof typeof ros]}
              onChange={(e) =>
                handleChange(system.key as keyof typeof ros, e.target.value)
              }
              placeholder={`${system.label} symptoms or 'denies'`}
              className={styles.rosTextarea}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
