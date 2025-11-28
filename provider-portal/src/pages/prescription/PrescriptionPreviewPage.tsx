import { PrescriptionDetail } from "@/components/prescriptions/PrescriptionDetail";
import { ErrorState } from "@/components/shared/ErrorBoundary";
import { LoadingState } from "@/components/shared/LoadingState";
import { usePrescription } from "@/hooks/useEncounterQueries";
import { useParams } from "react-router-dom";
import {
  PrescriptionFooter,
  PrescriptionHeader,
} from "../../features/encounter/components";
import "./PrescriptionPreviewPage.css";

export default function PrescriptionPreviewPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>();
  const {
    data: prescription,
    isLoading,
    error,
  } = usePrescription(prescriptionId ?? null);

  return (
    <div className="prescription-page">
      <div className="prescription-container">
        <PrescriptionHeader
          phone="+88 01715-872634"
          email="dr.helal.uddin@gmail.com"
        />

        <main className="prescription-preview-area">
          {/* Placeholder content area for encounter details */}
          <div className="placeholder-content">
            <p>
              <strong>Prescription body preview goes here:</strong>
            </p>
            <ul>
              <li>Chief Complaint & History of Present Illness</li>
              <li>Physical Examination Findings</li>
              <li>Investigations & Test Results</li>
              <li>Medications & Prescriptions</li>
              <li>Advice & Follow-up Instructions</li>
            </ul>
          </div>
        </main>

        <PrescriptionFooter />
      </div>

      {/* New Components Preview (Non-invasive) */}
      <div className="live-preview-section">
        <div className="live-preview-card">
          <h2 className="live-preview-title">Live Preview (New Components)</h2>
          {!prescriptionId && (
            <p className="live-preview-hint">
              Provide a prescriptionId in the route to preview details.
            </p>
          )}
          {isLoading && <LoadingState message="Loading prescription…" />}
          {error && <ErrorState error={error as Error} />}
          {prescription && <PrescriptionDetail prescription={prescription} />}
        </div>
      </div>
    </div>
  );
}
