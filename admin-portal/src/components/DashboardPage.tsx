import { Home, Calendar, FileText, Pill, MessageSquare, CreditCard, Users, ClipboardList, Settings, BarChart, Shield, Activity, Database, FlaskConical, CheckCircle, Package, AlertTriangle, TrendingUp, Image, Monitor, Receipt } from 'lucide-react'
import DashboardLayout from './shared/DashboardLayout'
import DashboardCard from './shared/DashboardCard'
import Breadcrumb from './shared/Breadcrumb'
import './DashboardPage.css'

const PORTAL_COLOR = '#B19EED'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: Home },
  { id: 'users', label: 'User Management', path: '/users', icon: Users },
  { id: 'settings', label: 'System Settings', path: '/settings', icon: Settings },
  { id: 'audit', label: 'Audit Logs', path: '/audit', icon: FileText },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart },
  { id: 'security', label: 'Security', path: '/security', icon: Shield },
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
      userName="Admin User"
      userRole="System Administrator"
    >
      <div className="dashboard-page">
        <Breadcrumb items={[{ label: 'Home', path: '/dashboard' }, { label: 'Dashboard' }]} />
        
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Welcome back, Admin User</h1>
            <p className="dashboard-subtitle">Here's what's happening with your admin portal today.</p>
          </div>
        </div>

        <div className="dashboard-cards-grid">
          <DashboardCard
            title="Active Users"
            subtitle="12 online now"
            icon={<Users size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">248</span>
              <span className="metric-trend trend-positive">+5</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="System Health"
            subtitle="All systems operational"
            icon={<Activity size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">98%</span>
              <span className="metric-trend trend-positive">0</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Security Alerts"
            subtitle="Requires attention"
            icon={<Shield size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">2</span>
              <span className="metric-trend trend-positive">+2</span>
            </div>
          </DashboardCard>
          <DashboardCard
            title="Data Backup"
            subtitle="Last: 2 hours ago"
            icon={<Database size={24} />}
          >
            <div className="card-metric">
              <span className="metric-value">100%</span>
              <span className="metric-trend trend-positive">0</span>
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
