import { Heart, Stethoscope, Shield, Activity, Pill, FileText, Users, Settings, ChevronRight, Lock, CheckCircle, Clock, Globe } from 'lucide-react'
import './CommonPortalPage.css'

interface PortalCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  url: string
  color: string
  features: string[]
}

const portalCards: PortalCard[] = [
  {
    id: 'patient',
    title: 'Patient Portal',
    description: 'Access your medical records, schedule appointments, and communicate with your healthcare team.',
    icon: Heart,
    url: 'http://localhost:5173',
    color: 'var(--color-primary-500)',
    features: ['Medical Records', 'Appointment Scheduling', 'Lab Results', 'Secure Messaging']
  },
  {
    id: 'provider',
    title: 'Provider Portal',
    description: 'Comprehensive clinical workflow management for healthcare professionals.',
    icon: Stethoscope,
    url: 'http://localhost:5174',
    color: 'var(--color-success-500)',
    features: ['Patient Queue', 'Clinical Notes', 'Order Management', 'Care Coordination']
  },
  {
    id: 'admin',
    title: 'Admin Portal',
    description: 'System administration and operational oversight for healthcare facilities.',
    icon: Shield,
    url: 'http://localhost:5175',
    color: 'var(--color-warning-500)',
    features: ['User Management', 'System Health', 'Compliance Tracking', 'Resource Planning']
  },
  {
    id: 'lab',
    title: 'Laboratory Portal',
    description: 'Efficient lab workflow management and result processing.',
    icon: Activity,
    url: 'http://localhost:5176',
    color: 'var(--color-info-500)',
    features: ['Sample Tracking', 'Result Entry', 'Quality Control', 'Worklist Management']
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy Portal',
    description: 'Medication management and prescription fulfillment system.',
    icon: Pill,
    url: 'http://localhost:5177',
    color: 'var(--color-error-500)',
    features: ['Prescription Queue', 'Inventory Management', 'Drug Interactions', 'Patient Counseling']
  },
  {
    id: 'billing',
    title: 'Billing Portal',
    description: 'Financial management and insurance claims processing.',
    icon: FileText,
    url: 'http://localhost:5178',
    color: 'var(--color-text-secondary)',
    features: ['Claims Processing', 'Revenue Tracking', 'Insurance Analytics', 'Patient Billing']
  },
  {
    id: 'radiology',
    title: 'Radiology Portal',
    description: 'Imaging workflow management and diagnostic reporting.',
    icon: Users,
    url: 'http://localhost:5179',
    color: 'var(--color-primary-600)',
    features: ['Study Queue', 'Image Viewing', 'Report Generation', 'Quality Assurance']
  },
  {
    id: 'system',
    title: 'System Settings',
    description: 'Platform configuration and technical management.',
    icon: Settings,
    url: '#',
    color: 'var(--color-text-tertiary)',
    features: ['Configuration', 'Integration', 'Security Settings', 'System Monitoring']
  }
]

const trustBadges = [
  { icon: Lock, text: 'HIPAA Compliant' },
  { icon: CheckCircle, text: 'SOC 2 Certified' },
  { icon: Shield, text: '256-bit Encryption' },
  { icon: Globe, text: '24/7 Availability' }
]

const healthStats = [
  { value: '10,000+', label: 'Daily Active Users' },
  { value: '99.9%', label: 'System Uptime' },
  { value: '< 2s', label: 'Average Response Time' },
  { value: '50M+', label: 'Protected Health Records' }
]

export default function CommonPortalPage() {
  return (
    <div className="common-portal">
      {/* Header */}
      <header className="common-portal-header">
        <div className="common-portal-container">
          <div className="common-portal-brand">
            <div className="common-portal-logo">
              <Heart className="common-portal-logo-icon" />
            </div>
            <div>
              <h1 className="common-portal-title">EMR/HMS System</h1>
              <p className="common-portal-subtitle">Your Complete Healthcare Management Solution</p>
            </div>
          </div>
          <nav className="common-portal-nav">
            <a href="#portals" className="clarity-button clarity-button-secondary">
              Access Portals
            </a>
            <a href="#contact" className="clarity-button clarity-button-primary">
              Get Support
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="common-portal-hero">
        <div className="common-portal-container">
          <div className="common-portal-hero-content">
            <div className="common-portal-hero-text">
              <h2 className="common-portal-hero-title">
                Secure, Unified Access to All Your Medical Services
              </h2>
              <p className="common-portal-hero-description">
                Experience the next generation of healthcare management with our integrated platform. 
                Designed for clarity, performance, and clinical excellence.
              </p>
              <div className="common-portal-hero-actions">
                <a href="#portals" className="clarity-button clarity-button-primary clarity-button-large">
                  Get Started
                  <ChevronRight className="common-portal-button-icon" />
                </a>
                <a href="#features" className="clarity-button clarity-button-tertiary clarity-button-large">
                  Learn More
                </a>
              </div>
            </div>
            <div className="common-portal-hero-visual">
              <div className="common-portal-hero-card">
                <div className="common-portal-hero-icon">
                  <Shield />
                </div>
                <h3>Healthcare-Grade Security</h3>
                <p>Enterprise-level protection for sensitive patient data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="common-portal-trust">
        <div className="common-portal-container">
          <div className="common-portal-trust-grid">
            {trustBadges.map((badge, index) => (
              <div key={index} className="common-portal-trust-item">
                <badge.icon className="common-portal-trust-icon" />
                <span className="common-portal-trust-text">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Statistics */}
      <section className="common-portal-stats">
        <div className="common-portal-container">
          <div className="common-portal-stats-grid">
            {healthStats.map((stat, index) => (
              <div key={index} className="common-portal-stat-item">
                <div className="common-portal-stat-value">{stat.value}</div>
                <div className="common-portal-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards Grid */}
      <section id="portals" className="common-portal-section">
        <div className="common-portal-container">
          <div className="common-portal-section-header">
            <h2 className="common-portal-section-title">Choose Your Portal</h2>
            <p className="common-portal-section-description">
              Select the appropriate portal based on your role and requirements
            </p>
          </div>
          
          <div className="common-portal-grid">
            {portalCards.map((portal) => {
              const Icon = portal.icon

              return (
                <div
                  key={portal.id}
                  className="common-portal-card"
                >
                  <div className="common-portal-card-header">
                    <div 
                      className="common-portal-card-icon"
                      style={{ color: portal.color }}
                    >
                      <Icon />
                    </div>
                    <h3 className="common-portal-card-title">{portal.title}</h3>
                  </div>
                  
                  <p className="common-portal-card-description">
                    {portal.description}
                  </p>
                  
                  <div className="common-portal-card-features">
                    {portal.features.map((feature, index) => (
                      <div key={index} className="common-portal-feature-item">
                        <CheckCircle className="common-portal-feature-icon" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="common-portal-card-footer">
                    <a 
                      href={portal.url}
                      className="clarity-button clarity-button-primary common-portal-card-button"
                      style={{ 
                        backgroundColor: portal.color,
                        borderColor: portal.color 
                      }}
                    >
                      Access Portal
                      <ChevronRight className="common-portal-button-icon" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="common-portal-emergency">
        <div className="common-portal-container">
          <div className="common-portal-emergency-content">
            <div className="common-portal-emergency-text">
              <h2 className="common-portal-emergency-title">
                Emergency Access Available
              </h2>
              <p className="common-portal-emergency-description">
                For urgent medical situations, emergency access to critical patient information 
                is available 24/7 with proper authentication.
              </p>
              <div className="common-portal-emergency-actions">
                <button className="clarity-button clarity-button-destructive">
                  Emergency Access
                </button>
                <a href="tel:1-800-MEDICAL" className="clarity-button clarity-button-secondary">
                  Call: 1-800-MEDICAL
                </a>
              </div>
            </div>
            <div className="common-portal-emergency-visual">
              <Clock className="common-portal-emergency-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="common-portal-footer">
        <div className="common-portal-container">
          <div className="common-portal-footer-content">
            <div className="common-portal-footer-brand">
              <div className="common-portal-footer-logo">
                <Heart className="common-portal-footer-logo-icon" />
              </div>
              <div>
                <h3 className="common-portal-footer-title">EMR/HMS System</h3>
                <p className="common-portal-footer-subtitle">
                  Healthcare management with clarity and precision
                </p>
              </div>
            </div>
            
            <div className="common-portal-footer-links">
              <div className="common-portal-footer-section">
                <h4>Support</h4>
                <ul>
                  <li><a href="#help">Help Center</a></li>
                  <li><a href="#training">Training Resources</a></li>
                  <li><a href="#contact">Contact Support</a></li>
                  <li><a href="#status">System Status</a></li>
                </ul>
              </div>
              
              <div className="common-portal-footer-section">
                <h4>Security</h4>
                <ul>
                  <li><a href="#hipaa">HIPAA Compliance</a></li>
                  <li><a href="#privacy">Privacy Policy</a></li>
                  <li><a href="#security">Security Features</a></li>
                  <li><a href="#audit">Audit Logs</a></li>
                </ul>
              </div>
              
              <div className="common-portal-footer-section">
                <h4>Resources</h4>
                <ul>
                  <li><a href="#api">API Documentation</a></li>
                  <li><a href="#integration">Integration Guide</a></li>
                  <li><a href="#updates">System Updates</a></li>
                  <li><a href="#feedback">Feedback</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="common-portal-footer-bottom">
            <p>&copy; 2024 EMR/HMS System. All rights reserved.</p>
            <div className="common-portal-footer-legal">
              <a href="#terms">Terms of Service</a>
              <a href="#privacy">Privacy Policy</a>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
