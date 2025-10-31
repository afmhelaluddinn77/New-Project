import { useState } from 'react'
import axios from 'axios'
import { User, Lock, AlertCircle, Pill } from 'lucide-react'
import './PharmacyLoginPage.css'
import { setAuthToken } from '../services/httpClient'

function PharmacyLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password,
        portalType: 'PHARMACY'
      })

      setAuthToken(response.data.access_token)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-icon">
            <Pill size={48} strokeWidth={2} />
          </div>
          <h1 className="branding-title">Pharmacy Portal</h1>
          <p className="branding-subtitle">
            Medication management and prescription fulfillment services.
          </p>
          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Prescription Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Drug Interaction Checks</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Inventory Control</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Patient Counseling</span>
            </div>
          </div>
        </div>
        <div className="branding-footer">
          <p>HIPAA Compliant • Secure • Available 24/7</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="pharmacy@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Need help? <a href="#">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacyLoginPage
