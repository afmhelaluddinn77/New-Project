import React, { useMemo } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/medications.module.css';

// Simplified drug interaction database
const INTERACTIONS: Record<string, Record<string, { severity: 'mild' | 'moderate' | 'severe'; description: string }>> = {
  'Paracetamol': {
    'Ibuprofen': { severity: 'moderate', description: 'Increased risk of GI bleeding' },
  },
  'Aspirin': {
    'Ibuprofen': { severity: 'severe', description: 'Increased risk of GI ulceration and bleeding' },
    'Warfarin': { severity: 'severe', description: 'Increased bleeding risk' },
  },
  'Metformin': {
    'Contrast dye': { severity: 'moderate', description: 'Risk of lactic acidosis' },
  },
  'Lisinopril': {
    'Potassium': { severity: 'moderate', description: 'Hyperkalemia risk' },
  },
};

export const DrugInteractionChecker: React.FC = () => {
  const { medications } = useEncounterStore();
  const prescriptions = medications.prescriptions;

  const interactions = useMemo(() => {
    const found: Array<{
      drug1: string;
      drug2: string;
      severity: 'mild' | 'moderate' | 'severe';
      description: string;
    }> = [];

    for (let i = 0; i < prescriptions.length; i++) {
      for (let j = i + 1; j < prescriptions.length; j++) {
        const med1 = prescriptions[i].medicationName;
        const med2 = prescriptions[j].medicationName;

        if (INTERACTIONS[med1]?.[med2]) {
          const interaction = INTERACTIONS[med1][med2];
          found.push({
            drug1: med1,
            drug2: med2,
            severity: interaction.severity,
            description: interaction.description,
          });
        } else if (INTERACTIONS[med2]?.[med1]) {
          const interaction = INTERACTIONS[med2][med1];
          found.push({
            drug1: med2,
            drug2: med1,
            severity: interaction.severity,
            description: interaction.description,
          });
        }
      }
    }

    return found;
  }, [prescriptions]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe':
        return '#ef4444';
      case 'moderate':
        return '#f59e0b';
      case 'mild':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={styles.section}>
      <h3>Drug Interaction Checker</h3>

      {prescriptions.length < 2 ? (
        <p className={styles.emptyMessage}>Add at least 2 medications to check for interactions</p>
      ) : interactions.length === 0 ? (
        <div className={styles.noInteractions}>
          <p className={styles.successMessage}>✓ No significant interactions detected</p>
        </div>
      ) : (
        <div className={styles.interactionsList}>
          <div className={styles.interactionsWarning}>
            <strong>{interactions.length} potential interaction(s) found</strong>
          </div>

          {interactions.map((interaction, index) => (
            <div
              key={index}
              className={styles.interactionItem}
              style={{
                borderLeftColor: getSeverityColor(interaction.severity),
              }}
            >
              <div className={styles.interactionHeader}>
                <strong>{interaction.drug1}</strong>
                <span className={styles.plus}>+</span>
                <strong>{interaction.drug2}</strong>
              </div>
              <div className={styles.interactionBody}>
                <span
                  className={`${styles.severity} ${styles[interaction.severity]}`}
                  style={{ backgroundColor: getSeverityColor(interaction.severity) }}
                >
                  {interaction.severity.toUpperCase()}
                </span>
                <p className={styles.description}>{interaction.description}</p>
              </div>
            </div>
          ))}

          <div className={styles.recommendations}>
            <h4>Recommendations</h4>
            <ul>
              <li>Review all interactions before prescribing</li>
              <li>Consider alternative medications if severe interactions exist</li>
              <li>Monitor patient for adverse effects</li>
              <li>Adjust dosages if necessary</li>
              <li>Consult with pharmacist for complex cases</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
