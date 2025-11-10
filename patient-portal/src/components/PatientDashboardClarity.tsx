import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, Calendar, FileText, Pill, Users, Activity, 
  ChevronRight, AlertCircle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Phone, Mail, MapPin,
  Plus, Filter, Search, Bell, User, LogOut, Menu
} from 'lucide-react'
import DarkModeToggle from './DarkModeToggle'
import './PatientDashboardClarity.css'

interface VitalSign {
  id: string
  name: string
  value: string
  unit: string
  status: 'normal' | 'caution' | 'critical'
  trend: 'up' | 'down' | 'stable'
  date: string
}

interface Appointment {
  id: string
  type: string
  provider: string
  date: string
  time: string
  location: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

interface LabResult {
  id: string
  testName: string
  date: string
  status: 'normal' | 'abnormal' | 'pending'
  value?: string
  range?: string
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  refillsRemaining: number
  nextRefillDate: string
  status: 'active' | 'expiring' | 'expired'
}

interface CareTeamMember {
  id: string
  name: string
  role: string
  photo: string
  contact: string
}

const vitalSigns: VitalSign[] = [
  { id: '1', name: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', trend: 'stable', date: '2024-01-15' },
  { id: '2', name: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', trend: 'stable', date: '2024-01-15' },
  { id: '3', name: 'Temperature', value: '98.6', unit: '°F', status: 'normal', trend: 'down', date: '2024-01-15' },
  { id: '4', name: 'Blood Sugar', value: '95', unit: 'mg/dL', status: 'caution', trend: 'up', date: '2024-01-15' }
]

const appointments: Appointment[] = [
  { id: '1', type: 'General Checkup', provider: 'Dr. Sarah Johnson', date: '2024-01-20', time: '10:00 AM', location: 'Main Clinic', status: 'upcoming' },
  { id: '2', type: 'Cardiology Follow-up', provider: 'Dr. Michael Chen', date: '2024-01-25', time: '2:30 PM', location: 'Heart Center', status: 'upcoming' },
  { id: '3', type: 'Lab Work', provider: 'Lab Services', date: '2024-01-18', time: '8:00 AM', location: 'Laboratory', status: 'upcoming' }
]

const labResults: LabResult[] = [
  { id: '1', testName: 'Complete Blood Count', date: '2024-01-15', status: 'normal' },
  { id: '2', testName: 'Lipid Panel', date: '2024-01-15', status: 'abnormal', value: '220', range: '<200 mg/dL' },
  { id: '3', testName: 'Hemoglobin A1c', date: '2024-01-10', status: 'normal', value: '5.8%', range: '<5.7%' }
]

const medications: Medication[] = [
  { id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', refillsRemaining: 3, nextRefillDate: '2024-02-01', status: 'active' },
  { id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', refillsRemaining: 1, nextRefillDate: '2024-01-20', status: 'expiring' },
  { id: '3', name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', refillsRemaining: 5, nextRefillDate: '2024-03-01', status: 'active' }
]

const careTeam: CareTeamMember[] = [
  { id: '1', name: 'Dr. Sarah Johnson', role: 'Primary Care Physician', photo: 'https://picsum.photos/seed/sarah/48/48.jpg', contact: 'sarah.johnson@clinic.com' },
  { id: '2', name: 'Dr. Michael Chen', role: 'Cardiologist', photo: 'https://picsum.photos/seed/michael/48/48.jpg', contact: 'michael.chen@heart.com' },
  { id: '3', name: 'Emily Rodriguez', role: 'Nurse Practitioner', photo: 'https://picsum.photos/seed/emily/48/48.jpg', contact: 'emily.r@clinic.com' }
]

export default function PatientDashboardClarity() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'var(--color-success-500)'
      case 'caution': return 'var(--color-warning-500)'
      case 'critical': return 'var(--color-error-500)'
      case 'abnormal': return 'var(--color-warning-500)'
      case 'pending': return 'var(--color-info-500)'
      case 'expiring': return 'var(--color-warning-500)'
      case 'expired': return 'var(--color-error-500)'
      default: return 'var(--color-text-secondary)'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'normal': return 'var(--color-success-100)'
      case 'caution': return 'var(--color-warning-100)'
      case 'critical': return 'var(--color-error-100)'
      case 'abnormal': return 'var(--color-warning-100)'
      case 'pending': return 'var(--color-info-100)'
      case 'expiring': return 'var(--color-warning-100)'
      case 'expired': return 'var(--color-error-100)'
      default: return 'var(--color-surface)'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="trend-icon trend-up" />
      case 'down': return <TrendingDown className="trend-icon trend-down" />
      default: return <Activity className="trend-icon trend-stable" />
    }
  }

  return (
    <div className="patient-dashboard">
      {/* Top Bar */}
      <header className="clarity-topbar">
        <div className="clarity-topbar-left">
          <div className="dashboard-title">
            <Heart className="dashboard-title-icon" />
            <h1>Patient Dashboard</h1>
          </div>
        </div>
        <div className="clarity-topbar-right">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search records, appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="clarity-input"
            />
          </div>
          <button className="clarity-button clarity-button-secondary">
            <Bell />
            <span className="notification-badge">3</span>
          </button>
          <button className="clarity-button clarity-button-secondary">
            <User />
          </button>
          <DarkModeToggle size="sm" />
          <button 
            className="clarity-button clarity-button-secondary"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="patient-dashboard-content">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div className="welcome-content">
            <h2>Welcome back, John!</h2>
            <p>Here's your health overview for today. Your next appointment is in 5 days.</p>
          </div>
          <div className="welcome-actions">
            <button className="clarity-button clarity-button-primary">
              <Plus />
              Schedule Appointment
            </button>
            <button className="clarity-button clarity-button-secondary">
              <Phone />
              Emergency Contact
            </button>
          </div>
        </section>

        {/* Health Overview */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Health Overview</h3>
            <div className="section-actions">
              <button className="clarity-button clarity-button-tertiary">
                <Filter />
                Filter
              </button>
              <button className="clarity-button clarity-button-tertiary">
                View All
                <ChevronRight />
              </button>
            </div>
          </div>
          
          <div className="vitals-grid">
            {vitalSigns.map((vital) => (
              <div key={vital.id} className="vital-card">
                <div className="vital-header">
                  <div className="vital-icon">
                    <Heart />
                  </div>
                  <div className="vital-status" style={{ color: getStatusColor(vital.status) }}>
                    {getTrendIcon(vital.trend)}
                    <span className="vital-status-text">{vital.status}</span>
                  </div>
                </div>
                <div className="vital-content">
                  <h4 className="vital-name">{vital.name}</h4>
                  <div className="vital-value">
                    <span className="vital-number">{vital.value}</span>
                    <span className="vital-unit">{vital.unit}</span>
                  </div>
                  <p className="vital-date">Last updated: {vital.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Upcoming Appointments */}
          <section className="dashboard-card">
            <div className="card-header">
              <h3>
                <Calendar />
                Upcoming Appointments
              </h3>
              <button className="clarity-button clarity-button-tertiary">
                View All
              </button>
            </div>
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-icon">
                    <Calendar />
                  </div>
                  <div className="appointment-content">
                    <h4>{appointment.type}</h4>
                    <p className="appointment-provider">{appointment.provider}</p>
                    <div className="appointment-details">
                      <span className="appointment-detail">
                        <Calendar />
                        {appointment.date}
                      </span>
                      <span className="appointment-detail">
                        <Clock />
                        {appointment.time}
                      </span>
                      <span className="appointment-detail">
                        <MapPin />
                        {appointment.location}
                      </span>
                    </div>
                  </div>
                  <div className="appointment-actions">
                    <button className="clarity-button clarity-button-tertiary">
                      Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Lab Results */}
          <section className="dashboard-card">
            <div className="card-header">
              <h3>
                <FileText />
                Recent Lab Results
              </h3>
              <button className="clarity-button clarity-button-tertiary">
                View All
              </button>
            </div>
            <div className="lab-results-list">
              {labResults.map((result) => (
                <div key={result.id} className="lab-result-item">
                  <div className="lab-result-icon">
                    <FileText />
                  </div>
                  <div className="lab-result-content">
                    <h4>{result.testName}</h4>
                    <p className="lab-result-date">{result.date}</p>
                    {result.value && (
                      <div className="lab-result-value">
                        <span className="value-text">{result.value}</span>
                        <span className="value-range">({result.range})</span>
                      </div>
                    )}
                  </div>
                  <div className="lab-result-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusBgColor(result.status),
                        color: getStatusColor(result.status)
                      }}
                    >
                      {result.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Medications */}
          <section className="dashboard-card">
            <div className="card-header">
              <h3>
                <Pill />
                Medications
              </h3>
              <button className="clarity-button clarity-button-tertiary">
                View All
              </button>
            </div>
            <div className="medications-list">
              {medications.map((medication) => (
                <div key={medication.id} className="medication-item">
                  <div className="medication-icon">
                    <Pill />
                  </div>
                  <div className="medication-content">
                    <h4>{medication.name}</h4>
                    <p className="medication-dosage">{medication.dosage} - {medication.frequency}</p>
                    <div className="medication-refills">
                      <span className="refills-text">
                        {medication.refillsRemaining} refills remaining
                      </span>
                      <span className="refill-date">
                        Next refill: {medication.nextRefillDate}
                      </span>
                    </div>
                  </div>
                  <div className="medication-actions">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusBgColor(medication.status),
                        color: getStatusColor(medication.status)
                      }}
                    >
                      {medication.status}
                    </span>
                    <button className="clarity-button clarity-button-primary">
                      Refill
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Care Team */}
          <section className="dashboard-card">
            <div className="card-header">
              <h3>
                <Users />
                Care Team
              </h3>
              <button className="clarity-button clarity-button-tertiary">
                View All
              </button>
            </div>
            <div className="care-team-list">
              {careTeam.map((member) => (
                <div key={member.id} className="care-team-item">
                  <div className="care-team-photo">
                    <img 
                      src={member.photo} 
                      alt={member.name}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const initials = member.name.split(' ').map(n => n[0]).join('');
                          const fallback = document.createElement('div');
                          fallback.className = 'care-team-initials';
                          fallback.textContent = initials;
                          fallback.style.cssText = `
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            width: 100%;
                            height: 100%;
                            background-color: var(--color-primary-100);
                            color: var(--color-primary-500);
                            font-weight: 600;
                            font-size: 14px;
                            border-radius: 50%;
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="care-team-content">
                    <h4>{member.name}</h4>
                    <p className="care-team-role">{member.role}</p>
                    <div className="care-team-contact">
                      <span className="contact-item">
                        <Mail />
                        {member.contact}
                      </span>
                    </div>
                  </div>
                  <div className="care-team-actions">
                    <button className="clarity-button clarity-button-secondary">
                      <Mail />
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Health Timeline */}
        <section className="dashboard-section">
          <div className="section-header">
            <h3>Health Timeline</h3>
            <div className="section-actions">
              <button className="clarity-button clarity-button-tertiary">
                Export Timeline
              </button>
            </div>
          </div>
          <div className="timeline-container">
            <div className="timeline-item">
              <div className="timeline-marker timeline-normal">
                <CheckCircle />
              </div>
              <div className="timeline-content">
                <h4>Annual Physical Completed</h4>
                <p>Dr. Sarah Johnson - All vitals normal</p>
                <span className="timeline-date">January 15, 2024</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker timeline-caution">
                <AlertCircle />
              </div>
              <div className="timeline-content">
                <h4>Lab Results Available</h4>
                <p>Lipid panel shows elevated cholesterol</p>
                <span className="timeline-date">January 15, 2024</span>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker timeline-upcoming">
                <Calendar />
              </div>
              <div className="timeline-content">
                <h4>Cardiology Follow-up Scheduled</h4>
                <p>Dr. Michael Chen - Heart Center</p>
                <span className="timeline-date">January 25, 2024</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
