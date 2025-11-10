import React, { useState, useMemo } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/investigations.module.css';

const COMMON_TESTS = [
  { name: 'Complete Blood Count', code: 'CBC', category: 'Hematology' },
  { name: 'Blood Glucose', code: 'GLU', category: 'Chemistry' },
  { name: 'Hemoglobin A1c', code: 'HbA1c', category: 'Chemistry' },
  { name: 'Lipid Panel', code: 'LIP', category: 'Chemistry' },
  { name: 'Liver Function Tests', code: 'LFT', category: 'Chemistry' },
  { name: 'Renal Function Tests', code: 'RFT', category: 'Chemistry' },
  { name: 'Thyroid Function Tests', code: 'TFT', category: 'Endocrine' },
  { name: 'Urinalysis', code: 'UA', category: 'Urinalysis' },
  { name: 'Blood Culture', code: 'BC', category: 'Microbiology' },
  { name: 'Chest X-ray', code: 'CXR', category: 'Radiology' },
  { name: 'ECG', code: 'ECG', category: 'Cardiology' },
  { name: 'Ultrasound Abdomen', code: 'USG-ABD', category: 'Radiology' },
  { name: 'CT Scan', code: 'CT', category: 'Radiology' },
  { name: 'MRI', code: 'MRI', category: 'Radiology' },
];

export const InvestigationSearch: React.FC = () => {
  const { investigations, updateInvestigations } = useEncounterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState<'routine' | 'urgent' | 'stat'>('routine');
  const [notes, setNotes] = useState('');

  const filteredTests = useMemo(() => {
    if (!searchTerm) return [];
    return COMMON_TESTS.filter(
      (test) =>
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAddTest = (test: typeof COMMON_TESTS[0]) => {
    const newInvestigation = {
      testName: test.name,
      testCode: test.code,
      urgency: selectedUrgency,
      notes: notes,
    };

    updateInvestigations('investigations', [
      ...investigations.investigations,
      newInvestigation,
    ]);

    setSearchTerm('');
    setNotes('');
    setSelectedUrgency('routine');
  };

  const handleRemoveTest = (index: number) => {
    updateInvestigations(
      'investigations',
      investigations.investigations.filter((_, i) => i !== index)
    );
  };

  return (
    <div className={styles.section}>
      <h3>Investigation Orders</h3>

      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tests (e.g., CBC, Blood Glucose, X-ray)"
          className={styles.searchInput}
        />

        {filteredTests.length > 0 && (
          <div className={styles.searchResults}>
            {filteredTests.map((test) => (
              <div key={test.code} className={styles.searchResult}>
                <div className={styles.testInfo}>
                  <strong>{test.name}</strong>
                  <span className={styles.testCode}>{test.code}</span>
                  <span className={styles.category}>{test.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.orderForm}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Urgency</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value as 'routine' | 'urgent' | 'stat')}
              className={styles.select}
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="stat">STAT</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions"
              className={styles.input}
            />
          </div>
        </div>
      </div>

      <div className={styles.orderedTests}>
        <h4>Ordered Tests ({investigations.investigations.length})</h4>
        {investigations.investigations.length === 0 ? (
          <p className={styles.emptyMessage}>No tests ordered</p>
        ) : (
          <div className={styles.testsList}>
            {investigations.investigations.map((inv, index) => (
              <div key={index} className={styles.testItem}>
                <div className={styles.testContent}>
                  <strong>{inv.testName}</strong>
                  <div className={styles.testMeta}>
                    <span className={styles.badge}>{inv.testCode}</span>
                    <span className={`${styles.urgency} ${styles[inv.urgency]}`}>
                      {inv.urgency.toUpperCase()}
                    </span>
                    {inv.notes && <span className={styles.notes}>{inv.notes}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveTest(index)}
                  className={styles.removeButton}
                  type="button"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
