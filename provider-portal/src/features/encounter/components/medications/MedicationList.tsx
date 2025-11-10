import React from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/medications.module.css';

export const MedicationList: React.FC = () => {
  const { medications, updateMedications } = useEncounterStore();
  const prescriptions = medications.prescriptions;

  const handleRemovePrescription = (index: number) => {
    updateMedications('prescriptions', prescriptions.filter((_, i) => i !== index));
  };

  const handleEditPrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    updateMedications('prescriptions', updated);
  };

  return (
    <div className={styles.section}>
      <h3>Active Medications Summary</h3>

      {prescriptions.length === 0 ? (
        <p className={styles.emptyMessage}>No active medications</p>
      ) : (
        <div className={styles.medicationsSummary}>
          <div className={styles.medicationsStats}>
            <div className={styles.stat}>
              <strong>{prescriptions.length}</strong>
              <span>Active Medications</span>
            </div>
            <div className={styles.stat}>
              <strong>{prescriptions.filter((m) => m.indication).length}</strong>
              <span>With Indication</span>
            </div>
          </div>

          <div className={styles.medicationsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.colMedication}>Medication</div>
              <div className={styles.colDosage}>Dosage</div>
              <div className={styles.colFrequency}>Frequency</div>
              <div className={styles.colDuration}>Duration</div>
              <div className={styles.colRoute}>Route</div>
              <div className={styles.colActions}>Actions</div>
            </div>

            {prescriptions.map((med, index) => (
              <div key={index} className={styles.tableRow}>
                <div className={styles.colMedication}>
                  <div className={styles.medName}>{med.medicationName}</div>
                  {med.genericName && (
                    <div className={styles.genericName}>{med.genericName}</div>
                  )}
                  {med.indication && (
                    <div className={styles.indication}>{med.indication}</div>
                  )}
                </div>
                <div className={styles.colDosage}>{med.dosage}</div>
                <div className={styles.colFrequency}>{med.frequency}</div>
                <div className={styles.colDuration}>{med.duration || '-'}</div>
                <div className={styles.colRoute}>{med.route}</div>
                <div className={styles.colActions}>
                  <button
                    onClick={() => handleRemovePrescription(index)}
                    className={styles.removeButton}
                    title="Remove medication"
                    type="button"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
