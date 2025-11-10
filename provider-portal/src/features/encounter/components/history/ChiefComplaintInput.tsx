import React, { useState } from 'react';
import { useEncounterStore } from '../../../../store/encounterStore';
import styles from '../../styles/history.module.css';

const QUICK_PICKS = [
  'Fever',
  'Cough',
  'Headache',
  'Chest Pain',
  'Abdominal Pain',
  'Shortness of Breath',
  'Nausea/Vomiting',
  'Diarrhea',
  'Weakness',
  'Dizziness',
];

export const ChiefComplaintInput: React.FC = () => {
  const { history, updateHistory } = useEncounterStore();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    updateHistory('chiefComplaint', value);

    // Show suggestions if input is empty or has space
    if (value.endsWith(' ') || value === '') {
      setSuggestions(QUICK_PICKS);
    } else {
      setSuggestions([]);
    }
  };

  const handleQuickPick = (complaint: string) => {
    const current = history.chiefComplaint.trim();
    const updated = current ? `${current}, ${complaint}` : complaint;
    updateHistory('chiefComplaint', updated);
    setSuggestions([]);
  };

  return (
    <div className={styles.section}>
      <h3>Chief Complaint</h3>
      <div className={styles.inputContainer}>
        <textarea
          value={history.chiefComplaint}
          onChange={handleChange}
          placeholder="Enter chief complaint (e.g., Fever and cough for 3 days)"
          className={styles.textarea}
          rows={3}
        />
        {suggestions.length > 0 && (
          <div className={styles.suggestions}>
            <p className={styles.suggestionsLabel}>Quick picks:</p>
            <div className={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className={styles.suggestionButton}
                  onClick={() => handleQuickPick(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <p className={styles.characterCount}>
        {history.chiefComplaint.length} characters
      </p>
    </div>
  );
};
