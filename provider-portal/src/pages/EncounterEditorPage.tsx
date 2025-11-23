import React, { useState } from "react";
import { AutoSaveManager } from "../features/clinical-documentation/AutoSaveManager";
import { ClinicalFlowWizard } from "../features/clinical-documentation/ClinicalFlowWizard";
import { SOAPEditor } from "../features/clinical-documentation/SOAPEditor";
import {
  AbdominalExam,
  CardiovascularExam,
  GeneralExamination,
  MusculoskeletalExam,
  NeurologicalExam,
  RespiratoryExam,
  VitalSigns,
} from "../features/encounter/components/examination";
import {
  ChiefComplaintInput,
  FamilyHistory,
  HistoryOfPresentIllness,
  ImmunizationHistory,
  MedicationHistory,
  ObgynHistory,
  PastMedicalHistory,
  ReviewOfSystems,
  SocialHistory,
  SurgicalHistory,
} from "../features/encounter/components/history";
import {
  buildFhirBundleForSteps1to3,
  exportEncounterNdjsonForSteps1to3,
  uploadFhirBundleToServer,
  checkFhirHealth,
} from "../services/fhirService";
import { saveFhirExportToLocal } from "../services/localFhirExportStore";
import { useEncounterStore } from "../store/encounterStore";
import { useAuthStore } from "../store/authStore";
import styles from "./EncounterEditorPage.module.css";
const InvestigationSearchFeatureLazy = React.lazy(() =>
  import("../features/encounter/components/investigations").then((m) => ({
    default: m.InvestigationSearch,
  }))
);
const InvestigationOrdersLazy = React.lazy(() =>
  import("../features/encounter/components/investigations").then((m) => ({
    default: m.InvestigationOrders,
  }))
);
const InvestigationResultsLazy = React.lazy(() =>
  import("../features/encounter/components/investigations").then((m) => ({
    default: m.InvestigationResults,
  }))
);
const ImagingOrdersLazy = React.lazy(() =>
  import("../features/encounter/components/investigations").then((m) => ({
    default: m.ImagingOrders,
  }))
);
const MedicationSearchFeatureLazy = React.lazy(() =>
  import("../features/encounter/components/medications").then((m) => ({
    default: m.MedicationSearch,
  }))
);
const MedicationPrescriptionLazy = React.lazy(() =>
  import("../features/encounter/components/medications").then((m) => ({
    default: m.MedicationPrescription,
  }))
);
const MedicationListLazy = React.lazy(() =>
  import("../features/encounter/components/medications").then((m) => ({
    default: m.MedicationList,
  }))
);
const DrugInteractionCheckerLazy = React.lazy(() =>
  import("../features/encounter/components/medications").then((m) => ({
    default: m.DrugInteractionChecker,
  }))
);
const NewInvestigationSearchLazy = React.lazy(() =>
  import("@/components/investigations/InvestigationSearch").then((m) => ({
    default: m.InvestigationSearch,
  }))
);
const NewMedicationSearchLazy = React.lazy(() =>
  import("@/components/medications/MedicationSearch").then((m) => ({
    default: m.MedicationSearch,
  }))
);

type TabType =
  | "soap"
  | "history"
  | "examination"
  | "investigations"
  | "medications";

const TEST_PATIENTS = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    label: "John Doe (Demo Patient)",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    label: "Jane Smith (Demo Patient)",
  },
];

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
    setPatientId,
    setProviderId,
    encounterDate,
    encounterType,
    history,
    examination,
    investigations,
    medications,
    assessment,
    plan,
  } = useEncounterStore();

  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user?.id && !providerId) {
      setProviderId(user.id);
    }
  }, [user?.id, providerId, setProviderId]);

  React.useEffect(() => {
    if (!patientId && TEST_PATIENTS.length > 0) {
      setPatientId(TEST_PATIENTS[0].id);
    }
  }, [patientId, setPatientId]);

  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [fhirUploadMessage, setFhirUploadMessage] = useState<string | null>(
    null
  );
  const [fhirUploadIsError, setFhirUploadIsError] = useState(false);
  const [showInvestigationPreview, setShowInvestigationPreview] =
    useState(false);
  const [showMedicationPreview, setShowMedicationPreview] = useState(false);
  const [useWizard, setUseWizard] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const tabs: Array<{ id: TabType; label: string; icon: string }> = [
    { id: "soap", label: "SOAP Note", icon: "📝" },
    { id: "history", label: "History", icon: "📋" },
    { id: "examination", label: "Examination", icon: "🔍" },
    { id: "investigations", label: "Investigations", icon: "🧪" },
    { id: "medications", label: "Medications", icon: "💊" },
  ];

  const handleSave = async () => {
    setSaveStatus("saving");
    setIsSaving(true);

    try {
      await saveEncounter();
      setSaveStatus("success");
      setSaveMessage("Encounter saved successfully");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage("Failed to save encounter");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFinalize = async () => {
    if (
      window.confirm(
        "Are you sure you want to finalize this encounter? This action cannot be undone."
      )
    ) {
      await handleSave();
      // TODO: Call API to finalize encounter
    }
  };

  const handleCheckFhirHealth = () => {
    void checkFhirHealth().then((ok) => {
      setFhirUploadIsError(!ok);
      setFhirUploadMessage(
        ok
          ? "FHIR service health check succeeded via gateway"
          : "FHIR service health check failed (see console/Kong logs)"
      );
      setTimeout(() => setFhirUploadMessage(null), 4000);
    });
  };

  const handleExportFhirBundle = () => {
    try {
      const ctx = {
        encounterId,
        encounterDate,
        encounterType,
        patientId,
        providerId,
        history,
        examination,
        investigations,
        medications,
        assessment,
        plan,
      };

      const bundle = buildFhirBundleForSteps1to3(
        ctx,
        encounterId || undefined
      );

      // Best-effort upload to backend FHIR service via Kong.
      // Use the result only for a lightweight toast/log.
      void uploadFhirBundleToServer(bundle).then((ok) => {
        setFhirUploadIsError(!ok);
        setFhirUploadMessage(
          ok
            ? "FHIR bundle upload succeeded via gateway"
            : "FHIR bundle upload failed (see console/Kong logs)"
        );
        setTimeout(() => setFhirUploadMessage(null), 4000);
      });
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/fhir+json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeEncounterId = encounterId || "draft";
      link.href = url;
      link.download = `encounter-${safeEncounterId}-all-steps-${timestamp}.bundle.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Non-invasive: log only, do not affect clinical workflow
      // eslint-disable-next-line no-console
      console.error("Failed to export FHIR bundle", error);
    }
  };

  const handleExportNdjson = () => {
    try {
      const ctx = {
        encounterId,
        encounterDate,
        encounterType,
        patientId,
        providerId,
        history,
        examination,
        investigations,
        medications,
        assessment,
        plan,
      };

      const {
        encounterNdjson,
        conditionNdjson,
        observationNdjson,
        medicationStatementNdjson,
        procedureNdjson,
        immunizationNdjson,
        familyMemberHistoryNdjson,
        serviceRequestNdjson,
        diagnosticReportNdjson,
        medicationRequestNdjson,
        carePlanNdjson,
      } = exportEncounterNdjsonForSteps1to3(ctx);

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeEncounterId = encounterId || "draft";

      const downloadNdjson = (content: string, resourceType: string) => {
        if (!content) return;
        const blob = new Blob(
          [content.endsWith("\n") ? content : `${content}\n`],
          {
            type: "application/fhir+ndjson",
          }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `encounter-${safeEncounterId}-all-steps-${resourceType}-${timestamp}.ndjson`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      };

      downloadNdjson(encounterNdjson, "Encounter");
      downloadNdjson(conditionNdjson, "Condition");
      downloadNdjson(observationNdjson, "Observation");
      downloadNdjson(medicationStatementNdjson, "MedicationStatement");
      downloadNdjson(procedureNdjson, "Procedure");
      downloadNdjson(immunizationNdjson, "Immunization");
      downloadNdjson(familyMemberHistoryNdjson, "FamilyMemberHistory");
      downloadNdjson(serviceRequestNdjson, "ServiceRequest");
      downloadNdjson(diagnosticReportNdjson, "DiagnosticReport");
      downloadNdjson(medicationRequestNdjson, "MedicationRequest");
      downloadNdjson(carePlanNdjson, "CarePlan");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to export NDJSON", error);
    } finally {
      setShowMoreMenu(false);
    }
  };

  const handleSaveExportLocally = () => {
    try {
      const ctx = {
        encounterId,
        encounterDate,
        encounterType,
        patientId,
        providerId,
        history,
        examination,
        investigations,
        medications,
        assessment,
        plan,
      };

      const bundle = buildFhirBundleForSteps1to3(ctx, encounterId || undefined);
      const ndjson = exportEncounterNdjsonForSteps1to3(ctx);

      saveFhirExportToLocal({
        encounterId,
        patientId,
        providerId,
        bundle,
        ndjson,
        source: "provider-portal",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save FHIR export locally", error);
    } finally {
      setShowMoreMenu(false);
    }
  };

  return (
    <div className={styles.container}>
      <AutoSaveManager debounceMs={3000} />
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Clinical Encounter Editor</h1>
          <div className={styles.encounterInfo}>
            {encounterId && <span>Encounter ID: {encounterId}</span>}
            {patientId && <span>Patient ID: {patientId}</span>}
            {providerId && <span>Provider ID: {providerId}</span>}
          </div>
          <div className={styles.encounterInfo}>
            <label>
              Test Patient:
              <select
                value={patientId || TEST_PATIENTS[0].id}
                onChange={(e) => setPatientId(e.target.value)}
              >
                {TEST_PATIENTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            onClick={() => setUseWizard((v) => !v)}
            className={`${styles.button}`}
            type="button"
          >
            {useWizard ? "Use Tabbed Editor" : "Use Clinical Flow Wizard"}
          </button>
          <button
            onClick={handleExportFhirBundle}
            className={`${styles.button}`}
            type="button"
          >
            ⬇️ Export FHIR Bundle (All Steps)
          </button>
          <div className={styles.moreMenu}>
            <button
              onClick={() => setShowMoreMenu((v) => !v)}
              className={`${styles.button}`}
              type="button"
            >
              More ▾
            </button>
            {showMoreMenu && (
              <div className={styles.moreMenuPopover}>
                <button
                  type="button"
                  onClick={handleExportNdjson}
                  className={styles.moreMenuItem}
                >
                  Export NDJSON (All Steps)
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`${styles.button} ${styles.saveButton}`}
            type="button"
          >
            {isSaving ? "💾 Saving..." : "💾 Save"}
          </button>
          <button
            onClick={handlePrint}
            className={`${styles.button} ${styles.printButton}`}
            type="button"
          >
            🖨️ Print
          </button>
          <button
            onClick={handleCheckFhirHealth}
            className={`${styles.button}`}
            type="button"
          >
            🔎 Check FHIR Health
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
      {saveStatus !== "idle" && (
        <div className={`${styles.statusMessage} ${styles[saveStatus]}`}>
          {saveMessage}
        </div>
      )}
      {fhirUploadMessage && (
        <div
          className={styles.statusMessage}
          style={{
            marginTop: 8,
            backgroundColor: fhirUploadIsError ? "#FEE2E2" : "#ECFDF3",
            color: fhirUploadIsError ? "#B91C1C" : "#166534",
          }}
        >
          {fhirUploadMessage}
        </div>
      )}

      {/* Tabs - hidden when wizard mode is active */}
      {!useWizard && (
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
                type="button"
              >
                <span className={styles.tabIcon}>{tab.icon}</span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className={styles.content}>
        {useWizard && (
          <div className={styles.tabContent}>
            <ClinicalFlowWizard />
          </div>
        )}

        {!useWizard && (
          <>
            {/* SOAP Tab */}
            {activeTab === "soap" && (
              <div className={styles.tabContent}>
                <h2>SOAP Note</h2>
                <SOAPEditor />
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className={styles.tabContent}>
                <h2>Patient History</h2>
                <ChiefComplaintInput />
                <HistoryOfPresentIllness />
                <PastMedicalHistory />
                <MedicationHistory />
                <SurgicalHistory />
                <ObgynHistory />
                <ImmunizationHistory />
                <FamilyHistory />
                <SocialHistory />
                <ReviewOfSystems />
              </div>
            )}

            {/* Examination Tab */}
            {activeTab === "examination" && (
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
            {activeTab === "investigations" && (
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

                <div
                  style={{
                    marginTop: 16,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                      Investigations Preview (New)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowInvestigationPreview((v) => !v)}
                      className={`${styles.button}`}
                    >
                      {showInvestigationPreview ? "Hide" : "Show"}
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
            {activeTab === "medications" && (
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

                <div
                  style={{
                    marginTop: 16,
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>
                      Medications Preview (New)
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowMedicationPreview((v) => !v)}
                      className={`${styles.button}`}
                    >
                      {showMedicationPreview ? "Hide" : "Show"}
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
          </>
        )}

        <div
          style={{
            marginTop: 24,
            border: "1px solid var(--color-border-light)",
            borderRadius: 12,
            padding: 16,
            background: "rgba(255,255,255,0.95)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: 8 }}>
            All Steps FHIR Export
          </h3>
          <p style={{ marginBottom: 12, color: "#64748B", fontSize: 14 }}>
            Export a FHIR Bundle and NDJSON streams covering all 15 steps of the
            clinical flow, including history, examination, investigations,
            medications, and advice/care plan.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={handleExportFhirBundle}
              className={`${styles.button}`}
            >
              ⬇️ Download FHIR Bundle (All Steps)
            </button>
            <button
              type="button"
              onClick={handleExportNdjson}
              className={`${styles.button}`}
            >
              ⬇️ Download NDJSON (All Steps)
            </button>
          </div>
        </div>
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
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
