import React, { useState, useEffect } from 'react';
import { useEncounterStore } from '../store/encounterStore';
import {
  ChiefComplaintInput,
  HistoryOfPresentIllness,
  PastMedicalHistory,
  MedicationHistory,
  FamilyHistory,
  SocialHistory,
  ReviewOfSystems,
} from '../features/encounter/components/history';
import {
  VitalSigns,
  GeneralExamination,
  CardiovascularExam,
  RespiratoryExam,
  AbdominalExam,
  NeurologicalExam,
  MusculoskeletalExam,
} from '../features/encounter/components/examination';
const InvestigationSearchFeatureLazy = React.lazy(() =>
  import('../features/encounter/components/investigations').then((m) => ({ default: m.InvestigationSearch })),
);
const InvestigationOrdersLazy = React.lazy(() =>
  import('../features/encounter/components/investigations').then((m) => ({ default: m.InvestigationOrders })),
);
const InvestigationResultsLazy = React.lazy(() =>
  import('../features/encounter/components/investigations').then((m) => ({ default: m.InvestigationResults })),
);
const ImagingOrdersLazy = React.lazy(() =>
  import('../features/encounter/components/investigations').then((m) => ({ default: m.ImagingOrders })),
);
const MedicationSearchFeatureLazy = React.lazy(() =>
  import('../features/encounter/components/medications').then((m) => ({ default: m.MedicationSearch })),
);
const MedicationPrescriptionLazy = React.lazy(() =>
  import('../features/encounter/components/medications').then((m) => ({ default: m.MedicationPrescription })),
);
const MedicationListLazy = React.lazy(() =>
  import('../features/encounter/components/medications').then((m) => ({ default: m.MedicationList })),
);
const DrugInteractionCheckerLazy = React.lazy(() =>
  import('../features/encounter/components/medications').then((m) => ({ default: m.DrugInteractionChecker })),
);
const NewInvestigationSearchLazy = React.lazy(() =>
  import('@/components/investigations/InvestigationSearch').then((m) => ({ default: m.InvestigationSearch })),
);
const NewMedicationSearchLazy = React.lazy(() =>
  import('@/components/medications/MedicationSearch').then((m) => ({ default: m.MedicationSearch })),
);
import styles from './EncounterEditorPage.module.css';

type TabType = 'history' | 'examination' | 'investigations' | 'medications';

export const EncounterEditorPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isSaving,
    setIsSaving,
    saveEncounter,
    encounterId,
    patientId,
    providerId,
  } = useEncounterStore();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');
  const [showInvestigationPreview, setShowInvestigationPreview] = useState(false);
  const [showMedicationPreview, setShowMedicationPreview] = useState(false);

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'examination', label: 'Examination', icon: '🔍' },
    { id: 'investigations', label: 'Investigations', icon: '🧪' },
    { id: 'medications', label: 'Medications', icon: '💊' },
  ];

  const handleSave = async () => {
    setSaveStatus('saving');
    setIsSaving(true);

    try {
      await saveEncounter();
      setSaveStatus('success');
      setSaveMessage('Encounter saved successfully');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setSaveMessage('Failed to save encounter');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = async () => {
    if (window.confirm('Are you sure you want to finalize this encounter? This action cannot be undone.')) {
      await handleSave();
      // TODO: Call API to finalize encounter
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Clinical Encounter Editor</h1>
          <div className={styles.encounterInfo}>
            {encounterId && <span>Encounter ID: {encounterId}</span>}
            {patientId && <span>Patient ID: {patientId}</span>}
            {providerId && <span>Provider ID: {providerId}</span>}
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${styles.button} ${styles.saveButton}`}
            type="button"
          >
            {isSaving ? '💾 Saving...' : '💾 Save'}
          </button>
          <button
            onClick={handlePrint}
            className={`${styles.button} ${styles.printButton}`}
            type="button"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleFinalize}
            className={`${styles.button} ${styles.finalizeButton}`}
            type="button"
          >
            ✓ Finalize
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {saveStatus !== 'idle' && (
        <div className={`${styles.statusMessage} ${styles[saveStatus]}`}>
          {saveMessage}
        </div>
      )}

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
              type="button"
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* History Tab */}
        {activeTab === 'history' && (
          <div className={styles.tabContent}>
            <h2>Patient History</h2>
            <ChiefComplaintInput />
            <HistoryOfPresentIllness />
            <PastMedicalHistory />
            <MedicationHistory />
            <FamilyHistory />
            <SocialHistory />
            <ReviewOfSystems />
          </div>
        )}

        {/* Examination Tab */}
        {activeTab === 'examination' && (
          <div className={styles.tabContent}>
            <h2>Physical Examination</h2>
            <VitalSigns />
            <GeneralExamination />
            <CardiovascularExam />
            <RespiratoryExam />
            <AbdominalExam />
            <NeurologicalExam />
            <MusculoskeletalExam />
          </div>
        )}

        {/* Investigations Tab */}
        {activeTab === 'investigations' && (
          <div className={styles.tabContent}>
            <h2>Investigations & Imaging</h2>
            <React.Suspense fallback={<div>Loading…</div>}>
              <InvestigationSearchFeatureLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <ImagingOrdersLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <InvestigationOrdersLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <InvestigationResultsLazy />
            </React.Suspense>

            <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Investigations Preview (New)</h3>
                <button
                  type="button"
                  onClick={() => setShowInvestigationPreview((v) => !v)}
                  className={`${styles.button}`}
                >
                  {showInvestigationPreview ? 'Hide' : 'Show'}
                </button>
              </div>
              {showInvestigationPreview && (
                <React.Suspense fallback={<div>Loading preview…</div>}>
                  <NewInvestigationSearchLazy onSelect={() => {}} />
                </React.Suspense>
              )}
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className={styles.tabContent}>
            <h2>Medications & Prescriptions</h2>
            <React.Suspense fallback={<div>Loading…</div>}>
              <MedicationSearchFeatureLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <MedicationPrescriptionLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <DrugInteractionCheckerLazy />
            </React.Suspense>
            <React.Suspense fallback={<div>Loading…</div>}>
              <MedicationListLazy />
            </React.Suspense>

            <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Medications Preview (New)</h3>
                <button
                  type="button"
                  onClick={() => setShowMedicationPreview((v) => !v)}
                  className={`${styles.button}`}
                >
                  {showMedicationPreview ? 'Hide' : 'Show'}
                </button>
              </div>
              {showMedicationPreview && (
                <React.Suspense fallback={<div>Loading preview…</div>}>
                  <NewMedicationSearchLazy onSelect={() => {}} />
                </React.Suspense>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p>Last saved: {new Date().toLocaleString()}</p>
          <p>All changes are automatically saved</p>
        </div>
        <div className={styles.footerActions}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${styles.button} ${styles.saveButton}`}
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
