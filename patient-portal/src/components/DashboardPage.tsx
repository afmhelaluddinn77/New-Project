import { Home, Calendar, FileText, Pill, MessageSquare, CreditCard, Users, ClipboardList, Settings, BarChart, Shield, Activity, Database, FlaskConical, CheckCircle, Package, AlertTriangle, TrendingUp, Image, Monitor, Receipt } from 'lucide-react'
import DashboardLayout from './shared/DashboardLayout'
import DashboardCard from './shared/DashboardCard'
import Breadcrumb from './shared/Breadcrumb'
import './DashboardPage.css'

const PORTAL_COLOR = '#7FB3FF'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home },
  { id: 'appointments', label: 'Appointments', path: '/appointments', icon: Calendar },
  { id: 'records', label: 'Medical Records', path: '/records', icon: FileText },
  { id: 'medications', label: 'Medications', path: '/medications', icon: Pill },
  { id: 'messages', label: 'Messages', path: '/messages', icon: MessageSquare },
  { id: 'billing', label: 'Billing', path: '/billing', icon: CreditCard },
]

interface DashboardPageProps {
  portalType: string
}

export default function DashboardPage({ portalType }: DashboardPageProps) {
  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      portalTitle="{portalType} Portal"
      portalColor={PORTAL_COLOR}
      userName="John Doe"
      userRole="Patient"
    >
      <div className="dashboard-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />
        
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, John Doe</h1>
            <p className="dashboard-subtitle">Here's what's happening with your patient portal today.</p>
          </div>
        </div>

        <div className="dashboard-cards-grid">
          <DashboardCard
            title="Upcoming Appointments"
            subtitle="Next: Tomorrow at 10:00 AM"
            icon={<Calendar size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">2</span>
              <span className="metric-trend trend-positive">+1</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Active Medications"
            subtitle="2 refills needed"
            icon={<Pill size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">5</span>
              <span className="metric-trend trend-positive">0</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Unread Messages"
            subtitle="From Dr. Smith"
            icon={<MessageSquare size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">3</span>
              <span className="metric-trend trend-positive">+3</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Test Results"
            subtitle="New result available"
            icon={<FileText size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">1</span>
              <span className="metric-trend trend-positive">+1</span>
            </div>
          </DashboardCard>
        </div>

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h2 className="section-title">Recent Activity</h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <FileText size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">New record added</p>
                  <p className="activity-time">2 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">User session started</p>
                  <p className="activity-time">4 hours ago</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Shield size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Security check completed</p>
                  <p className="activity-time">6 hours ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions">
              <button className="quick-action-btn">
                <Calendar size={20} />
                <span>Schedule</span>
              </button>
              <button className="quick-action-btn">
                <FileText size={20} />
                <span>New Record</span>
              </button>
              <button className="quick-action-btn">
                <MessageSquare size={20} />
                <span>Messages</span>
              </button>
              <button className="quick-action-btn">
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
