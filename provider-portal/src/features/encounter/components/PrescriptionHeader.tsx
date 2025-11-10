import React from 'react'
import { DOCTOR_INFO } from '../config/prescriptionBrand'
import '../styles/prescription-print.css'

export interface PrescriptionHeaderProps {
  phone?: string
  email?: string
}

export default function PrescriptionHeader({ phone, email }: PrescriptionHeaderProps) {
  return (
    <header className="prescription-header">
      {/* Bangla (Left) */}
      <div className="ph-left">
        <div className="ph-title-bn">{DOCTOR_INFO.bn.name}</div>
        <div className="ph-line">{DOCTOR_INFO.bn.degree}</div>
        <div className="ph-line">{DOCTOR_INFO.bn.specialty}</div>
        <div className="ph-line">{DOCTOR_INFO.bn.position}</div>
        <div className="ph-line">{DOCTOR_INFO.bn.institution}</div>
        <div className="ph-line">{DOCTOR_INFO.bn.fellowship}</div>
      </div>

      {/* English (Right) */}
      <div className="ph-right">
        <div className="ph-title-en">{DOCTOR_INFO.en.name}</div>
        <div className="ph-line">{DOCTOR_INFO.en.degree}</div>
        <div className="ph-line">{DOCTOR_INFO.en.specialty}</div>
        <div className="ph-line">{DOCTOR_INFO.en.position}</div>
        <div className="ph-line">{DOCTOR_INFO.en.institution}</div>
        <div className="ph-line">{DOCTOR_INFO.en.fellowship}</div>
        
        {/* Contact Info */}
        {(phone || email) && (
          <div className="ph-contact">
            {phone && <span>{phone}</span>}
            {phone && email && <span> • </span>}
            {email && <span>{email}</span>}
          </div>
        )}
      </div>
    </header>
  )
}
