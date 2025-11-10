import React from 'react'
import { PrescriptionHeader, PrescriptionFooter } from '../../features/encounter/components'

export default function EncounterEditorPage() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: '#fff', padding: 16, borderRadius: 12 }}>
      {/* Left: Editor form skeleton */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Encounter Editor (Skeleton)</h2>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>History</h3>
          <textarea placeholder="Chief complaint, HPI..." rows={6} style={{ width: '100%' }} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Physical Examination</h3>
          <textarea placeholder="Vitals, general, system findings..." rows={4} style={{ width: '100%' }} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Investigations</h3>
          <textarea placeholder="Orders / Results notes" rows={4} style={{ width: '100%' }} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Medications</h3>
          <textarea placeholder="Drug, dose, route, frequency, duration" rows={4} style={{ width: '100%' }} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginBottom: 8 }}>Advice</h3>
          <textarea placeholder="Diet/lifestyle/follow-up" rows={3} style={{ width: '100%' }} />
        </div>
      </section>

      {/* Right: Live Preview skeleton */}
      <section className="prescription-container" style={{ border: '1px solid #e5e7eb' }}>
        <PrescriptionHeader phone="+88 01715-872634" email="dr.helal.uddin@gmail.com" />
        <div style={{ color: '#6b7280', fontSize: 14, minHeight: 300 }}>
          Live preview will render the entered sections here.
        </div>
        <PrescriptionFooter />
      </section>
    </div>
  )
}

