import React from 'react';
import { useEncounterStore } from '../../../store/encounterStore';
import styles from './PrescriptionPreview.module.css';

export const PrescriptionPreview: React.FC = () => {
  const { medications, history, examination, patientId, providerId, encounterDate } = useEncounterStore();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  };

  return (
    <div className={styles.prescriptionContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.hospitalInfo}>
          <h1>PRESCRIPTION</h1>
          <p className={styles.subtitle}>Clinical Encounter Management System</p>
        </div>
        <div className={styles.dateInfo}>
          <p><strong>Date:</strong> {formatDate(encounterDate)}</p>
          <p><strong>Provider ID:</strong> {providerId}</p>
        </div>
      </div>

      {/* Patient Information */}
      <div className={styles.section}>
        <h3>Patient Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label>Patient ID:</label>
            <span>{patientId}</span>
          </div>
          <div className={styles.infoItem}>
            <label>Chief Complaint:</label>
            <span>{history.chiefComplaint || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* Vital Signs */}
      {examination.vitalSigns && Object.keys(examination.vitalSigns).length > 0 && (
        <div className={styles.section}>
          <h3>Vital Signs</h3>
          <div className={styles.vitalGrid}>
            {examination.vitalSigns.bloodPressure && (
              <div className={styles.vital}>
                <label>BP:</label>
                <span>{examination.vitalSigns.bloodPressure}</span>
              </div>
            )}
            {examination.vitalSigns.heartRate && (
              <div className={styles.vital}>
                <label>HR:</label>
                <span>{examination.vitalSigns.heartRate} bpm</span>
              </div>
            )}
            {examination.vitalSigns.temperature && (
              <div className={styles.vital}>
                <label>Temp:</label>
                <span>{examination.vitalSigns.temperature}°C</span>
              </div>
            )}
            {examination.vitalSigns.spO2 && (
              <div className={styles.vital}>
                <label>SpO2:</label>
                <span>{examination.vitalSigns.spO2}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medications/Prescriptions */}
      <div className={styles.section}>
        <h3>Medications</h3>
        {medications.prescriptions.length === 0 ? (
          <p className={styles.noData}>No medications prescribed</p>
        ) : (
          <div className={styles.medicationsList}>
            {medications.prescriptions.map((rx, index) => (
              <div key={index} className={styles.medicationItem}>
                <div className={styles.medHeader}>
                  <span className={styles.medNumber}>{index + 1}.</span>
                  <div className={styles.medDetails}>
                    <strong className={styles.medName}>{rx.medicationName}</strong>
                    {rx.genericName && (
                      <span className={styles.genericName}>({rx.genericName})</span>
                    )}
                  </div>
                </div>

                <div className={styles.medPrescription}>
                  <div className={styles.prescDetail}>
                    <label>Dosage:</label>
                    <span>{rx.dosage}</span>
                  </div>
                  <div className={styles.prescDetail}>
                    <label>Frequency:</label>
                    <span>{rx.frequency}</span>
                  </div>
                  <div className={styles.prescDetail}>
                    <label>Route:</label>
                    <span>{rx.route}</span>
                  </div>
                  {rx.duration && (
                    <div className={styles.prescDetail}>
                      <label>Duration:</label>
                      <span>{rx.duration}</span>
                    </div>
                  )}
                </div>

                {rx.indication && (
                  <div className={styles.indication}>
                    <label>Indication:</label>
                    <span>{rx.indication}</span>
                  </div>
                )}

                {rx.notes && (
                  <div className={styles.notes}>
                    <label>Notes:</label>
                    <span>{rx.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Instructions */}
      <div className={styles.section}>
        <h3>Patient Instructions</h3>
        <ul className={styles.instructions}>
          <li>Take medications exactly as prescribed</li>
          <li>Do not skip doses or change dosage without consulting your doctor</li>
          <li>Report any adverse effects or allergic reactions immediately</li>
          <li>Keep medications in a cool, dry place away from children</li>
          <li>Follow up with your healthcare provider as recommended</li>
        </ul>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.signature}>
          <p>Provider Signature: _______________________</p>
          <p>Date: _______________________</p>
        </div>
        <div className={styles.disclaimer}>
          <p className={styles.disclaimerText}>
            This prescription is valid for 30 days from the date of issue.
            Refills may be available as indicated by the prescriber.
          </p>
        </div>
      </div>
    </div>
  );
};
