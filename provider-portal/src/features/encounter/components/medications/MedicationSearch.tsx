import React, { useState, useMemo } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/medications.module.css';

const COMMON_MEDICATIONS = [
  { generic: 'Paracetamol', brand: 'Acetaminophen', category: 'Analgesic' },
  { generic: 'Ibuprofen', brand: 'Advil', category: 'NSAID' },
  { generic: 'Amoxicillin', brand: 'Amoxil', category: 'Antibiotic' },
  { generic: 'Metformin', brand: 'Glucophage', category: 'Antidiabetic' },
  { generic: 'Lisinopril', brand: 'Prinivil', category: 'Antihypertensive' },
  { generic: 'Atorvastatin', brand: 'Lipitor', category: 'Statin' },
  { generic: 'Omeprazole', brand: 'Prilosec', category: 'PPI' },
  { generic: 'Loratadine', brand: 'Claritin', category: 'Antihistamine' },
  { generic: 'Levothyroxine', brand: 'Synthroid', category: 'Thyroid' },
  { generic: 'Aspirin', brand: 'Bayer', category: 'Antiplatelet' },
];

export const MedicationSearch: React.FC = () => {
  const { medications, updateMedications } = useEncounterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState<typeof COMMON_MEDICATIONS[0] | null>(null);

  const filteredMeds = useMemo(() => {
    if (!searchTerm) return [];
    return COMMON_MEDICATIONS.filter(
      (med) =>
        med.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectMed = (med: typeof COMMON_MEDICATIONS[0]) => {
    setSelectedMed(med);
    setSearchTerm('');
  };

  const handleAddMedication = () => {
    if (selectedMed) {
      const prescription = {
        medicationName: selectedMed.brand,
        genericName: selectedMed.generic,
        dosage: '',
        frequency: '',
        duration: '',
        route: 'Oral',
        indication: '',
        notes: '',
      };

      updateMedications('prescriptions', [
        ...medications.prescriptions,
        prescription,
      ]);

      setSelectedMed(null);
    }
  };

  return (
    <div className={styles.section}>
      <h3>Medication Search</h3>

      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search medications (generic or brand name)"
          className={styles.searchInput}
        />

        {filteredMeds.length > 0 && (
          <div className={styles.searchResults}>
            {filteredMeds.map((med) => (
              <button
                key={med.generic}
                className={styles.searchResult}
                onClick={() => handleSelectMed(med)}
                type="button"
              >
                <div className={styles.medInfo}>
                  <strong>{med.brand}</strong>
                  <span className={styles.generic}>{med.generic}</span>
                  <span className={styles.category}>{med.category}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMed && (
        <div className={styles.selectedMed}>
          <div className={styles.selectedContent}>
            <strong>{selectedMed.brand}</strong>
            <span className={styles.generic}>{selectedMed.generic}</span>
            <span className={styles.category}>{selectedMed.category}</span>
          </div>
          <div className={styles.selectedActions}>
            <button
              onClick={handleAddMedication}
              className={styles.addButton}
              type="button"
            >
              Add to Prescription
            </button>
            <button
              onClick={() => setSelectedMed(null)}
              className={styles.cancelButton}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
