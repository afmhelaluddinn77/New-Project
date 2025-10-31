import PortalCard from './PortalCard'
import './LandingPage.css'

const PORTALS = [
  {
    id: 'patient',
    name: 'Patient Portal',
    url: 'http://localhost:5173/login',
    icon: 'User',
    color: '#7FB3FF',
    description: 'Access your medical records and appointments'
  },
  {
    id: 'provider',
    name: 'Provider Portal',
    url: 'http://localhost:5174/login',
    icon: 'Stethoscope',
    color: '#6FD9B8',
    description: 'Healthcare provider dashboard'
  },
  {
    id: 'admin',
    name: 'Admin Portal',
    url: 'http://localhost:5175/login',
    icon: 'Shield',
    color: '#B19EED',
    description: 'System administration'
  },
  {
    id: 'lab',
    name: 'Lab Portal',
    url: 'http://localhost:5176/login',
    icon: 'FlaskConical',
    color: '#6DD4E7',
    description: 'Laboratory management'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Portal',
    url: 'http://localhost:5177/login',
    icon: 'Pill',
    color: '#8FAFF5',
    description: 'Pharmacy operations'
  },
  {
    id: 'billing',
    name: 'Billing Portal',
    url: 'http://localhost:5178/login',
    icon: 'CreditCard',
    color: '#7B9FE5',
    description: 'Financial and billing management'
  },
  {
    id: 'radiology',
    name: 'Radiology Portal',
    url: 'http://localhost:5179/login',
    icon: 'Scan',
    color: '#C4A7FF',
    description: 'Medical imaging services'
  }
]

function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-background">
        <div className="medical-grid"></div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
      </div>
      
      <div className="landing-content">
        <header className="landing-header">
          <div className="logo-container">
            <div className="logo-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 4L24 44M4 24L44 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div>
              <h1 className="landing-title">EMR/HMS Portal Hub</h1>
              <p className="landing-subtitle">Healthcare Management System</p>
            </div>
          </div>
          <p className="landing-description">
            Secure access to all healthcare portals. Select your role to continue.
          </p>
        </header>
        
        <main className="portals-grid">
          {PORTALS.map((portal) => (
            <PortalCard key={portal.id} {...portal} />
          ))}
        </main>
        
        <footer className="landing-footer">
          <p>HIPAA Compliant • Secure Authentication • 24/7 Support</p>
        </footer>
      </div>
    </div>
  )
}

export default LandingPage

