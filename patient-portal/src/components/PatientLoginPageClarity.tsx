import { useState } from 'react'
import { User, Lock, AlertCircle, Heart, Eye, EyeOff, Shield, Clock, Phone, Mail, Activity, CheckCircle } from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'
import './PatientLoginPageClarity.css'

interface LoginFormData {
  email: string
  password: string
  rememberDevice: boolean
}

interface TrustBadge {
  icon: React.ComponentType<{ className?: string }>
  text: string
}

const trustBadges: TrustBadge[] = [
  { icon: Shield, text: 'HIPAA Compliant' },
  { icon: Lock, text: '256-bit Encryption' },
  { icon: Shield, text: 'SOC 2 Certified' },
  { icon: Clock, text: '24/7 Monitoring' }
]

const emergencyContacts = [
  { icon: Phone, text: 'Emergency: 1-800-MEDICAL', href: 'tel:1-800-MEDICAL' },
  { icon: Mail, text: 'Support: support@emr-system.com', href: 'mailto:support@emr-system.com' }
]

export default function PatientLoginPageClarity() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberDevice: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulate API call
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          portalType: 'PATIENT'
        })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      localStorage.setItem('token', data.access_token)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patient-login-page" style={{ backgroundColor: 'white' }}>
      <div className="patient-login-container">
        {/* Left Side - Enhanced Branding */}
        <div className="patient-login-branding">
          <div className="patient-login-branding-content">
            <div className="patient-login-branding-header">
              <div className="patient-login-branding-icon">
                <Heart />
              </div>
              <h1 className="patient-login-branding-title" style={{ color: '#333', fontSize: 24, fontWeight: 600 }}>Patient Portal</h1>
              <p className="patient-login-branding-subtitle" style={{ color: '#666', fontSize: 16, fontWeight: 400 }}>
                Your health, at your fingertips. Secure access to your medical records, 
                appointments, and healthcare team.
              </p>
            </div>

            <div className="patient-login-branding-features">
              <h3 style={{ color: '#333', fontSize: 18, fontWeight: 600 }}>Everything You Need</h3>
              <div className="patient-login-features-grid">
                <div className="patient-login-feature-item">
                  <div className="patient-login-feature-icon">
                    <User />
                  </div>
                  <div>
                    <h4 style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Medical Records</h4>
                    <p style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>Access your complete health history</p>
                  </div>
                </div>
                <div className="patient-login-feature-item">
                  <div className="patient-login-feature-icon">
                    <Clock />
                  </div>
                  <div>
                    <h4 style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Appointments</h4>
                    <p style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>Schedule and manage your visits</p>
                  </div>
                </div>
                <div className="patient-login-feature-item">
                  <div className="patient-login-feature-icon">
                    <Mail />
                  </div>
                  <div>
                    <h4 style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Lab Results</h4>
                    <p style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>View test results securely</p>
                  </div>
                </div>
                <div className="patient-login-feature-item">
                  <div className="patient-login-feature-icon">
                    <Phone />
                  </div>
                  <div>
                    <h4 style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Secure Messaging</h4>
                    <p style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>Communicate with your providers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="patient-login-trust-badges">
              <div className="patient-login-trust-title">
                <Shield />
                <span style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Your Health Information is Protected</span>
              </div>
              <div className="patient-login-trust-grid">
                {trustBadges.map((badge, index) => (
                  <div key={index} className="patient-login-trust-item">
                    <badge.icon />
                    <span style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="patient-login-form-section">
          <div className="patient-login-form-container">
            <div className="patient-login-form-header">
              <div className="patient-login-form-header-content">
                <div>
                  <h2 style={{ color: '#333', fontSize: 24, fontWeight: 600 }}>Welcome Back</h2>
                  <p style={{ color: '#666', fontSize: 16, fontWeight: 400 }}>Sign in to access your patient portal</p>
                </div>
                <DarkModeToggle />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="clarity-alert clarity-alert-error">
                <AlertCircle className="clarity-alert-icon" />
                <div className="clarity-alert-content">
                  <div className="clarity-alert-title" style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>Login Error</div>
                  <div className="clarity-alert-message" style={{ color: '#666', fontSize: 14, fontWeight: 400 }}>{error}</div>
                </div>
              </div>
            )}

            {/* Enhanced Login Form */}
            <form className="patient-login-form" onSubmit={handleSubmit}>
              <div className="patient-login-form-group">
                <label className="clarity-label" htmlFor="email" style={{ color: '#333', fontSize: 16, fontWeight: 600 }}>
                  Email Address
                </label>
                <div className="patient-login-input-wrapper">
                  <User className="patient-login-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="clarity-input"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="patient-login-form-group">
                <label className="clarity-label" htmlFor="password">
                  Password
                </label>
                <div className="patient-login-input-wrapper">
                  <Lock className="patient-login-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="clarity-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="patient-login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="patient-login-form-options">
                <label className="patient-login-checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="rememberDevice"
                    checked={formData.rememberDevice}
                    onChange={handleInputChange}
                  />
                  <span>Remember this device</span>
                </label>
                <a href="#forgot-password" className="patient-login-forgot-link">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="clarity-button clarity-button-primary patient-login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="patient-login-spinner"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Alternative Login Options */}
            <div className="patient-login-alternatives">
              <div className="patient-login-divider">
                <span>or continue with</span>
              </div>
              <div className="patient-login-alternative-buttons">
                <button className="clarity-button clarity-button-secondary patient-login-biometric-button">
                  <Shield />
                  Biometric Login
                </button>
                <button className="clarity-button clarity-button-secondary patient-login-emergency-button">
                  <AlertCircle />
                  Emergency Access
                </button>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="patient-login-emergency">
              <h4>Need Help?</h4>
              <div className="patient-login-emergency-contacts">
                {emergencyContacts.map((contact, index) => (
                  <a key={index} href={contact.href} className="patient-login-emergency-contact">
                    <contact.icon />
                    <span>{contact.text}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Login Footer */}
            <div className="patient-login-footer">
              <p>
                Don't have an account?{' '}
                <a href="#register">Contact your healthcare provider</a>
              </p>
              <div className="patient-login-footer-links">
                <a href="#privacy">Privacy Policy</a>
                <span>•</span>
                <a href="#terms">Terms of Service</a>
                <span>•</span>
                <a href="#accessibility">Accessibility</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
