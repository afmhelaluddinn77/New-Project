import React, { useState } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/medications.module.css';

const ROUTES = ['Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical', 'Inhalation', 'Rectal'];
const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Four times daily',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed',
];

export const MedicationPrescription: React.FC = () => {
  const { medications, updateMedications } = useEncounterStore();
  const prescriptions = medications.prescriptions;

  const [newPrescription, setNewPrescription] = useState({
    medicationName: '',
    genericName: '',
    dosage: '',
    frequency: '',
    duration: '',
    route: 'Oral',
    indication: '',
    notes: '',
  });

  const handleAddPrescription = () => {
    if (
      newPrescription.medicationName.trim() &&
      newPrescription.dosage.trim() &&
      newPrescription.frequency
    ) {
      updateMedications('prescriptions', [
        ...prescriptions,
        newPrescription,
      ]);

      setNewPrescription({
        medicationName: '',
        genericName: '',
        dosage: '',
        frequency: '',
        duration: '',
        route: 'Oral',
        indication: '',
        notes: '',
      });
    }
  };

  const handleRemovePrescription = (index: number) => {
    updateMedications('prescriptions', prescriptions.filter((_, i) => i !== index));
  };

  const handleUpdatePrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    updateMedications('prescriptions', updated);
  };

  return (
    <div className={styles.section}>
      <h3>Prescription Details</h3>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Medication Name</label>
          <input
            type="text"
            value={newPrescription.medicationName}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, medicationName: e.target.value })
            }
            placeholder="Brand name"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Generic Name</label>
          <input
            type="text"
            value={newPrescription.genericName}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, genericName: e.target.value })
            }
            placeholder="Generic name"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Dosage</label>
          <input
            type="text"
            value={newPrescription.dosage}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, dosage: e.target.value })
            }
            placeholder="e.g., 500mg"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Frequency</label>
          <select
            value={newPrescription.frequency}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, frequency: e.target.value })
            }
            className={styles.select}
          >
            <option value="">Select Frequency</option>
            {FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Duration</label>
          <input
            type="text"
            value={newPrescription.duration}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, duration: e.target.value })
            }
            placeholder="e.g., 7 days, 2 weeks"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Route</label>
          <select
            value={newPrescription.route}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, route: e.target.value })
            }
            className={styles.select}
          >
            {ROUTES.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Indication</label>
          <input
            type="text"
            value={newPrescription.indication}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, indication: e.target.value })
            }
            placeholder="Why is this prescribed?"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Notes</label>
          <textarea
            value={newPrescription.notes}
            onChange={(e) =>
              setNewPrescription({ ...newPrescription, notes: e.target.value })
            }
            placeholder="Special instructions"
            className={styles.textarea}
            rows={2}
          />
        </div>
      </div>

      <button
        onClick={handleAddPrescription}
        className={styles.addButton}
        type="button"
      >
        Add Prescription
      </button>

      <div className={styles.prescriptionsList}>
        <h4>Active Prescriptions ({prescriptions.length})</h4>
        {prescriptions.length === 0 ? (
          <p className={styles.emptyMessage}>No prescriptions</p>
        ) : (
          prescriptions.map((rx, index) => (
            <div key={index} className={styles.prescriptionItem}>
              <div className={styles.rxContent}>
                <strong>{rx.medicationName}</strong>
                <div className={styles.rxDetails}>
                  <span>{rx.dosage}</span>
                  <span>{rx.frequency}</span>
                  {rx.duration && <span>{rx.duration}</span>}
                  <span className={styles.route}>{rx.route}</span>
                </div>
                {rx.indication && (
                  <span className={styles.indication}>For: {rx.indication}</span>
                )}
              </div>
              <button
                onClick={() => handleRemovePrescription(index)}
                className={styles.removeButton}
                type="button"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
