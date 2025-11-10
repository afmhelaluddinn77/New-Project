import React from 'react'
import { useParams } from 'react-router-dom'
import { PrescriptionHeader, PrescriptionFooter } from '../../features/encounter/components'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorBoundary'
import { usePrescription } from '@/hooks/useEncounterQueries'
import { PrescriptionDetail } from '@/components/prescriptions/PrescriptionDetail'

export default function PrescriptionPreviewPage() {
  const { prescriptionId } = useParams<{ prescriptionId: string }>()
  const { data: prescription, isLoading, error } = usePrescription(prescriptionId ?? null)
  
  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', padding: '24px' }}>
      <div className="prescription-container">
        <PrescriptionHeader phone="+88 01715-872634" email="dr.helal.uddin@gmail.com" />

        <main style={{ minHeight: 400, padding: '16px 0' }}>
          {/* Placeholder content area for encounter details */}
          <div style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', padding: '16px', background: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
            <p><strong>Prescription body preview goes here:</strong></p>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
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
      <div style={{ marginTop: 24 }}>
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Live Preview (New Components)</h2>
          {!prescriptionId && (
            <p style={{ color: '#6b7280' }}>Provide a prescriptionId in the route to preview details.</p>
          )}
          {isLoading && <LoadingState message="Loading prescription…" />}
          {error && <ErrorState error={error as Error} />}
          {prescription && (
            <PrescriptionDetail prescription={prescription} />
          )}
        </div>
      </div>
    </div>
  )
}



