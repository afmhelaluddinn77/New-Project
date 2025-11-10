import React from 'react'

export type PrescriptionHeaderProps = {
  phone?: string
  email?: string
}

export default function PrescriptionHeader({ phone, email }: PrescriptionHeaderProps) {
  return (
    <header className="prescription-header">
      <div className="ph-left">
        <div className="ph-title-bn">ডাঃ আ. এফ. এম. হেলাল উদ্দিন</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>এমবিবিএস, এমআরসিপি (লন্ডন)</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>বিশেষত্ব: মেডিসিন, গ্যাস্ট্রোএন্টারোলজি</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>সহযোগী অধ্যাপক, বিভাগ: মেডিসিন</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>স্যার সলিমুল্লাহ মেডিকেল কলেজ ও মিটফোর্ড হাসপাতাল (এসএসএমসি অ্যান্ড এমএইচ), ঢাকা</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>ফেলো: রয়্যাল কলেজ অব ফিজিশিয়ানস (লন্ডন), আমেরিকান কলেজ অব ফিজিশিয়ানস</div>
      </div>
      <div className="ph-right">
        <div className="ph-title-en">Dr. A. F. M. Helal Uddin</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>MBBS, MRCP (London)</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>Specialty: Medicine, Gastroenterology</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>Associate Professor, Department of Medicine</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>Sir Salimullah Medical College & Mitford Hospital (SSMC & MH), Dhaka</div>
        <div style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#1f2937' }}>Fellow: RCP (London), ACP (USA)</div>
        {(phone || email) && (
          <div className="ph-contact">
            {phone && <span>Phone: {phone}</span>}
            {phone && email && <span> • </span>}
            {email && <span>Email: {email}</span>}
          </div>
        )}
      </div>
    </header>
  )
}

