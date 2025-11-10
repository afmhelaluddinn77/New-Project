import React from 'react'
import { HOSPITAL_INFO } from '../config/prescriptionBrand'
import '../styles/prescription-print.css'

export default function PrescriptionFooter() {
  return (
    <footer className="prescription-footer">
      {/* English (Left) */}
      <div className="pf-left">
        <div className="pf-brand">
          {HOSPITAL_INFO.en.name} — <span className="pf-muted">{HOSPITAL_INFO.en.tagline}</span>
        </div>
        <div className="pf-line">{HOSPITAL_INFO.en.address}</div>
        <div className="pf-line">{HOSPITAL_INFO.en.phone1}</div>
        <div className="pf-line">{HOSPITAL_INFO.en.phone2}</div>
      </div>

      {/* Bangla (Right) */}
      <div className="pf-right">
        <div className="pf-brand-bn">
          {HOSPITAL_INFO.bn.name} — <span className="pf-muted">{HOSPITAL_INFO.bn.tagline}</span>
        </div>
        <div className="pf-line">{HOSPITAL_INFO.bn.address}</div>
        <div className="pf-line">{HOSPITAL_INFO.bn.phone1}</div>
        <div className="pf-line">{HOSPITAL_INFO.bn.phone2}</div>
      </div>
    </footer>
  )
}
