import React, { useState } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/investigations.module.css';

const IMAGING_MODALITIES = [
  'X-ray',
  'Ultrasound',
  'CT Scan',
  'MRI',
  'PET Scan',
  'Nuclear Medicine',
  'Fluoroscopy',
  'Mammography',
];

const BODY_PARTS = [
  'Head/Brain',
  'Neck',
  'Chest',
  'Abdomen',
  'Pelvis',
  'Spine',
  'Upper Extremity',
  'Lower Extremity',
  'Whole Body',
];

export const ImagingOrders: React.FC = () => {
  const { investigations, updateInvestigations } = useEncounterStore();
  const [newImaging, setNewImaging] = useState({
    modality: '',
    bodyPart: '',
    indication: '',
    urgency: 'routine' as 'routine' | 'urgent' | 'stat',
  });

  const handleAddImaging = () => {
    if (newImaging.modality && newImaging.bodyPart) {
      const imagingOrder = {
        testName: `${newImaging.modality} - ${newImaging.bodyPart}`,
        testCode: `IMG-${newImaging.modality.substring(0, 3).toUpperCase()}`,
        urgency: newImaging.urgency,
        notes: newImaging.indication,
      };

      updateInvestigations('investigations', [
        ...investigations.investigations,
        imagingOrder,
      ]);

      setNewImaging({
        modality: '',
        bodyPart: '',
        indication: '',
        urgency: 'routine',
      });
    }
  };

  return (
    <div className={styles.section}>
      <h3>Imaging Orders</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Imaging Modality</label>
          <select
            value={newImaging.modality}
            onChange={(e) => setNewImaging({ ...newImaging, modality: e.target.value })}
            className={styles.select}
          >
            <option value="">Select Modality</option>
            {IMAGING_MODALITIES.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Body Part</label>
          <select
            value={newImaging.bodyPart}
            onChange={(e) => setNewImaging({ ...newImaging, bodyPart: e.target.value })}
            className={styles.select}
          >
            <option value="">Select Body Part</option>
            {BODY_PARTS.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Urgency</label>
          <select
            value={newImaging.urgency}
            onChange={(e) => setNewImaging({ ...newImaging, urgency: e.target.value as any })}
            className={styles.select}
          >
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Indication</label>
          <input
            type="text"
            value={newImaging.indication}
            onChange={(e) => setNewImaging({ ...newImaging, indication: e.target.value })}
            placeholder="Clinical indication"
            className={styles.input}
          />
        </div>
      </div>

      <button
        onClick={handleAddImaging}
        className={styles.addButton}
        type="button"
      >
        Add Imaging Order
      </button>

      <div className={styles.imagingList}>
        <h4>Imaging Orders</h4>
        <p className={styles.hint}>
          Imaging orders are added to the investigations list above
        </p>
      </div>
    </div>
  );
};
